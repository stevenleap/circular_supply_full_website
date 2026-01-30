// Init Vars
let isAuthenticated = false;
let currentUserEmail = null;


// Check Authentication Atatus
async function checkAuth() {
    try {
        const response = await fetch('/api/user/subscription', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return false;
        }

        if (response.status === 403) {
            const data = await response.json();
            if (data.code === 'NOT_WHITELISTED') {
                alert('Your account is not whitelisted. Please contact admin.');
                window.location.href = '/login.html';
                return false;
            }
        }

        if (response.status === 404) {
            const data = await response.json();
            if (data.code === 'NO_SUBSCRIPTION') {
                alert('No subscription found. Please set up a subscription first.');
                // Redirect to subscription setup page or show subscription options
                return false;
            }
        }

        if (!response.ok) {
            throw new Error('Failed to verify access');
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

function setupEventListeners() {
    document.getElementById('whitelistBtn').addEventListener('click', whitelistEmail);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('closeModal').addEventListener('click', hideModal);
    document.getElementById('saveSubscription').addEventListener('click', saveSubscriptionChanges);
}

// Manage Web Users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            // Main user row
            const tr = document.createElement('tr');
            tr.className = 'user-row';
            tr.innerHTML = `
                <td>${user.email}</td>
                <td>${user.plan || 'No Plan'}</td>
                <td>${user.status || 'Inactive'}</td>
                <td>
                    <button onclick="manageSubscription('${user.email}')" class="manage-btn">
                        Manage
                    </button>
                    <button onclick="toggleDetails('${user.email}')" class="details-btn">
                        Show Details
                    </button>
                </td>
            `;
            tbody.appendChild(tr);

            // Details row (hidden by default)
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'details-row';
            detailsRow.id = `details-${user.email.replace('@', '-at-')}`;
            detailsRow.style.display = 'none';

            // Format dates and activities
            const nextDelivery = user.nextDeliveryDate ? 
                new Date(user.nextDeliveryDate).toLocaleDateString() : 'Not scheduled';

            const pickups = user.pendingPickups.map(pickup => 
                `<div class="pickup-item">
                    ${new Date(pickup.date).toLocaleDateString()} - ${pickup.status}
                </div>`
            ).join('') || 'No pending pickups';

            const activities = user.recentActivity.map(activity => 
                `<div class="activity-item">
                    ${new Date(activity.timestamp).toLocaleDateString()} - ${activity.action}
                    ${activity.details ? `<br><span class="details">${activity.details}</span>` : ''}
                </div>`
            ).join('') || 'No recent activity';

            detailsRow.innerHTML = `
                <td colspan="4">
                    <div class="details-container">
                        <div class="details-section">
                            <h4>Next Delivery</h4>
                            <p>${nextDelivery}</p>
                        </div>
                        <div class="details-section">
                            <h4>Pending Tote Pickups</h4>
                            <div class="pickups-list">${pickups}</div>
                        </div>
                        <div class="details-section">
                            <h4>Recent Activity</h4>
                            <div class="activity-list">${activities}</div>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(detailsRow);
        });
    } catch (error) {
        alert('Error loading users: ' + error.message);
    }
}

// Toggle Visibility of Details
function toggleDetails(email) {
    const detailsRow = document.getElementById(`details-${email.replace('@', '-at-')}`);
    const currentDisplay = detailsRow.style.display;
    detailsRow.style.display = currentDisplay === 'none' ? 'table-row' : 'none';

    // Update button text
    const button = event.target;
    button.textContent = currentDisplay === 'none' ? 'Hide Details' : 'Show Details';
}
// Modal Functions
function showModal() {
    document.getElementById('subscriptionModal').style.display = 'block';
}
function hideModal() {
    document.getElementById('subscriptionModal').style.display = 'none';
    currentUserEmail = null;
}


// Whitelisted Emails
async function whitelistEmail() {
    const email = document.getElementById('whitelistEmail').value;
    if (!email) {
        alert('Please enter an email address');
        return;
    }

    document.getElementById('whitelistEmail').value = '';

    try {
        const response = await fetch('/api/admin/whitelist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email })
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to whitelist email');
        }

        alert('Email whitelisted successfully');
        document.getElementById('whitelistEmail').value = '';
        loadUsers();
    } catch (error) {
        console.error('Error whitelisting email:', error);
        alert('Error whitelisting email. Please try again.');
    }
}

// Logout Handler
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}


// Save Changes to User Email in Database
async function saveSubscriptionChanges() {
    if (!currentUserEmail) return;

    const subscriptionData = {
        email: currentUserEmail,
        plan: document.getElementById('planSelect').value,
        status: document.getElementById('statusSelect').value,
        nextDeliveryDate: document.getElementById('nextDelivery').value
    };

    try {
        const response = await fetch('/api/admin/update-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(subscriptionData)
        });

        if (!response.ok) {
            throw new Error('Failed to update subscription');
        }

        alert('Subscription updated successfully');
        hideModal();
        loadUsers(); // Refresh the user list
    } catch (error) {
        alert('Error updating subscription: ' + error.message);
    }
}

// Manage Subscriptions
async function manageSubscription(email) {
    currentUserEmail = email;

    try {
        // Fetch current subscription details
        const response = await fetch(`/api/admin/user-subscription/${email}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subscription details');
        }

        const subscription = await response.json();

        // Populate modal
        document.getElementById('modalUserEmail').textContent = email;
        document.getElementById('planSelect').value = subscription.plan || 'Basic';
        document.getElementById('statusSelect').value = subscription.status || 'Active';
        document.getElementById('nextDelivery').value = subscription.nextDeliveryDate ? 
            new Date(subscription.nextDeliveryDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];

        showModal();
    } catch (error) {
        alert('Error fetching subscription details: ' + error.message);
    }
}


// Initialize Page
async function initializePage() {
    isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        loadUsers();
        setupEventListeners();
    }
}
// Start the Page Initialization when DOM is Loaded
document.addEventListener('DOMContentLoaded', initializePage);