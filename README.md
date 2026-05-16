<div align="center">

<br/>

```
███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗    ███████╗██╗   ██╗███████╗███╗   ██╗████████╗
██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝    ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝
███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗      █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   
╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝      ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   
███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗    ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   
╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝  
```

# 🛡️ Secure Event Registration System

**A production-grade, cloud-native event management platform built on AWS**

## 🚀 Try the Project Live

<p align="center">
  <a href="https://d70jc8rzqeqs.cloudfront.net/" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20OPEN%20LIVE%20PROJECT-CLICK%20HERE-0A66C2?style=for-the-badge&logo=amazonaws&logoColor=white" />
  </a>
</p>

<br/>

[![AWS](https://img.shields.io/badge/AWS-Powered-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Lambda](https://img.shields.io/badge/Lambda-Serverless-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda)
[![MySQL](https://img.shields.io/badge/MySQL-RDS-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://aws.amazon.com/rds)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb)
[![CloudFront](https://img.shields.io/badge/CloudFront-CDN-8C4FFF?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/cloudfront)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

<br/>

> *Built by [**Ammar**](https://github.com/Ammar-DevopsSecurity) — DevOps & Cloud Security Engineer*

<br/>

</div>

---

## 📌 What Is This?

The **Secure Event Registration System** is a full-stack, serverless web application deployed entirely on AWS. It allows users to browse events, view real-time RSVP statistics, and register as attendees — all backed by a dual-database architecture (MySQL + DynamoDB), a secure serverless API, and a globally distributed frontend via CloudFront.

This project was built to demonstrate **real-world cloud architecture skills**: designing secure, scalable infrastructure from scratch using AWS-native services, not just theory.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🔍 **Event Browsing** | Dynamic event listing with live data from RDS MySQL |
| 📊 **Real-Time Stats** | Live RSVP counts and attendee analytics per event |
| 📝 **RSVP Registration** | Form-based registration with serverless backend processing |
| 🗄️ **Dual Database** | Relational (MySQL/RDS) + NoSQL (DynamoDB) hybrid data model |
| ⚡ **Serverless Backend** | AWS Lambda functions — zero server management |
| 🌐 **Global CDN** | CloudFront distribution for low-latency, cached static delivery |
| 🔒 **Secure by Design** | Environment variable injection, CORS policy enforcement, IAM roles |
| 📦 **S3 Hosting** | Static assets hosted on S3 with bucket policy hardening |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                   index.html │ app.js │ style.css                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AWS CloudFront (CDN)                              │
│              Global edge caching + HTTPS termination                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
          ┌─────────────────┴──────────────────┐
          │                                    │
          ▼                                    ▼
┌──────────────────┐               ┌───────────────────────┐
│   Amazon S3      │               │   API Gateway (REST)  │
│  Static Hosting  │               │  /events  /rsvp  etc. │
└──────────────────┘               └────────────┬──────────┘
                                                │  Invoke
                                                ▼
                                   ┌───────────────────────┐
                                   │    AWS Lambda         │
                                   │    (Node.js)          │
                                   │    index.js handler   │
                                   └──────┬────────┬───────┘
                                          │        │
                        ┌─────────────────┘        └──────────────────┐
                        ▼                                              ▼
           ┌────────────────────┐                     ┌───────────────────────┐
           │  Amazon RDS        │                     │    Amazon DynamoDB    │
           │  MySQL (eventsdb)  │                     │  (RSVP / NoSQL data)  │
           └────────────────────┘                     └───────────────────────┘
```

**Stack:** `Frontend → CloudFront → S3` | `API → API Gateway → Lambda → RDS + DynamoDB`

---

## 📁 Project Structure

```
secure-event-registration/
│
├── 📄 index.html             # Main UI shell
├── 🎨 style.css              # Application styling
├── 🚀 app.js                 # Entry point — bootstraps event loading
├── 📅 events.js              # Event listing, modal, and RSVP logic
├── 🔧 utils.js               # Shared API helpers & formatters
│
├── ☁️  index.js              # AWS Lambda handler (Node.js backend)
├── 🗄️  database-notes.txt    # SQL schema & setup commands
│
├── 📦 package.json
├── 🔒 package-lock.json
└── 🚫 .gitignore
```

---

## 🔌 REST API Reference

Base URL: `https://<api-id>.execute-api.<region>.amazonaws.com/prod`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | Fetch all upcoming events |
| `GET` | `/event/{event_id}` | Fetch a single event's details |
| `GET` | `/stats/{event_id}` | Get live RSVP count & stats |
| `GET` | `/attendees/{event_id}` | Retrieve full attendee list |
| `POST` | `/rsvp` | Submit a new RSVP registration |

> All routes are secured behind API Gateway with CORS enforcement.

---

## ⚙️ Environment Configuration

Lambda environment variables (set in AWS Console → Lambda → Configuration → Environment Variables):

| Variable | Example Value | Purpose |
|----------|--------------|---------|
| `REGION` | `ap-southeast-1` | AWS region for SDK clients |
| `DB_HOST` | `mydb.xxxxx.rds.amazonaws.com` | RDS MySQL hostname |
| `DB_USER` | `admin` | Database user |
| `DB_PASS` | `••••••••` | Database password (use Secrets Manager in prod) |
| `DB_NAME` | `eventsdb` | Target database name |

> ⚠️ **Security note:** Never hardcode credentials. This project uses environment variable injection; production deployments should integrate **AWS Secrets Manager** or **AWS Parameter Store**.

---

## 🚀 Deployment Guide

### 1. Backend — AWS Lambda

```bash
# Clone the repo
git clone https://github.com/Ammar-DevopsSecurity/secure-event-registration.git
cd secure-event-registration

# Install Lambda dependencies
npm install

# Zip and upload to Lambda
zip -r function.zip index.js node_modules package.json
aws lambda update-function-code \
  --function-name SecureEventHandler \
  --zip-file fileb://function.zip
```

### 2. Database — Amazon RDS (MySQL)

```bash
# Connect to your RDS instance
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Run the setup commands from:
# database-notes.txt
```

### 3. Frontend — S3 + CloudFront

```bash
# Upload static assets to S3
aws s3 sync . s3://your-bucket-name \
  --exclude "*.json" \
  --exclude "*.txt" \
  --exclude "index.js" \
  --exclude ".gitignore"

# Invalidate CloudFront cache after updates
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

> After uploading, hard-refresh your browser:
> - **Windows:** `Ctrl + F5`
> - **Mac:** `Cmd + Shift + R`

---

## 🔒 Security Design Decisions

This project goes beyond "just making it work" — it follows cloud security best practices:

- **No secrets in source code** — all credentials injected via Lambda environment variables
- **CORS policy enforced** at API Gateway to restrict cross-origin access
- **IAM Least Privilege** — Lambda execution role has only the permissions it needs
- **S3 Bucket Hardening** — public access limited to CloudFront origin only
- **HTTPS Everywhere** — CloudFront enforces HTTPS for all client traffic
- **Input validation** — RSVP endpoint validates request body before database writes

---

## 🧠 What I Learned Building This

- Designing a **serverless, event-driven backend** with AWS Lambda and API Gateway
- Implementing a **hybrid database model** (relational + NoSQL) for different data access patterns
- Configuring **CloudFront CDN** with custom invalidation strategies for cache management
- Applying **AWS security fundamentals**: IAM roles, environment secrets, CORS, S3 bucket policies
- Debugging **cross-service integration issues** between API Gateway, Lambda, and RDS inside a VPC

---

## 📈 Future Improvements

- [ ] 🔐 Add AWS Cognito for user authentication and protected RSVP routes
- [ ] 📧 SES email confirmations on successful RSVP
- [ ] 🧪 Unit tests for Lambda handlers with Jest
- [ ] 🏗️ Infrastructure-as-Code migration to AWS CDK or Terraform
- [ ] 📊 CloudWatch dashboard for API and database monitoring
- [ ] 🔑 Migrate secrets to AWS Secrets Manager

---

## 👤 About Me

<div align="center">

**Ammar** | DevOps & Cloud Security Engineer

I'm passionate about building secure, scalable infrastructure on AWS and automating everything that can be automated. This project is part of my portfolio of hands-on cloud engineering work.

[![GitHub](https://img.shields.io/badge/GitHub-Ammar--DevopsSecurity-181717?style=for-the-badge&logo=github)](https://github.com/Ammar-DevopsSecurity)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ammar%20DevOps%20Security-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ammar-devopssecurity-82510340a)

</div>

---

<div align="center">

*If this project helped you or you found it interesting, a ⭐ on the repo goes a long way!*

**Built with ☁️ on AWS | © 2025 Ammar-DevopsSecurity**

</div>
