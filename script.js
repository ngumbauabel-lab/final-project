/**
 * ========================================
 * FOODBRIDGE - Main Application Logic
 * ========================================
 * This script handles:
 * - Form submissions (donations & volunteers)
 * - Local Storage data persistence
 * - Dynamic UI rendering of food items
 * - Search/filter functionality
 * - Event delegation for interactive elements
 */

// ========== 1. DOM ELEMENT REFERENCES ==========
// Store references to key HTML elements for faster access and manipulation
const donationForm = document.getElementById('donationForm');
const volunteerForm = document.getElementById('volunteerForm');
const foodList = document.getElementById('foodList');           // Container for food cards
const locationSearch = document.getElementById('locationSearch'); // Search input field

document.addEventListener('DOMContentLoaded', function() {
    loadDonations();
    setupEventListeners();
    
    // Initialize page-specific features
    if (document.getElementById('impactStats')) {
        displayImpactStats();
        setInterval(displayImpactStats, 5000); // Auto-refresh every 5 sec
    }
    
    if (document.getElementById('volunteersList')) {
        displayVolunteersList();
        displayVolunteerStats();
        setInterval(function() {
            displayVolunteersList();
            displayVolunteerStats();
        }, 3000); // Auto-refresh every 3 sec
    }
});

// ========== 3. EVENT LISTENER SETUP ==========
/**
 * Centralizes all event listener attachments.
 * Prevents inline onclick/onkeyup handlers (poor practice).
 * Uses event delegation for dynamically created elements.
 */
function setupEventListeners() {
    // Attach listener to donation form when user submits
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmit);
    }

    // Attach listener to volunteer form when user submits
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerSubmit);
    }

    // Listen for search input changes (keyup = when user releases a key, input = any change)
    // Both events ensure filtering works whether user types or pastes text
    if (locationSearch) {
        locationSearch.addEventListener('keyup', filterListings);
        locationSearch.addEventListener('input', filterListings);
    }

    // Event delegation pattern: listen for clicks on the foodList container
    // This works for both existing and dynamically created buttons
    // Avoids attaching individual listeners to each button (memory efficient)
    if (foodList) {
        foodList.addEventListener('click', function(e) {
            if (e.target.classList.contains('claim-btn')) {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                claimItem(itemId); // Remove item from list and storage
            }
        });
    }
}

// ========== 4. DONATION FORM HANDLER ==========
/**
 * Processes donation form submissions.
 * - Prevents default form submission behavior
 * - Validates user input (food description & location)
 * - Creates a donation object with unique ID
 * - Adds item to UI and saves to browser storage
 * - Clears form for next entry
 */
function handleDonationSubmit(e) {
    e.preventDefault(); // Stop page reload on form submit

    // Extract and trim user input (trim removes extra whitespace)
    const food = document.getElementById('foodItem').value.trim();
    const location = document.getElementById('location').value.trim();

    // Validate: ensure both fields have content
    // Early return pattern: fail fast if validation doesn't pass
    if (!food || !location) {
        alert('Please fill in all fields');
        return;
    }

    // Create donation object with unique ID
    // Date.now() generates millisecond timestamp (virtually unique)
    const id = Date.now();
    const donation = { id, food, location };

    // 1. Update UI immediately (optimistic update)
    renderCard(donation);

    // 2. Persist to Local Storage so data survives page refresh
    saveToLocalStorage(donation);

    // 3. Clear form fields for next donation
    this.reset();
    console.log('Donation posted:', donation);
}

function handleVolunteerSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('volunteerName').value.trim();
    const email = document.getElementById('volunteerEmail').value.trim();
    const transport = document.getElementById('transportMode').value;

    if (!name || !email || !transport) {
        alert('Please fill in all fields');
        return;
    }

    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }

    const volunteer = {
        id: Date.now(),
        name: name,
        email: email,
        transport: transport,
        signupDate: new Date().toLocaleDateString()
    };
    
    saveVolunteerToStorage(volunteer);
    alert(`Thank you, ${name}! We'll be in touch at ${email}.\n\nYour transport mode: ${transport}`);
    this.reset();
    displayVolunteersList();
    displayVolunteerStats();
    console.log('Volunteer registered:', volunteer);
}

// ========== 6. RENDER FOOD CARD ==========
/**
 * Dynamically creates and inserts a food card into the DOM.
 * - Builds HTML structure with item details
 * - Attaches unique data-id for tracking and deletion
 * - Adds "Claim Item" button with event delegation support
 * - Uses prepend() so newest items appear at top
 */
function renderCard(item) {
    // Create a new div element to hold the food card
    const card = document.createElement('div');
    card.className = 'food-card';
    card.setAttribute('data-id', item.id); // Store ID on element for later retrieval
    
    // Build card HTML using template literal
    // Includes item name, location, and claim button
    card.innerHTML = `
        <div>
            <h3>${item.food}</h3>
            <p>📍 ${item.location}</p>
        </div>
        <button class="btn claim-btn" data-id="${item.id}" style="background-color: #e76f51;">Claim Item</button>
    `;
    
    // Insert new card at the TOP of the food list (prepend = add as first child)
    // This shows most recent donations first
    foodList.prepend(card);
}

