document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullname').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic form validation (can be extended as needed)
        if (!fullName || !username || !password) {
            alert("All fields are required.");
            return;
        }

        // Prepare request data
        const data = {
            fullName: fullName,
            userName: username,
            password: password
        };

        // Send POST request to backend
        fetch('/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // Try to parse as JSON first
                return response.text().then(text => {
                    try {
                        // Try to parse the response text as JSON
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.message || 'Registration failed');
                    } catch (err) {
                        // If it fails to parse JSON, show the raw text
                        throw new Error(text || 'Registration failed');
                    }
                });
            }
            return response.json();
        })
        .then(() => {
            // Show success message
            alert("Registration successful! You can now log in.");
            // Reset form fields
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        })
        .catch(error => {
            // Show only the error message from the API
            alert(error.message);
        });
    });
});
document.getElementById('togglePassword').addEventListener('click', function() {
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
