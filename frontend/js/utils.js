// Base URL of your AWS API Gateway endpoint.
const API_BASE_URL = 'https://ce4k2dxv91.execute-api.us-east-2.amazonaws.com/dev';

/* Converts a date string (e.g. 2025-11-07T00:00:00Z)
  into a readable format like "Friday, November 7, 2025".
  If no date is available, it shows "Date TBA". */
function formatDate(dateString) {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/* Converts a date string into a readable time (e.g. "10:30 AM").
  Returns "Time TBA" if there's no time data. */
function formatTime(dateString) {
    if (!dateString) return 'Time TBA';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* Closes the event modal popup by hiding it from view. */
function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('open');
    modal.style.display = 'none';
}

/* Detects clicks outside the modal window and closes it automatically. */
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeModal();
    }
}

/* Generic helper function for calling your AWS API Gateway endpoints. */
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        // Handle non-JSON or empty responses gracefully
        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error(`Invalid JSON response from server`);
        }

        if (!response.ok) {
            const errorMessage = data.message || `API error: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
