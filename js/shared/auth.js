import { getBasePath } from '../config.js';

export async function authenticateUser(username, password) {
    try {
        const response = await fetch('/business-leads-manager/backend/api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        console.log('Auth response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
        }
        
        return data;
    } catch (error) {
        console.error('Auth error:', error);
        return { 
            success: false,
            message: error.message 
        };
    }
}

export function getUserRole() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        return user.role;
    }
    return null;
}

export function isAuthenticated() {
    return localStorage.getItem('user') !== null;
}

export async function logout() {
    localStorage.clear();
    const basePath = await getBasePath();
    window.location.href = `${basePath}/pages/login.html`;
}