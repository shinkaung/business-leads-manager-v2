import { authenticateUser, isAuthenticated } from './auth.js';

// Redirect if already authenticated
if (isAuthenticated()) {
    window.location.replace('../index.html');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const isAuthenticated = await authenticateUser(username, password);
        
        if (isAuthenticated) {
            window.location.replace('../index.html');
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