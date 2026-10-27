
const API_URL = '/api/subscribers';
const PUBLICATION_API = '/api/publications';

const form = document.getElementById('subscriberForm');
const subscriberList = document.getElementById('subscriberList');
const searchInput = document.getElementById('searchInput');
const listMessage = document.getElementById('listMessage');

const publicationForm = document.getElementById('publicationForm');
const publicationList = document.getElementById('publicationList');
const publicationMessage = document.getElementById('publicationMessage');

let subscribers = [];
let publications = [];

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

async function loadSubscribers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Unable to load subscribers');

        subscribers = await response.json();
        updateDashboard();
        renderSubscribers();
    } catch (error) {
        subscriberList.innerHTML =
            '<tr><td colspan="5">Unable to load subscribers.</td></tr>';
        listMessage.textContent = error.message;
    }
}

function updateDashboard() {
    document.getElementById('totalCount').textContent = subscribers.length;
    document.getElementById('activeCount').textContent =
        subscribers.filter(s => s.subscription_status === 'Active').length;
    document.getElementById('pausedCount').textContent =
        subscribers.filter(s => s.subscription_status === 'Paused').length;
    document.getElementById('cancelledCount').textContent =
        subscribers.filter(s => s.subscription_status === 'Cancelled').length;
}

function renderSubscribers() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = subscribers.filter(s =>
        [s.subscriber_id, s.full_name, s.phone, s.address, s.subscription_status]
            .some(value => String(value ?? '').toLowerCase().includes(query))
    );

    if (!filtered.length) {
        subscriberList.innerHTML =
            '<tr><td colspan="6">No subscribers found.</td></tr>';
        listMessage.textContent = 'No matching subscriber records.';
        return;
    }

    subscriberList.innerHTML = filtered.map(s => {
        const status = s.subscription_status || 'Active';

        return `
            <tr>
                <td>${s.subscriber_id}</td>
                <td><strong>${escapeHTML(s.full_name)}</strong></td>
                <td>${escapeHTML(s.phone)}</td>
                <td>${escapeHTML(s.address)}</td>
                <td><span class="status-badge ${status.toLowerCase()}">${escapeHTML(status)}</span></td>
                <td>
                    <button type="button" onclick="editSubscriber(${s.subscriber_id})">Edit</button>
                    <button type="button" onclick="deleteSubscriber(${s.subscriber_id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    listMessage.textContent =
        `Showing ${filtered.length} of ${subscribers.length} subscribers`;
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    const full_name = document.getElementById('full_name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!full_name || !phone || !address) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, phone, address })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Failed to add subscriber.');

        form.reset();
        await loadSubscribers();
        alert('Subscriber added successfully!');
    } catch (error) {
        alert(error.message);
    }
});

async function editSubscriber(id) {
    const s = subscribers.find(item => item.subscriber_id === id);
    if (!s) return;

    const full_name = prompt('Enter subscriber name:', s.full_name);
    if (full_name === null) return;

    const phone = prompt('Enter phone number:', s.phone);
    if (phone === null) return;

    const address = prompt('Enter address:', s.address);
    if (address === null) return;

    if (!full_name.trim() || !phone.trim() || !address.trim()) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: full_name.trim(),
                phone: phone.trim(),
                address: address.trim()
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Update failed.');

        await loadSubscribers();
        alert('Subscriber updated successfully!');
    } catch (error) {
        alert('Update failed: ' + error.message);
    }
}

async function deleteSubscriber(id) {
    const s = subscribers.find(item => item.subscriber_id === id);
    if (!s || !confirm(`Delete subscriber "${s.full_name}"?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Delete failed.');

        await loadSubscribers();
        alert('Subscriber deleted successfully!');
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}

searchInput.addEventListener('input', renderSubscribers);

async function loadPublications() {
    try {
        const response = await fetch(PUBLICATION_API);
        if (!response.ok) throw new Error('Unable to load newspapers.');

        publications = await response.json();
        renderPublications();
    } catch (error) {
        publicationList.innerHTML =
            '<tr><td colspan="4">Unable to load newspapers. Check the server.</td></tr>';
        publicationMessage.textContent = error.message;
    }
}

function renderPublications() {
    if (!publications.length) {
        publicationList.innerHTML =
            '<tr><td colspan="5">No newspapers found.</td></tr>';
        return;
    }

    publicationList.innerHTML = publications.map(p => `
        <tr>
            <td>${p.publication_id}</td>
            <td><strong>${escapeHTML(p.publication_name)}</strong></td>
            <td>₹${Number(p.monthly_price).toFixed(2)}</td>
            <td>
                <span class="status-badge ${(p.status || 'Active').toLowerCase()}">
                    ${escapeHTML(p.status || 'Active')}
                </span>
            </td>
            <td>
                <button type="button" onclick="editPublication(${p.publication_id})">Edit</button>
                <button type="button" onclick="deletePublication(${p.publication_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function editPublication(id) {
    const p = publications.find(item => item.publication_id === id);
    if (!p) return;

    const name = prompt('Enter newspaper name:', p.publication_name);
    if (name === null) return;

    const price = prompt('Enter monthly price:', p.monthly_price);
    if (price === null) return;

    if (!name.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
        alert('Enter a valid name and price.');
        return;
    }

    try {
        const response = await fetch(`${PUBLICATION_API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publication_name: name.trim(),
                monthly_price: Number(price)
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Update failed.');

        await loadPublications();
        alert('Newspaper updated successfully!');
    } catch (error) {
        alert(error.message);
    }
}

async function deletePublication(id) {
    const p = publications.find(item => item.publication_id === id);
    if (!p || !confirm(`Delete newspaper "${p.publication_name}"?`)) return;

    try {
        const response = await fetch(`${PUBLICATION_API}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Delete failed.');

        await loadPublications();
        alert('Newspaper deleted successfully!');
    } catch (error) {
        alert(error.message);
    }
}


publicationForm.addEventListener('submit', async event => {
    event.preventDefault();

    const publication_name =
        document.getElementById('publication_name').value.trim();
    const monthly_price =
        Number(document.getElementById('monthly_price').value);

    if (!publication_name || !Number.isFinite(monthly_price) || monthly_price <= 0) {
        alert('Enter a newspaper name and a valid monthly price.');
        return;
    }

    try {
        const response = await fetch(PUBLICATION_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publication_name,
                monthly_price,
                status: 'Active'
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Unable to add newspaper.');

        publicationForm.reset();
        publicationMessage.textContent = 'Newspaper added successfully!';
        await loadPublications();
    } catch (error) {
        publicationMessage.textContent = error.message;
    }
});

loadSubscribers();
loadPublications();
