import { getEndpoints } from './api.js';
import { renderRecords } from '../script.js';

let currentSearchTerm = '';

async function filterRecords(searchTerm) {
    try {
        const endpoints = await getEndpoints();
        const response = await fetch(`${endpoints.SEARCH}?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        renderRecords(data.records || []);
    } catch (error) {
        console.error('Search error:', error);
    }
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