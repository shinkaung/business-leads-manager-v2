import { createAirtableRecord } from '../shared/airtable.js';
import { initializeAutocomplete } from '../shared/autocomplete.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check user role first
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = '../pages/login.html';
        return;
    }

    const user = JSON.parse(userData);
    
    initializeAutocomplete();
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
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'Admin') {
                window.location.href = '../index.html';
            } else {
                window.location.href = './salesman.html';
            }
        } catch (error) {
            alert('Error creating record: ' + error.message);
        }
    });
} 