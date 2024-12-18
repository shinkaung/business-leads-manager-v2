import { authenticateUser } from './auth.js';

// Check if already logged in
const userData = localStorage.getItem('user');
if (userData) {
    window.location.href = '../index.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const isAuthenticated = await authenticateUser(username, password);
        if (isAuthenticated) {
            window.location.href = '../index.html';
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

window.logout = () => {
    import('./auth.js').then(({ logout }) => logout());
};