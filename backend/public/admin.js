const backendUrl = 'http://localhost:8000/api/';

// Fetch and display events
async function fetchEvents() {
    try {
        console.log(backendUrl);
        const response = await fetch(`${backendUrl}event/list`);
        const events = await response.json();
        console.log(events);

        const eventListDiv = document.getElementById('event-list');
        eventListDiv.innerHTML = '';  // Clear previous content

        events.forEach(event => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = event.id;  // Assuming each event has a unique 'id'

            const label = document.createElement('label');
            label.textContent = `${event.title} (${event.date})`;

            const lineBreak = document.createElement('br');

            eventListDiv.appendChild(checkbox);
            eventListDiv.appendChild(label);
            eventListDiv.appendChild(lineBreak);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to fetch events');
    }
}

// Handle event removal based on checked checkboxes
function handleRemoveSelected() {
    const checkedEvents = document.querySelectorAll('#event-list input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkedEvents).map(checkbox => checkbox.value);

    if (selectedIds.length === 0) {
        alert('No events selected for removal');
        return;
    }

    const data = { event_ids: selectedIds };

    fetch(`${backendUrl}event/remove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        alert('Selected events removed successfully');
        fetchEvents();  // Refresh the list after removing events
    })
    .catch(error => {
        console.error('Error removing events:', error);
        alert('Failed to remove selected events');
    });
}

function handleSubmit(action) {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const image_url = document.getElementById('image_url').value;
    const date = document.getElementById('date').value;

    const data = { username, password, title, description, image_url, date };

    fetch(`${backendUrl}${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        alert(`Item ${action === 'event/add' ? 'added' : 'removed'} successfully`);
    })
    .catch(error => {
        console.error('There was an error:', error);
        alert('Invalid credentials or request failed');
    });
}

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('secret');

    if (secret !== process.env.ADMIN_SECRET) {
        alert('Access Denied');
        window.location.href = 'http://localhost:3000';
    }

    fetchEvents();  // Fetch events on page load
};