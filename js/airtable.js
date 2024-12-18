// Airtable configuration
const AIRTABLE_API_KEY = 'pataBu2eaV0V5tEHx.2fde3b7ffdc42d856e167a7551f74f8770a41af956087fa09a2df831fd632c3c';
const AIRTABLE_BASE_ID = 'app5GPyIEcYQTRgST';
const AIRTABLE_TABLE_NAME = 'tblIL5ZHWNkMDM0sV';

// Export functions and constants
export { 
    AIRTABLE_API_KEY, 
    AIRTABLE_BASE_ID, 
    AIRTABLE_TABLE_NAME,
    createAirtableRecord,
    updateAirtableRecord,
    fetchAirtableData 
};

// Fetch data from Airtable
async function fetchAirtableData() {
    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?view=Grid%20view`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from Airtable');
        }

        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Rest of your airtable.js code...

async function createAirtableRecord(record) {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    fields: record
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create record');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating record:', error);
        throw error;
    }
}

async function updateAirtableRecord(recordId, fields) {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: fields
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update record');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating record:', error);
        throw error;
    }
} 