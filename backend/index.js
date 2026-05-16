"use strict";

const mysql = require("mysql2/promise");

const {
  DynamoDBClient,
  BatchGetItemCommand,
  QueryCommand,
  TransactWriteItemsCommand
} = require("@aws-sdk/client-dynamodb");

// ===============================
// DynamoDB client
// ===============================
const dynamo = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1"
});

// ===============================
// MySQL connection reuse (with auto-reconnect)
// ===============================
let conn;

async function getConnection() {
  // If connection exists, ping to verify it's still alive
  if (conn) {
    try {
      await conn.ping();
      return conn;
    } catch (err) {
      console.warn("MySQL connection lost, reconnecting...");
      conn = null;
    }
  }

  conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 5000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  });

  return conn;
}

// ===============================
// MAIN HANDLER
// ===============================
exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event, null, 2));

  const method = event.requestContext?.http?.method;
  const rawPath = event.rawPath || "/";
  const pathParams = event.pathParameters || {};
  const queryParams = event.queryStringParameters || {};

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return json({ message: "Invalid JSON body" }, 400);
  }

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return json({}, 200);
  }

  // -----------------------------------------------
  // Path matching helpers — handles both:
  //   /events             (Lambda Function URL)
  //   /prod/events        (API Gateway with stage)
  // -----------------------------------------------
  function pathIs(route) {
    return rawPath === route || rawPath.endsWith(route);
  }

  function pathStartsWith(prefix) {
    if (rawPath.startsWith(prefix + "/") || rawPath === prefix) return true;
    // Handle stage prefix: /prod/attendees/123
    const parts = rawPath.split("/").filter(Boolean);
    const prefixParts = prefix.split("/").filter(Boolean);
    for (let i = 0; i <= parts.length - prefixParts.length; i++) {
      if (prefixParts.every((p, j) => parts[i + j] === p)) return true;
    }
    return false;
  }

  function extractId(segment) {
    // Try pathParameters first (API Gateway sets these)
    if (pathParams["event_id"]) return pathParams["event_id"];

    // Fallback: manually parse from rawPath
    // e.g. /event/123 or /prod/event/123
    const parts = rawPath.split("/").filter(Boolean);
    const idx = parts.indexOf(segment);
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return null;
  }

  try {
    // ===============================
    // GET /events
    // ===============================
    if (method === "GET" && pathIs("/events")) {
      const connection = await getConnection();
      const [rows] = await connection.execute(`
        SELECT event_id, title, description, start_at, venue, banner_url, created_at
        FROM events
        ORDER BY start_at ASC
      `);
      return json(rows);
    }

    // ===============================
    // GET /event/{event_id}
    // ===============================
    if (method === "GET" && pathStartsWith("/event")) {
      const eventId = extractId("event");
      if (!eventId) return json({ message: "Missing event_id" }, 400);

      const connection = await getConnection();
      const [rows] = await connection.execute(
        "SELECT * FROM events WHERE event_id = ?",
        [eventId]
      );

      if (rows.length === 0) {
        return json({ message: "Event not found" }, 404);
      }

      return json(rows[0]);
    }

    // ===============================
    // GET /stats/{event_id}
    // ===============================
    if (method === "GET" && pathStartsWith("/stats")) {
      const eventId = extractId("stats");
      if (!eventId) return json({ message: "Missing event_id" }, 400);

      const keys = ["Yes", "No"].map(r => ({
        pk: { S: `EVENT#${eventId}` },
        sk: { S: `RESPONSE#${r}` }
      }));

      const result = await dynamo.send(
        new BatchGetItemCommand({
          RequestItems: {
            "event-rsvp-responses": { Keys: keys }
          }
        })
      );

      const items = result.Responses?.["event-rsvp-responses"] || [];

      const counts = { Yes: 0, No: 0 };
      for (const item of items) {
        const key = item.sk.S.split("#")[1]; // "Yes" or "No"
        counts[key] = Number(item.count?.N || 0);
      }

      return json(counts);
    }

    // ===============================
    // POST /rsvp
    // ===============================
    if (method === "POST" && pathIs("/rsvp")) {
      const { event_id, full_name, email, response } = body;

      if (!event_id || !full_name || !email || !response) {
        return json(
          { message: "Missing required fields: event_id, full_name, email, response" },
          400
        );
      }

      if (!["Yes", "No"].includes(response)) {
        return json({ message: "response must be 'Yes' or 'No'" }, 400);
      }

      const now = Date.now();

      try {
        await dynamo.send(
          new TransactWriteItemsCommand({
            TransactItems: [
              {
                Put: {
                  TableName: "event-rsvp-responses",
                  Item: {
                    pk: { S: `EVENT#${event_id}` },
                    sk: { S: `RESPONDENT#${email}` },
                    full_name: { S: full_name },
                    email: { S: email },
                    response: { S: response },
                    timestamp: { N: String(now) }
                  },
                  // FIX: use sk (composite key) to detect duplicate per email+event
                  ConditionExpression: "attribute_not_exists(sk)"
                }
              },
              {
                Update: {
                  TableName: "event-rsvp-responses",
                  Key: {
                    pk: { S: `EVENT#${event_id}` },
                    sk: { S: `RESPONSE#${response}` }
                  },
                  UpdateExpression: "ADD #cnt :one",
                  ExpressionAttributeNames: {
                    "#cnt": "count"
                  },
                  ExpressionAttributeValues: {
                    ":one": { N: "1" }
                  }
                }
              }
            ]
          })
        );

        return json({ message: "RSVP recorded successfully" });

      } catch (err) {
        // FIX: TransactWriteItems throws TransactionCanceledException (not ConditionalCheckFailedException)
        if (err.name === "TransactionCanceledException") {
          const reasons = err.CancellationReasons || [];
          const isDuplicate = reasons.some(r => r.Code === "ConditionalCheckFailed");
          if (isDuplicate) {
            return json(
              { message: "Already RSVP'd for this event", code: "DUPLICATE" },
              409
            );
          }
          console.error("Transaction cancelled:", JSON.stringify(reasons));
          return json({ error: "Transaction failed", details: reasons }, 500);
        }

        console.error("RSVP error:", err);
        return json({ error: err.message }, 500);
      }
    }

    // ===============================
    // GET /attendees/{event_id}
    // ===============================
    if (method === "GET" && pathStartsWith("/attendees")) {
      const eventId = extractId("attendees");
      if (!eventId) return json({ message: "Missing event_id" }, 400);

      const responseType = queryParams.response;

      const result = await dynamo.send(
        new QueryCommand({
          TableName: "event-rsvp-responses",
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
          ExpressionAttributeValues: {
            ":pk": { S: `EVENT#${eventId}` },
            ":prefix": { S: "RESPONDENT#" }
          }
        })
      );

      let attendees = (result.Items || []).map(item => ({
        full_name: item.full_name?.S,
        email: item.email?.S,
        response: item.response?.S,
        timestamp: Number(item.timestamp?.N)
      }));

      if (responseType) {
        attendees = attendees.filter(a => a.response === responseType);
      }

      return json(attendees);
    }

    return json({ message: "Route not found", path: rawPath, method }, 404);

  } catch (err) {
    console.error("UNHANDLED ERROR:", err);
    return json({ error: err.message }, 500);
  }
};

// ===============================
// RESPONSE HELPER
// ===============================
function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify(data)
  };
}
