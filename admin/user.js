// User Page
let isAuthenticated = false;

// Check authentication first
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
                alert('No subscription found. Please await as we update your subscription model.');
                // todo, redirect to subscription setup page or show subscription options
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


// Initialize page
async function initializePage() {
    isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadSubscription();
        setupEventListeners();
    }
}

function setupEventListeners() {
    document.getElementById("skipBtn").addEventListener("click", skipMonth);
    document.getElementById("pauseBtn").addEventListener("click", togglePause);
    document.getElementById("pickupBtn").addEventListener("click", showPickupModal);
    document.getElementById("confirmPickup").addEventListener("click", scheduleTotePickup);
    document.getElementById("closeModal").addEventListener("click", hidePickupModal);
    document.getElementById("logoutBtn").addEventListener("click", logout);
}

// Pickup Scheduler
async function scheduleTotePickup() {
    const dateInput = document.getElementById("pickupDate");
    const selectedDate = dateInput.value;

    if (!selectedDate) {
        alert("Please select a pickup date");
        return;
    }

    try {
        const response = await fetch("/api/user/tote-pickup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ date: selectedDate })
        });

        if (!response.ok) {
            throw new Error("Failed to schedule pickup");
        }

        alert("Tote pickup scheduled successfully!");
        hidePickupModal();
        await loadSubscription(); // Refresh the subscription data
    } catch (error) {
        alert("Error scheduling pickup: " + error.message);
    }
}

// Subscription Loader
async function loadSubscription() {
    try {
        const response = await fetch("/api/user/subscription", {
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        if (response.status === 403 || response.status === 404) {
            const data = await response.json();
            if (data.code === 'NOT_WHITELISTED') {
                alert('Your account is not whitelisted. Please contact admin.');
                window.location.href = '/login.html';
                return;
            }
            if (data.code === 'NO_SUBSCRIPTION') {
                // Show subscription setup UI instead of normal dashboard
                showSubscriptionSetup();
                return;
            }
        }

        if (!response.ok) {
            throw new Error("Failed to load subscription");
        }

        const subscription = await response.json();
        updateUI(subscription);
    } catch (error) {
        console.error('Error:', error);
        window.location.href = "/login.html";
    }
}

// Display Subscription Setup UI
function showSubscriptionSetup() {
    // Hide normal subscription UI
    document.querySelector('.subscription-info').style.display = 'none';
    document.querySelector('.action-buttons').style.display = 'none';

    // Show subscription setup UI
    const setupDiv = document.createElement('div');
    setupDiv.innerHTML = `
        <div class="subscription-setup">
            <h2>Set Up Your Subscription</h2>
            <p>You need to set up a subscription to access the dashboard.</p>
            <button onclick="setupSubscription()">Set Up Now</button>
        </div>
    `;
    document.querySelector('.container').appendChild(setupDiv);
}

// Subscription UI update
function updateUI(subscription) {
    document.getElementById("planType").textContent = subscription.plan || 'No Plan';
    document.getElementById("subStatus").textContent = subscription.status || 'Inactive';
    document.getElementById("nextDelivery").textContent = subscription.nextDeliveryDate ? 
        new Date(subscription.nextDeliveryDate).toLocaleDateString() : 'Not scheduled';

    let toteDate;
    if (subscription.totePickups[0]) {
        toteDate = new Date(subscription.totePickups[0].date).toLocaleDateString();
    }
    else {
        toteDate = 'Not scheduled'
    }
    document.getElementById("toteScheduledPickup").textContent = toteDate

    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.textContent = subscription.status === "Active" ? 
        "Pause Subscription" : "Resume Subscription";
}

// Option to Skip Next Months Shipment Handler
async function skipMonth() {
    try {
        const response = await fetch("/api/user/subscription/skip", {
            method: "POST",
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to skip month");
        alert("Successfully skipped next month's delivery");
        loadSubscription();
    } catch (error) {
        alert("Error skipping month: " + error.message);
    }
}

// Pause Subscription
async function togglePause() {
    try {
        const response = await fetch("/api/user/subscription/pause", {
            method: "POST",
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to toggle pause status");
        alert("Subscription status updated");
        loadSubscription();
    } catch (error) {
        alert("Error updating subscription status: " + error.message);
    }
}

// Schedule Pickup and Show Pickup Modal
async function scheduleTotePickup() {
    const date = document.getElementById("pickupDate").value;
    if (!date) {
        alert("Please select a date");
        return;
    }
    try {
        const response = await fetch("/api/user/tote-pickup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ date })
        });
        if (!response.ok) throw new Error("Failed to schedule pickup");
        alert("Tote pickup scheduled successfully");
        hidePickupModal();
    } catch (error) {
        alert("Error scheduling pickup: " + error.message);
    }
}

// Ask for Pickup
async function requestPickup() {
    try {
        const response = await fetch("/api/user/tote-pickup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ immediate: true })
        });

        if (!response.ok) throw new Error("Failed to request pickup");
        alert("Pickup requested successfully! We'll process this right away.");
        loadSubscription(); // Refresh the display
    } catch (error) {
        alert("Error requesting pickup: " + error.message);
    }
}

// Pickup Modal Helper Functions
function showPickupModal() {
    const modal = document.getElementById('pickupModal');
    modal.style.display = 'block';

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('pickupDate').min = tomorrow.toISOString().split('T')[0];
}

function hidePickupModal() {
    const modal = document.getElementById('pickupModal');
    modal.style.display = 'none';
}


// Logout Handler
async function logout() {
    try {
        await fetch("/api/logout", {
            method: "POST",
        });
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/login.html";
    }
}

// Start the page initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);