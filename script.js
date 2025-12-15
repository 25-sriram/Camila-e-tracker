
async function handleSignup(username, email, password) {
    try {
        // --- FIX: Replace localhost with your live Render backend URL ---
        const BACKEND_URL = 'https://camila-e-tracker1.onrender.com';

        const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        // ... (rest of the logic)
        if (response.ok) {

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);


            window.location.href = 'main.html';
        } else {

            alert('Signup Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Network or Server Error:', error);
        alert('Could not connect to the server.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username-input').value;
            const email = document.getElementById('email-input').value;
            const password = document.getElementById('password-input').value;

            handleSignup(username, email, password);
        });
    }
});