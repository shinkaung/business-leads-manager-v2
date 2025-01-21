import { getBasePath, getApiEndpoints } from '../config.js';

let API_ENDPOINTS = null;

export async function getEndpoints() {
    if (!API_ENDPOINTS) {
        API_ENDPOINTS = await getApiEndpoints();
    }
    return API_ENDPOINTS;
}

export async function getLeadsEndpoint() {
    const endpoints = await getEndpoints();
    return endpoints.LEADS;
}

// ... other endpoint getters as needed 