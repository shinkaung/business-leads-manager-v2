import { getBasePath, getApiEndpoints } from '../config.js';

let API_ENDPOINTS = null;

export async function getEndpoints() {
    if (!API_ENDPOINTS) {
        const basePath = await getBasePath();
        // Ensure paths start with basePath
        API_ENDPOINTS = {
            LEADS: `${basePath}/api/leads.php`,
            LEADS_CHECK_DUPLICATES: `${basePath}/api/leads/check-duplicates.php`,
            LEADS_BULK: `${basePath}/api/leads/bulk.php`,
            PRODUCTS: `${basePath}/api/products.php`,
            SEARCH: `${basePath}/api/search.php`,
            AUTH: `${basePath}/api/auth.php`
        };
    }
    return API_ENDPOINTS;
}

export async function getLeadsEndpoint() {
    const endpoints = await getEndpoints();
    return endpoints.LEADS;
}

// ... other endpoint getters as needed 