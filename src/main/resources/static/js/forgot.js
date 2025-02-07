document.querySelector('.reset-btn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const email = document.getElementById('email').value;



    // Send a POST request to the backend with the email as a query parameter
    fetch(`/forgetPassword/sendOtp?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }), // Ensure correct format
    })
    .then(response => {
        return response.text().then(message => {
            if (response.ok) {
                showMessage(message); // Show success message
                setTimeout(() => {
                    window.location.href = 'verify.html'; // Redirect after 1 second
                }, 1000);
            } else {
                throw new Error(message || 'Something went wrong'); // Handle API error messages
            }
        });
    })
    .catch(error => {
        showError(error.message); // Display the API or network error message
    });
});

// Function to show error message
function showError(message) {
    clearMessages();
    const errorElement = document.createElement('span');
    errorElement.style.color = 'red';
    errorElement.textContent = message;
    document.querySelector('.forgot-password-card').appendChild(errorElement);
}

// Function to show success message
function showMessage(message) {
    clearMessages();
    const successElement = document.createElement('span');
    successElement.style.color = 'green';
    successElement.textContent = message;
    document.querySelector('.forgot-password-card').appendChild(successElement);
}

// Function to clear messages before showing new ones
function clearMessages() {
    const messageContainer = document.querySelector('.forgot-password-card');
    messageContainer.querySelectorAll('span').forEach(span => span.remove());
}
