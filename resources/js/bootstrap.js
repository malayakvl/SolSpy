import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Function to update CSRF token for both axios and Inertia
function updateCSRFToken() {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        // Update axios CSRF token
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        
        // If Inertia is available, update its CSRF token handling
        if (typeof window.Inertia !== 'undefined') {
            // Update Inertia's default headers
            window.Inertia.defaults = window.Inertia.defaults || {};
            window.Inertia.defaults.headers = window.Inertia.defaults.headers || {};
            window.Inertia.defaults.headers['X-CSRF-TOKEN'] = token.content;
        }
    } else {
        console.error('CSRF token not found');
    }
}

// Set CSRF token on initial load
updateCSRFToken();

// Export the function so it can be called when needed
window.updateCSRFToken = updateCSRFToken;

// Also update CSRF token when the page is loaded (in case of navigation)
document.addEventListener('DOMContentLoaded', function() {
    updateCSRFToken();
});

// Create a more robust CSRF token updater that also updates Inertia's internal state
window.updateCSRFTokenCompletely = function() {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        // Update axios CSRF token
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        
        // Force update Inertia's CSRF token by reloading the page props
        if (typeof window.Inertia !== 'undefined') {
            // Update Inertia's default headers
            window.Inertia.defaults = window.Inertia.defaults || {};
            window.Inertia.defaults.headers = window.Inertia.defaults.headers || {};
            window.Inertia.defaults.headers['X-CSRF-TOKEN'] = token.content;
        }
    } else {
        console.error('CSRF token not found');
    }
};

// Update CSRF token whenever the page is shown (handles browser back/forward buttons)
window.addEventListener('pageshow', function() {
    updateCSRFToken();
});

// Listen for Inertia events to update CSRF token
document.addEventListener('inertia:before', function(event) {
    updateCSRFToken();
});

// Also listen for Inertia success events
document.addEventListener('inertia:success', function(event) {
    updateCSRFToken();
});