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
            localStorage.setItem('user', JSON.stringify(user));
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
    return localStorage.getItem('user') !== null;
}

export function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
}