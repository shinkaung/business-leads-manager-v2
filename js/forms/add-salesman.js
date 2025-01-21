import { createAirtableRecord } from '../shared/airtable.js';
import { initializeAutocomplete } from '../shared/autocomplete.js';

// Check if user is authorized
const userData = localStorage.getItem('user');
if (!userData || JSON.parse(userData).role !== 'SalesPerson') {
    window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize autocomplete
    await initializeAutocomplete();

    // Setup form submission
    setupFormSubmission();
});

function setupFormSubmission() {
    const form = document.getElementById('addRecordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const fields = {};
        
        formData.forEach((value, key) => {
            if (value) fields[key] = value;
        });

        try {
            await createAirtableRecord({ fields });
            alert('Lead added successfully!');
            window.location.href = '../pages/salesman.html';
        } catch (error) {
            alert('Error adding lead: ' + error.message);
        }
    });
} 