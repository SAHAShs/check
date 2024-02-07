function login(event, redirectCallback) {
    event.preventDefault();
    //collect data
    var username = $('#username').val();
    var password = $('#password').val();
    //object of credentials
    var credentials = {
        username: username,
        password: password
    };

    // Disable the login button and show loading spinner
    $('#loginButton').prop('disabled', true);
    $('#errorMessage').text('');
    $('#loadingSpinner').show();

    $.ajax({
        type: 'POST',
        url: 'http://localhost:8080/login',
        contentType: 'application/json',
        data: JSON.stringify(credentials),
        success: function (response) {
            if (response && response.token) {
                document.cookie = `token=${response.token}; path=/`;
                redirectCallback(response.token);
            } else {
                $('#errorMessage').text('Invalid credentials');
            }
        },
        error: function (xhr, status, error) {
            console.error('Login failed:', error);
            if (xhr.responseJSON && xhr.responseJSON.message) {
                $('#errorMessage').text(xhr.responseJSON.message);
            } else {
                $('#errorMessage').text('An error occurred during login.');
            }

            // Enable the login button and hide loading spinner
            $('#loginButton').prop('disabled', false);
            $('#loadingSpinner').hide();
        }
    });
}

$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        login(event, function () {
            window.location.href = './home.html';
        });
    });
});
console.log(getToken)
function getToken() {
    return document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
}