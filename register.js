$(document).ready(function () {
    console.log(getToken())
    const form = $('#form1');

    //an event listener for form submission
    form.submit(function (event) {
        event.preventDefault();

        // Collect form data
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const state = $('#state').val();
        const city = $('#city').val();
        const street = $('#street').val();
        const address = $('#adress').val();
        const phoneNumber = $('#phoneNumber').val();
        const email = $('#email').val();

        //object with customer data
        const customerData = {
            firstName: firstName,
            lastName: lastName,
            state: state,
            city: city,
            street: street,
            address: address,
            phoneNumber: phoneNumber,
            email: email
        };

        // API call to add a customer
        $.ajax({
            url: 'http://localhost:8080/createCustomer',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            },
            data: JSON.stringify(customerData),
            success: function (data) {
                console.log('Add Customer API Response:', data);
                alert("user saved")
                window.location.href="./home.html"
            },
            error: function (error) {
                console.error('Add Customer API Error:', error);
                document.getElementById('errormsg').textContent="error"
            }
        });
    });

    // Function to get the token from cookies
    function getToken() {
        return document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    }
});