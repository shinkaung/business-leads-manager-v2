let config = null;

export async function initConfig() {
    if (config) return config;
    
    try {
        const isLocalhost = window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/i);
        const basePath = isLocalhost ? '/business-leads-manager' : '';
        
        // Add timeout and retry logic for Vercel deployments
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${basePath}/api/config.php`, {
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        try {
            config = JSON.parse(responseText);
        } catch (e) {
            console.error('Response text:', responseText);
            throw new Error('Failed to parse JSON response');
        }

        config.BASE_PATH = basePath;
        return config;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timeout - please try again');
        }
        console.error('Config initialization error:', error);
        throw error;
    }
}

export function getBasePath() {
    const isVercel = !window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/i);
    return isVercel ? '' : '/business-leads-manager';
}

export async function getApiEndpoints() {
    const cfg = await initConfig();
    return cfg.API_ENDPOINTS;
}