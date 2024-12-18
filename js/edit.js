import { fetchAirtableData, updateAirtableRecord } from './airtable.js';

async function loadRecord() {
    // Get record ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    if (!recordId) {
        alert('No record ID provided');
        window.location.href = '../index.html';
        return;
    }

    // Fetch record data
    const records = await fetchAirtableData();
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
        alert('Record not found');
        window.location.href = '../index.html';
        return;
    }

    // Populate form fields
    const form = document.getElementById('editRecordForm');
    Object.entries(record.fields).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) {
            input.value = value;
        }
    });
}

document.getElementById('editRecordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get('id');
    
    const formData = new FormData(e.target);
    const record = {};
    
    formData.forEach((value, key) => {
        if (value) record[key] = value;
    });

    try {
        await updateAirtableRecord(recordId, record);
        alert('Record updated successfully!');
        window.location.href = `../index.html?highlight=${recordId}`;
    } catch (error) {
        alert('Error updating record: ' + error.message);
    }
});

// Load record data when page loads
document.addEventListener('DOMContentLoaded', loadRecord); 