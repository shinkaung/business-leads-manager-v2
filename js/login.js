import { authenticateUser } from './auth.js';

const BASE_PATH = window.location.hostname === 'shinkaung.github.io' 
    ? '/business-leads-manager'
    : '';

// Update the redirect path
if (sessionStorage.getItem('isAuthenticated') === 'true') {
    window.location.replace(`${BASE_PATH}/index.html`);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const isAuthenticated = await authenticateUser(username, password);
        if (isAuthenticated) {
            window.location.replace(`${BASE_PATH}/index.html`);
        } else {
            alert('Invalid username or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

window.logout = () => {
    import('./auth.js').then(({ logout }) => logout());
};