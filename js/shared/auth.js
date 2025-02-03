import { getBasePath } from '../config.js';

export async function authenticateUser(username, password) {
    try {
        const basePath = await getBasePath();
        const response = await fetch(`${basePath}/backend/api/auth.php`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const text = await response.text(); // Get response as text first
        
        try {
            const data = JSON.parse(text);
            console.log('Auth response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }
            
            return data;
        } catch (e) {
            console.error('Response text:', text);
            throw new Error('Invalid server response');
        }
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