// ========== 7. LOCAL STORAGE: SAVE ==========
/**
 * Persists a donation to browser's Local Storage.
 */
function saveToLocalStorage(donation) {
    try {
        let donations = localStorage.getItem('donations') ? 
                        JSON.parse(localStorage.getItem('donations')) : [];
        donations.push(donation);
        localStorage.setItem('donations', JSON.stringify(donations));
        console.log('Donation saved:', donation);
    } catch (error) {
        console.error('Error saving donation:', error);
    }
}

// ========== 7B. LOCAL STORAGE: SAVE VOLUNTEER ==========
/**
 * Persists a volunteer to browser's Local Storage.
 */
function saveVolunteerToStorage(volunteer) {
    try {
        let volunteers = localStorage.getItem('volunteers') ? 
                         JSON.parse(localStorage.getItem('volunteers')) : [];
        volunteers.push(volunteer);
        localStorage.setItem('volunteers', JSON.stringify(volunteers));
        console.log('Volunteer saved:', volunteer);
    } catch (error) {
        console.error('Error saving volunteer:', error);
    }
}

// ========== 7C. LOCAL STORAGE: GET VOLUNTEERS ==========
/**
 * Retrieve all volunteers from localStorage
 */
function getVolunteersFromStorage() {
    try {
        const volunteers = localStorage.getItem('volunteers');
        return volunteers ? JSON.parse(volunteers) : [];
    } catch (error) {
        console.error('Error reading volunteers:', error);
        return [];
    }
}

// ========== 8. LOCAL STORAGE: LOAD ==========
/**
 * Retrieves all saved donations from Local Storage and renders them.
 * - Called on page load to restore previous donations
 * - Clears existing UI to prevent duplicates
 * - Renders each saved donation as a card
 */
function loadDonations() {
    try {
        const donations = localStorage.getItem('donations') ? 
                          JSON.parse(localStorage.getItem('donations')) : [];
        
        if (foodList) {
            foodList.innerHTML = '';
            donations.forEach(item => renderCard(item));
        }
    } catch (error) {
        console.error('Error loading donations:', error);
    }
}

// ========== 9. CLAIM ITEM & DELETE ==========
/**
 * Removes a claimed food item from both UI and Local Storage.
 * - Finds and removes the card element from DOM
 * - Updates Local Storage by filtering out the claimed item
 * - Two-step process ensures UI and data stay synchronized
 */
function claimItem(id) {
    // STEP 1: Remove from the UI immediately (gives user visual feedback)
    const cardToRemove = document.querySelector(`[data-id="${id}"]`);
    if (cardToRemove) {
        cardToRemove.remove();
        console.log('Item claimed:', id);
    }

    // STEP 2: Remove from Local Storage (persist the deletion)
    try {
        let donations = localStorage.getItem('donations') ? 
                        JSON.parse(localStorage.getItem('donations')) : [];
        const updatedDonations = donations.filter(item => item.id !== id);
        localStorage.setItem('donations', JSON.stringify(updatedDonations));
    } catch (error) {
        console.error('Error removing donation:', error);
    }
}

// ========== 10. SEARCH/FILTER LISTINGS ==========
/**
 * Filters food cards based on search input.
 * - Gets search term from input field
 * - Loops through all cards and shows/hides based on match
 * - Case-insensitive search checks food name and location
 * - Uses display property to show/hide (doesn't delete items)
 */
function filterListings(e) {
    // Get search term and convert to lowercase for case-insensitive comparison
    const filter = e.target.value.toLowerCase();
    const cards = foodList.getElementsByClassName('food-card');

    // Loop through each food card and check if it matches search term
    for (let i = 0; i < cards.length; i++) {
        // Get all text content from the card (food name + location)
        const textContent = cards[i].textContent || cards[i].innerText;
        
        // indexOf returns -1 if substring not found, so > -1 means "found"
        if (textContent.toLowerCase().indexOf(filter) > -1) {
            cards[i].style.display = ""; // Show card (empty string = default display)
        } else {
            cards[i].style.display = "none"; // Hide card
        }
    }
}

// ========== 7D. LOCAL STORAGE: GET DONATIONS ==========
/**
 * Retrieves all donations from localStorage and safely returns them.
 * - Attempts to parse JSON stored donations
 * - Returns empty array if no donations exist or on error
 * - Used by multiple display functions to access donation data
 */
function getDonationsFromStorage() {
    try {
        const donations = localStorage.getItem('donations');
        return donations ? JSON.parse(donations) : [];
    } catch (error) {
        console.error('Error reading donations:', error);
        return [];
    }
}

