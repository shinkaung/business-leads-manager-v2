import { getEndpoints } from './api.js';

export async function fetchAirtableData() {
    try {
        const endpoints = await getEndpoints();
        const response = await fetch(endpoints.LEADS, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function fetchProductsData() {
    try {
        const endpoints = await getEndpoints();
        const response = await fetch(endpoints.PRODUCTS, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function updateAirtableRecord(recordId, data) {
    try {
        const endpoints = await getEndpoints();
        const payload = {
            records: [{
                id: recordId,
                fields: data.fields
            }]
        };

        const response = await fetch(`${endpoints.LEADS}?id=${recordId}`, {
            method: 'PATCH',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to update record: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating record:', error);
        throw error;
    }
}

export async function deleteAirtableRecord(recordId) {
    try {
        const endpoints = await getEndpoints();
        const response = await fetch(`${endpoints.LEADS}?id=${recordId}`, {
            method: 'DELETE',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete record');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
    }
}

export async function createAirtableRecord(data) {
    try {
        const endpoints = await getEndpoints();
        const payload = {
            records: [{
                fields: data.fields || data
            }]
        };

        const response = await fetch(endpoints.LEADS, {
            method: 'POST',
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to create record: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating record:', error);
        throw error;
    }
} 