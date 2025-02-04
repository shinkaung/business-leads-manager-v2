import { fetchAirtableData, fetchProductsData } from './airtable.js';

let outlets = new Set();
let products = new Set();

async function initializeAutocomplete() {
    try {
        console.log('Initializing autocomplete...');
        
        // Fetch data from both bases with better error handling
        const [leadsResponse, productsResponse] = await Promise.allSettled([
            fetchAirtableData(),
            fetchProductsData()
        ]);
        
        // Handle leads data
        if (leadsResponse.status === 'fulfilled') {
            const leadsRecords = leadsResponse.value.records || [];
            console.log('Fetched leads:', leadsRecords);
            
            leadsRecords.forEach(record => {
                if (record.fields['Name of outlet']) {
                    outlets.add(record.fields['Name of outlet']);
                }
            });
        } else {
            console.warn('Failed to fetch leads:', leadsResponse.reason);
        }

        // Handle products data
        if (productsResponse.status === 'fulfilled') {
            const productRecords = productsResponse.value.records || [];
            console.log('Fetched products:', productRecords);
            
            productRecords.forEach(record => {
                if (record.fields['Name']) {
                    products.add(record.fields['Name']);
                }
            });
        } else {
            console.warn('Failed to fetch products:', productsResponse.reason);
        }

        console.log('Outlets:', Array.from(outlets));
        console.log('Products:', Array.from(products));

        // Setup input listeners
        setupInputListener('Name of outlet', 'outletList', outlets);
        setupInputListener('Products on Tap', 'productsOnTapList', products);
        setupInputListener('Beer Bottle Products', 'beerBottleProductsList', products);
        setupInputListener('Soju Products', 'sojuProductsList', products);

        // Initialize with all options
        updateDatalist('outletList', '', outlets);
        updateDatalist('productsOnTapList', '', products);
        updateDatalist('beerBottleProductsList', '', products);
        updateDatalist('sojuProductsList', '', products);

    } catch (error) {
        console.error('Error in initializeAutocomplete:', error);
    }
}

function setupInputListener(inputId, datalistId, dataset) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', (e) => {
            updateDatalist(datalistId, e.target.value, dataset);
        });
    }
}

function updateDatalist(datalistId, searchTerm, dataset) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Filter items based on search term
    const filteredItems = Array.from(dataset).filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Add filtered options to datalist
    filteredItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAutocomplete);

export { initializeAutocomplete }; 