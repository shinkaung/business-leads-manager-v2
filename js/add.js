import { createAirtableRecord } from './airtable.js';

document.getElementById('addRecordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const record = {};
    
    formData.forEach((value, key) => {
        if (value) record[key] = value;
    });

    try {
        await createAirtableRecord(record);
        alert('Record created successfully!');
        window.location.href = '../index.html';
    } catch (error) {
        alert('Error creating record: ' + error.message);
    }
}); 