document.querySelector('.reset-btn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const email = document.getElementById('email').value;



    // Send a POST request to the backend with the email as a query parameter
    fetch(`/forgetPassword/sendOtp?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }), // Body should match the API's expectations
    })
    .then(response => {
        // Check if the response is a valid JSON
        if (response.ok) {
            return response.json(); // Parse JSON if valid
        } else {
            // If not a valid JSON, treat it as plain text
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .then(data => {
        if (data.success) {
            // Show success message
            showMessage('OTP sent to your email.');
            // Redirect to the verify page after 3 seconds
            setTimeout(() => {
                window.location.href = 'verify.html';
            }, 3000);
        } else {
            // Show error message from API
            showError(data.message || 'An error occurred, please try again later.');
        }
    })
    .catch(error => {
        // Handle network, server errors, or plain text responses (e.g., "Email Not Found")
        showError(error.message || 'An error occurred, please try again later.');
    });
});

// Function to show error message
function showError(message) {
    const errorElement = document.createElement('span');
    errorElement.style.color = 'red';
    errorElement.textContent = message;
    document.querySelector('.forgot-password-card').appendChild(errorElement);
}

// Function to show success message
function showMessage(message) {
    const successElement = document.createElement('span');
    successElement.style.color = 'green';
    successElement.textContent = message;
    document.querySelector('.forgot-password-card').appendChild(successElement);
}
