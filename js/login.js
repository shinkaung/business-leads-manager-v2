import { authenticateUser } from '../js/shared/auth.js';

// Only redirect if already logged in and role exists
const userData = localStorage.getItem('user');
if (userData) {
    const user = JSON.parse(userData);
    if (user.role === 'Admin') {
        window.location.href = '../index.html';
    } else if (user.role === 'SalesPerson') {
        window.location.href = './salesman.html';
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        console.log('Login attempt:', { username, password });
        const authResult = await authenticateUser(username, password);
        console.log('Auth response:', authResult);
        
        if (authResult.success && authResult.role) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                username: authResult.username,
                role: authResult.role
            }));

            if (authResult.role === 'Admin') {
                window.location.href = '../index.html';
            } else if (authResult.role === 'SalesPerson') {
                window.location.href = './salesman.html';
            } else {
                console.error('Invalid role:', authResult.role);
                alert('Invalid user role: ' + authResult.role);
                localStorage.clear();
            }
        } else {
            console.error('Auth failed:', authResult);
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

window.logout = () => {
    import('./shared/auth.js').then(({ logout }) => logout());
};