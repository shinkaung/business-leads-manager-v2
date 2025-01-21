let config = null;

export async function initConfig() {
    if (config) return config;
    
    try {
        // Check if running on Vercel
        const isVercel = window.location.hostname.includes('vercel.app');
        const basePath = isVercel ? '' : '/business-leads-manager';
        
        const response = await fetch(`${basePath}/backend/api/config.php`);
        let responseText = await response.text();
        
        // Try to detect if we received HTML instead of JSON
        if (responseText.trim().startsWith('<')) {
            console.error('Received HTML instead of JSON:', responseText);
            throw new Error('Server returned HTML instead of JSON');
        }

        try {
            config = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', responseText);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
        }

        // Override BASE_PATH based on environment
        config.BASE_PATH = basePath;

        if (!config.BASE_PATH || !config.API_ENDPOINTS) {
            throw new Error('Invalid configuration format');
        }

        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        throw new Error(`Failed to load configuration: ${error.message}`);
    }
}

export async function getBasePath() {
    const cfg = await initConfig();
    return cfg.BASE_PATH;
}

export async function getApiEndpoints() {
    const cfg = await initConfig();
    return cfg.API_ENDPOINTS;
} 