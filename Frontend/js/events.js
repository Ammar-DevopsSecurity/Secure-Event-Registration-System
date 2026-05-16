/* ===== Event-related API helpers ===== */
async function fetchEvents() {
    return await apiCall('/events');
}

async function fetchEventDetails(eventId) {
    return await apiCall(`/event/${eventId}`);
}

async function fetchEventStats(eventId) {
    return await apiCall(`/stats/${eventId}`);
}

async function fetchEventAttendees(eventId) {
    return await apiCall(`/attendees/${eventId}`);
}

/* ===== Handle RSVP form submission ===== */
async function submitRSVP(event, eventId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const rsvpData = {
        event_id: eventId,
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        response: formData.get('response')
    };

    const btn = event.target.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        await apiCall('/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rsvpData)
        });

        showMessage('RSVP submitted successfully!', 'success');
        event.target.reset();

        setTimeout(() => {
            openEventModal(eventId);
            loadEventStats(eventId);
        }, 1000);
    } catch (error) {
        const errorMessage = error.message || 'RSVP failed';
        showMessage(errorMessage, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

/* ===== In-page alert message ===== */
function showMessage(message, type) {
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;

    const form = document.querySelector('.rsvp-form');
    if (form) {
        form.parentNode.insertBefore(messageDiv, form);
    }

    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) messageDiv.parentNode.removeChild(messageDiv);
        }, 5000);
    }
}

/* ===== Render the event cards on the homepage grid ===== */
function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');

    if (!events || events.length === 0) {
        grid.innerHTML = '<div class="loading"><span>No events found.</span></div>';
        return;
    }

    grid.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEventModal('${event.event_id}')">
            <div class="event-banner" style="background-image: url('${event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}')"></div>
            <div class="event-content">
                <span class="event-tag">EVENT / ${event.event_id || 'AWSUGPH'}</span>
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description || 'Join us for an amazing AWS community event!'}</div>
                <div class="event-details">
                    <div class="event-detail">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${event.venue || 'Venue TBA'}
                    </div>
                    <div class="event-detail">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${formatDate(event.start_at)}
                    </div>
                </div>
                <div class="event-card-footer">
                    <span class="card-cta">
                        View details
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

/* ===== Refresh stats without reloading modal ===== */
async function loadEventStats(eventId) {
    try {
        const stats = await fetchEventStats(eventId);
        const yesEl = document.getElementById(`yes-${eventId}`);
        const noEl = document.getElementById(`no-${eventId}`);
        if (yesEl) yesEl.textContent = stats.Yes || 0;
        if (noEl) noEl.textContent = stats.No || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/* ===== Open the event details modal ===== */
async function openEventModal(eventId) {
    try {
        const modal = document.getElementById('eventModal');
        const modalContent = document.getElementById('modalContent');

        modalContent.innerHTML = `
            <div style="padding: 60px; display: flex; align-items: center; justify-content: center; gap: 12px; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted);">
                <div class="loading-spinner"></div>
                Loading event details...
            </div>`;

        modal.style.display = 'flex';
        modal.classList.add('open');

        const [event, stats, attendees] = await Promise.all([
            fetchEventDetails(eventId),
            fetchEventStats(eventId),
            fetchEventAttendees(eventId)
        ]);

        const banner = event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';

        const goingAttendees = attendees.filter(a => a.response.toLowerCase() === 'yes');
        const notGoingAttendees = attendees.filter(a => a.response.toLowerCase() === 'no');

        modalContent.innerHTML = `
            <div class="modal-banner" style="background-image:url('${banner}')"></div>

            <div class="modal-header">
                <div class="modal-eyebrow">AWS USER GROUP PH · 2025</div>
                <h1 class="modal-title">${event.title}</h1>
                <p class="modal-desc">${event.description || ''}</p>
                <div class="modal-details">
                    <div class="event-detail">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${event.venue || 'TBA'}
                    </div>
                    <div class="event-detail">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${formatDate(event.start_at)}
                    </div>
                    <div class="event-detail">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${formatTime(event.start_at)}
                    </div>
                </div>
            </div>

            <div class="modal-body">

                <!-- RSVP Form -->
                <div class="section">
                    <h2 class="section-title">Register for Event</h2>
                    <form class="rsvp-form" onsubmit="submitRSVP(event, '${eventId}')">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="fullName">FULL NAME *</label>
                                <input type="text" id="fullName" name="full_name" placeholder="Your full name" required>
                            </div>
                            <div class="form-group">
                                <label for="email">EMAIL ADDRESS *</label>
                                <input type="email" id="email" name="email" placeholder="you@example.com" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="response">ATTENDANCE *</label>
                            <select id="response" name="response" required>
                                <option value="">Select your response</option>
                                <option value="Yes">Yes, I'll be there!</option>
                                <option value="No">No, I can't make it</option>
                            </select>
                        </div>
                        <button type="submit" class="submit-btn">Submit Registration →</button>
                    </form>
                </div>

                <!-- Statistics -->
                <div class="section">
                    <h2 class="section-title">Event Statistics</h2>
                    <div class="stats-bar">
                        <div class="stat-card yes-card">
                            <span class="stat-number" id="yes-${eventId}">${stats.Yes || 0}</span>
                            <span class="stat-label">Attending</span>
                        </div>
                        <div class="stat-card no-card">
                            <span class="stat-number" id="no-${eventId}">${stats.No || 0}</span>
                            <span class="stat-label">Not Attending</span>
                        </div>
                    </div>

                    <div class="attendees-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Going</th>
                                    <th>Not Going</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        ${goingAttendees.map(a => `<div>${a.full_name}</div>`).join('') || '<em>No confirmed attendees yet.</em>'}
                                    </td>
                                    <td>
                                        ${notGoingAttendees.map(a => `<div>${a.full_name}</div>`).join('') || '<em>No declines yet.</em>'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;

    } catch (error) {
        document.getElementById('modalContent').innerHTML = `
            <div style="padding: 40px;">
                <div class="error-state">Error loading event details: ${error.message}</div>
            </div>`;
    }
}
