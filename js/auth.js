const AIRTABLE_API_KEY = 'pataBu2eaV0V5tEHx.2fde3b7ffdc42d856e167a7551f74f8770a41af956087fa09a2df831fd632c3c';
const AIRTABLE_BASE_ID = 'app5GPyIEcYQTRgST';
const USERS_TABLE_NAME = 'User';

function getBasePath() {
    return window.location.hostname === 'shinkaung.github.io' 
        ? '/business-leads-manager'
        : '';
}

export async function authenticateUser(username, password) {
    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USERS_TABLE_NAME}?filterByFormula=AND({username}='${username}',{password}='${password}')`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch from Airtable:', response.status);
            return false;
        }

        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
            const user = data.records[0];
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userId', user.id);
            sessionStorage.setItem('username', user.fields.username);
            sessionStorage.setItem('role', user.fields.Role);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

// Only check auth status, don't redirect
export function isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

export function logout() {
    sessionStorage.clear();
    const basePath = getBasePath();
    
    // Check current path to determine correct redirect
    const isInPagesDirectory = window.location.pathname.includes('/pages/');
    const loginPath = isInPagesDirectory 
        ? '../pages/login.html' 
        : './pages/login.html';
        
    window.location.replace(basePath + loginPath);
}