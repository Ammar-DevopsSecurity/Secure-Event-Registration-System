/* ===== App entry point =====
Loads all events on page load and kicks off the grid render. */
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('eventsGrid');

    try {
        const events = await fetchEvents();
        displayEvents(events);
    } catch (error) {
        grid.innerHTML = `<div class="error-state">Failed to load events: ${error.message}</div>`;
    }
});
