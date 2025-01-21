import { fetchAirtableData, updateAirtableRecord } from '../shared/airtable.js';
import { initializeAutocomplete } from '../shared/autocomplete.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check user role first
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = '../pages/login.html';
        return;
    }

    const user = JSON.parse(userData);
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');

    // Redirect if wrong role tries to access wrong page
    if (user.role === 'Admin' && returnTo === 'salesman') {
        window.location.href = '../index.html';
        return;
    }
    if (user.role === 'SalesPerson' && returnTo === 'index') {
        window.location.href = './salesman.html';
        return;
    }

    await initializeAutocomplete();
    await loadRecord();
});

async function loadRecord() {
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    if (!recordId) {
        alert('No record ID provided');
        goBack();
        return;
    }

    try {
        const response = await fetchAirtableData();
        const records = response.records || [];
        const record = records.find(r => r.id === recordId);
        
        if (!record) {
            alert('Record not found');
            goBack();
            return;
        }

        console.log('Record from Airtable:', record); // Debug log
        console.log('Status value:', record.fields['Status']); // Debug log

        // Get the form
        const form = document.getElementById('editRecordForm');
        if (!form) {
            console.error('Form not found');
            return;
        }

        // Get the status select element
        const statusSelect = form.querySelector('[name="Status"]');
        console.log('Status element:', statusSelect); // Debug log
        console.log('Available options:', Array.from(statusSelect.options).map(opt => opt.value)); // Debug log

        // Directly set the status first
        if (statusSelect && record.fields['Status']) {
            statusSelect.value = record.fields['Status'];
            console.log('Set status to:', record.fields['Status']); // Debug log
            console.log('Current status value:', statusSelect.value); // Debug log
        }

        // Then populate other fields
        const fields = [
            'Contact Person',
            'Position',
            'Tel',
            'Email',
            'Name of outlet',
            'Address',
            'Postal Code',
            'Category',
            'Style/Type of Cuisine',
            'Size of Establishment',
            'Products on Tap',
            'Estimated Monthly Consumption (HL)',
            'Beer Bottle Products',
            'Estimated Monthly Consumption (Cartons)',
            'Soju Products',
            'Proposed Products & HL Target',
            'Follow Up Actions',
            'Remarks'
        ];

        // Populate each field, including empty ones
        fields.forEach(fieldName => {
            const element = form.querySelector(`[name="${fieldName}"]`);
            if (element) {
                element.value = record.fields[fieldName] || '';
            } else {
                console.warn(`Field ${fieldName} not found in form`);
            }
        });

    } catch (error) {
        console.error('Error loading record:', error);
        alert('Error loading record: ' + error.message);
        goBack();
    }
}

// Update the form submit handler
document.getElementById('editRecordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    try {
        // First, fetch the current record to preserve existing data
        const response = await fetchAirtableData();
        const records = response.records || [];
        const existingRecord = records.find(r => r.id === recordId);
        
        // Get the form data
        const formData = new FormData(e.target);
        const fields = { ...existingRecord.fields }; // Start with existing fields
        
        // Update only the fields that are in the form
        formData.forEach((value, key) => {
            fields[key] = value; // Update with new values
        });

        await updateAirtableRecord(recordId, { fields });
        alert('Record updated successfully!');
        goBack();
    } catch (error) {
        console.error('Update error:', error);
        alert('Error updating record: ' + error.message);
    }
});

function goBack() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = '../pages/login.html';
        return;
    }

    const user = JSON.parse(userData);
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo') || 'index';

    if (user.role === 'Admin') {
        window.location.href = '../index.html';
    } else if (user.role === 'SalesPerson') {
        window.location.href = './salesman.html';
    }
} 