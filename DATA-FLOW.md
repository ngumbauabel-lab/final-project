/**
 * ========================================
 * FOODBRIDGE - DATA FLOW ARCHITECTURE
 * ========================================
 * 
 * This document explains how data flows across all pages
 * and how localStorage is used for persistence.
 */

// ========== SHARED DATA MANAGEMENT (shared-data.js) ==========
/*
 * Central hub for all data operations
 * Functions exported:
 * 
 * DONATIONS:
 * - getDonations() → retrieve all food donations
 * - saveDonation(obj) → add new donation
 * - removeDonation(id) → delete claimed donation
 * 
 * VOLUNTEERS:
 * - getVolunteers() → retrieve all volunteers
 * - saveVolunteer(obj) → add new volunteer
 * 
 * STATISTICS:
 * - getDonationStats() → get impact metrics
 * - getRecentDonations(limit) → get recent items
 */

// ========== PAGE ROLES ==========

/*
 * INDEX.HTML - DATA ENTRY PAGE
 * ============================
 * Primary Purpose: Collect donations and volunteers
 * 
 * Scripts Loaded:
 * - shared-data.js (data management)
 * - script.js (form handling)
 * 
 * Functions:
 * - handleDonationSubmit() → validates form + saves donation
 * - filterListings() → search/filter donations
 * - claimItem() → removes donation, updates storage
 * 
 * Data Flow:
 * User input → Form validation → saveDonation()
 *   ↓
 * localStorage (donations array)
 */

/*
 * MISSION.HTML - IMPACT DASHBOARD
 * ================================
 * Primary Purpose: Display community impact statistics
 * 
 * Scripts Loaded:
 * - shared-data.js (data management)
 * - mission-script.js (display logic)
 * 
 * Data Displayed:
 * - Total donations shared
 * - Active volunteers
 * - Areas covered
 * - Recent donations (read-only)
 * 
 * Auto-refresh: Every 5 seconds
 * 
 * Data Flow:
 * localStorage (donations array)
 *   ↓ (every 5 sec)
 * getDonations() → displayRecentDonations()
 */

/*
 * VOLUNTEER.HTML - VOLUNTEER MANAGEMENT
 * =====================================
 * Primary Purpose: Recruit and track volunteers
 * 
 * Scripts Loaded:
 * - shared-data.js (data management)
 * - volunteer-script.js (form + display logic)
 * 
 * Functions:
 * - handleVolunteerFormSubmit() → validates + saves volunteer
 * - displayVolunteersList() → shows all volunteers
 * - displayVolunteerStats() → shows impact metrics
 * 
 * Auto-refresh: Every 3 seconds
 * 
 * Data Flow:
 * User input → Form validation → saveVolunteer()
 *   ↓
 * localStorage (volunteers array)
 *   ↓ (every 3 sec)
 * getVolunteers() + getDonations() → displayVolunteersList()
 */

// ========== localStorage STRUCTURE ==========

/*
 * KEY: "donations"
 * VALUE: JSON Array of donation objects
 * Example:
 * [
 *   {
 *     id: 1714809600000,
 *     food: "5 boxes of cereal",
 *     location: "Downtown"
 *   },
 *   {
 *     id: 1714809700000,
 *     food: "10 Apples",
 *     location: "Westside"
 *   }
 * ]
 */

/*
 * KEY: "volunteers"
 * VALUE: JSON Array of volunteer objects
 * Example:
 * [
 *   {
 *     id: 1714809600000,
 *     name: "John Smith",
 *     email: "john@example.com",
 *     transport: "bicycle",
 *     signupDate: "5/4/2026"
 *   }
 * ]
 */

// ========== USER WORKFLOWS ==========

/*
 * WORKFLOW 1: Posting a Food Donation
 * ===================================
 * 1. User visits index.html
 * 2. Fills "Food Description" and "Location"
 * 3. Clicks "Post to Feed"
 * 4. JavaScript validates inputs
 * 5. saveDonation() stores in localStorage
 * 6. Card appears in "Available Near You" section
 * 7. Mission.html auto-updates (within 5 sec)
 * 8. Volunteer.html auto-updates (within 3 sec)
 */

/*
 * WORKFLOW 2: Searching for Food
 * ==============================
 * 1. User visits index.html
 * 2. Types in "Find Food Locally" search
 * 3. filterListings() filters cards in real-time
 * 4. Shows only matching donations
 */

/*
 * WORKFLOW 3: Claiming a Donation
 * ===============================
 * 1. User clicks "Claim Item" button
 * 2. Card removes from UI immediately
 * 3. removeDonation() removes from localStorage
 * 4. Donation count decreases (stats update)
 */

/*
 * WORKFLOW 4: Volunteering
 * =======================
 * 1. User visits volunteer.html
 * 2. Fills name, email, transportation
 * 3. Clicks "Join the Movement"
 * 4. JavaScript validates inputs
 * 5. saveVolunteer() stores in localStorage
 * 6. Volunteer appears in list
 * 7. Stats update showing total volunteers
 * 8. Mission.html shows updated volunteer count
 */

// ========== DEBUGGING ==========

/*
 * To debug and see all stored data, open browser console
 * and run: debugShowAllData()
 * 
 * This will output:
 * - All donations
 * - All volunteers
 * - Current statistics
 * 
 * To clear all data and reset: clearAllData()
 * (Note: This requires confirmation)
 */

// ========== TECHNICAL NOTES ==========

/*
 * - All data persists even after closing the browser
 * - Pages don't require server (fully client-side)
 * - Auto-refresh creates "live" feel without real-time database
 * - Event delegation used for performance
 * - All forms include input validation
 * - Errors gracefully logged to console
 */
