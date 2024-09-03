document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Create an object to hold the form data
    const formData = {
        enrollmentNo: document.getElementById('enrollmetnNo').value,
        email: document.getElementById('email').value,
        password: document.getElementById('pw').value,
    };

    // Send the POST request using fetch
    fetch('http://127.0.0.1:5500/project/notifier/index.html', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Convert the form data to a JSON string
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        console.log('Success:', data);
        alert('Form submitted successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting the form.');
    });
});