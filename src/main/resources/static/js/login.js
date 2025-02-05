document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
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

            alert('Login successfully!!');

            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        })
        .catch(error => {
            // Handle errors
            alert(error.message || 'An error occurred during login');
        });
    });
});