// ========== 11. DISPLAY IMPACT STATS (Mission Page) ==========
/**
 * Renders community impact statistics on the mission.html page.
 * Shows three key metrics and recent donation examples.
 * 
 * Metrics:
 * - Total donations posted (food listings)
 * - Total volunteers registered (community helpers)
 * - Estimated meals shared (donations × 2 = rough estimate)
 * 
 * Also displays the 4 most recent donations in a grid below stats.
 * Hides the "Recent Donations" section if no donations exist yet.
 */
function displayImpactStats() {
    const statsEl = document.getElementById('impactStats');
    if (!statsEl) return; // Exit early if element doesn't exist on page

    // Fetch current data from storage
    const donations = getDonationsFromStorage();
    const volunteers = getVolunteersFromStorage();
    const totalDonations = donations.length;
    const totalVolunteers = volunteers.length;
    const estimatedMeals = totalDonations * 2; // Conservative estimate: 2 meals per donation

    // Render three stat cards with grid layout
    statsEl.innerHTML = `
        <div class="grid">
            <div class="card">
                <h3>${totalDonations}</h3>
                <p>Donations posted</p>
            </div>
            <div class="card">
                <h3>${totalVolunteers}</h3>
                <p>Volunteers registered</p>
            </div>
            <div class="card">
                <h3>~${estimatedMeals}</h3>
                <p>Meals shared</p>
            </div>
        </div>
    `;

    // Display recent donations section below stats
    const recentSection = document.getElementById('donationList');
    const missionDonations = document.getElementById('missionDonations');
    if (recentSection && missionDonations) {
        if (donations.length > 0) {
            // Show section and render last 4 donations in reverse order (newest first)
            recentSection.style.display = 'block';
            missionDonations.innerHTML = '';
            donations.slice(-4).reverse().forEach(item => {
                const card = document.createElement('div');
                card.className = 'food-card';
                card.innerHTML = `
                    <h3>${item.food}</h3>
                    <p>📍 ${item.location}</p>
                `;
                missionDonations.appendChild(card);
            });
        } else {
            // Hide section if no donations to show
            recentSection.style.display = 'none';
        }
    }
}

// ========== 12. DISPLAY VOLUNTEERS LIST (Volunteer Page) ==========
/**
 * Renders a grid of registered volunteers on the volunteer.html page.
 * - Displays up to 6 most recent volunteers
 * - Shows volunteer name, transport mode, email, and signup date
 * - Shows placeholder message if no volunteers registered yet
 * 
 * Data displayed:
 * - Name (h3 heading)
 * - Transport method and email address (secondary text)
 * - Signup date (footer text, smaller font)
 */
function displayVolunteersList() {
    const listEl = document.getElementById('volunteersList');
    if (!listEl) return; // Exit early if element doesn't exist on page

    const volunteers = getVolunteersFromStorage();
    
    // Handle empty state: show helpful message
    if (volunteers.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #999;">No volunteers registered yet.</p>';
        return;
    }

    // Create grid container for volunteer cards
    listEl.innerHTML = '<div class="grid"></div>';
    const grid = listEl.querySelector('.grid');

    // Display up to 6 most recent volunteers (reversed so newest appears first)
    volunteers.slice(-6).reverse().forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'food-card'; // Reuse food card styling for consistency
        card.innerHTML = `
            <h3>${volunteer.name}</h3>
            <p>${volunteer.transport} · ${volunteer.email}</p>
            <p style="margin-top: 0.75rem; font-size: 0.95rem; color: #555;">Joined: ${volunteer.signupDate}</p>
        `;
        grid.appendChild(card);
    });
}

// ========== 13. DISPLAY VOLUNTEER STATS (Volunteer Page) ==========
/**
 * Renders volunteer program statistics on the volunteer.html page.
 * Shows three key impact metrics to encourage participation.
 * 
 * Metrics:
 * - Active volunteers (total registered)
 * - Food posts available (donations waiting to be claimed)
 * - Local pickups supported (estimated: volunteers × 3, minimum 5)
 * 
 * The "pickups supported" metric is calculated to give volunteers
 * a sense of impact (each volunteer can facilitate ~3 pickups).
 */
function displayVolunteerStats() {
    const statsEl = document.getElementById('volunteerStats');
    if (!statsEl) return; // Exit early if element doesn't exist on page

    const volunteers = getVolunteersFromStorage();
    const donations = getDonationsFromStorage();

    // Calculate impact: each volunteer can support ~3 pickups
    // Minimum 5 to show progress even with few volunteers
    const pickupsSupported = Math.max(volunteers.length * 3, 5);

    // Render three stat cards with grid layout
    statsEl.innerHTML = `
        <div class="grid">
            <div class="card">
                <h3>${volunteers.length}</h3>
                <p>Active volunteers</p>
            </div>
            <div class="card">
                <h3>${donations.length}</h3>
                <p>Food posts available</p>
            </div>
            <div class="card">
                <h3>${pickupsSupported}</h3>
                <p>Local pickups supported</p>
            </div>
        </div>
    `;
}
