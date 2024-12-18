import { fetchAirtableData } from './airtable.js';
import { displayData } from './script.js';

let currentSearchTerm = '';

async function filterRecords(searchTerm) {
    currentSearchTerm = searchTerm.toLowerCase();
    const allRecords = await fetchAirtableData();
    
    const filteredRecords = allRecords.filter(record => {
        const fields = record.fields;
        return (
            (fields['Contact Person'] || '').toLowerCase().includes(currentSearchTerm) ||
            (fields['Name of outlet'] || '').toLowerCase().includes(currentSearchTerm) ||
            (fields['Category'] || '').toLowerCase().includes(currentSearchTerm)
        );
    });
    
    displayData(filteredRecords);
}

async function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', async () => {
            await filterRecords(searchInput.value);
        });
    }
}

export { setupSearch, filterRecords, currentSearchTerm }; 