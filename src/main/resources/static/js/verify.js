document.querySelector('.verify-btn').addEventListener('click', function(event) {
            event.preventDefault();
            const otp = document.getElementById('otp').value;

            if (!otp) {
                alert("Please enter OTP");
                return;
            }

            try {
                const response = await fetch('/verifyOtp?Otp=' + otp, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const text = await response.text();
                if (response.ok) {
                    window.location.href = 'success.html'; // Redirect on success
                } else {
                    alert(text); // Show error message
                }
            } catch (error) {
                alert("Something went wrong, please try again.");
            }
        }
