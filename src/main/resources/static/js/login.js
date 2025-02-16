document.addEventListener('DOMContentLoaded', function () {
    // Handle manual login form submission
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Prepare request data
        const data = {
            userName: username,
            password: password
        };

        // Send POST request to login endpoint
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text || 'Login failed') });
                }
                return response.text();
            })
            .then(() => {
                localStorage.setItem('username', username);
                window.location.href = 'chat.html';
            })
            .catch(error => {
                // Handle errors
                alert(error.message || 'An error occurred during login');
            });
    });

    // Handle OAuth2 token from URL (if present)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        // Store the token in localStorage or sessionStorage
        localStorage.setItem('accessToken', token);

        // Redirect to the chat page or perform other actions
        window.location.href = 'chat.html';
    }

    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', function () {
        let passwordField = document.getElementById('password');
        let icon = this.querySelector('img'); // Ensure we're targeting the img inside the <i>

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.src = 'img/eye.png'; // Make sure this path is correct
        } else {
            passwordField.type = 'password';
            icon.src = 'img/eyebrow.png'; // Make sure this path is correct
        }
    });
});