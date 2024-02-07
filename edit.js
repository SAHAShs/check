/**
 * checks token is present or not if not redirects to login page
 */
function checkTokenAndRedirect() {
    // Get the token from local storage or cookies
    const token = localStorage.getItem('token') || getCookie('token');
    if (!token) {
        console.log('Token is not present, redirecting...');
        window.location.href = '/index.html';
    } else {
        console.log('Token is present');
    }
}

// Function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


// Call the checkTokenAndRedirect function on page load to make sure token is present
checkTokenAndRedirect();


$(document).ready(function () {
   
    //id is passed from home page to edit page
    const customerId = sessionStorage.getItem('editCustomerId');
    sessionStorage.removeItem('editCustomerId');

    // an AJAX request to get customer data by ID
    $.ajax({
        url: 'http://localhost:8080/getCustomer/' + customerId,
        type: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },
        success: function (customer) {
            // set input fields with the value
            $('#id').val(customer.id);
            $('#firstName').val(customer.firstName);
            $('#lastName').val(customer.lastName);
            $('#state').val(customer.state);
            $('#city').val(customer.city);
            $('#street').val(customer.street);
            $('#address').val(customer.address);
            $('#email').val(customer.email);
            $('#phoneNumber').val(customer.phoneNumber);
        },
        error: function (error) {
            console.error('Get Customer API Error:', error);
        }
    });

    //an event listener for the save button click
    $('#form1').submit(function (event) {
        event.preventDefault()
        //collect data from form
        var formData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            street: $('#street').val(),
            address: $('#address').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            email: $('#email').val(),
            phoneNumber: $('#phoneNumber').val() 
        };
        /**
         * Make an AJAX request to update the customer with id
         */
        if (confirm('Are you sure you want to edit this customer?')) {
            $.ajax({
                url: 'http://localhost:8080/updateCustomer/' + $('#id').val(),
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                headers: {
                    'Authorization': 'Bearer ' +  getToken() 
                },
                success: function (data) {
                    alert("data updated")
                    window.location.href="./home.html"
                },
                error: function (error) {
                    document.getElementById("message").textContent="failed"
                    console.error('Update API Error:', error);
                }
            });
        }
    });
});

/**
 * retuern the extracted token from cookie
 * @returns token
 */
function getToken() {
    return document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
}
/**
 * to make sure token is present
 * for testing
 */
console.log(getToken());
