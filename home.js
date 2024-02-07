let currentPage = 0;
/**
 * check token present or not
 */
function checkTokenAndRedirect() {
    const token = localStorage.getItem('token') || getCookie('token');
    if (!token) {
        // Token is not present, redirect to the index page
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

// Call the checkTokenAndRedirect function on page load
checkTokenAndRedirect();

/**
 * get token stored in cookie
 * @returns token
 */
function getToken() {
    return document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
}

/**
 * when user logouts
 * rmoves token from cookie so after logout cant perfrom any operations
 */
function removeToken() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

$(document).ready(function () {
    //logout
    $(document).ready(function () {
        $('#logout').click(function (event) {
            // Prevent the default link behavior
            event.preventDefault();
            if(confirm("are you sure?")){
            // Call the removeToken function to delete the token cookie
            removeToken();
            }
            window.location.href = 'index.html';
        });
    });

    //sync data
    $('#syncBtn').click(function () {

        // Make an AJAX request to the sync API
        $.ajax({
            url: 'http://localhost:8080/sync',
            type: 'GET',
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            },
            success: function (data) {
                console.log('Sync API Response:', data);
                document.getElementById('message').textContent=data;
                setTimeout(function() {
                    document.getElementById('message').textContent = '';
                }, 3000);
            },
            error: function (error) {
                console.error('Sync API Error:', error);
                document.getElementById('message').textContent="error in sync";
                setTimeout(function() {
                    document.getElementById('message').textContent = '';
                }, 3000);
            }
        });
    });

    //delete customer
    $('#customerTable').on('click', '.delete-btn', function (event) {
        event.preventDefault();

        if (confirm('Are you sure you want to delete this customer?')) {
            const customerId = $(this).data('customer-id');//extract id from delete button to pass it to api

            $.ajax({
                url: 'http://localhost:8080/deleteCustomer/' + customerId,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                },
                success: function (data) {
                    console.log('Delete API Response:', data);
                    if (data) {
                        document.getElementById('message').textContent = "deleted";
                        document.location.href = "./home.html"
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Delete API Error:', error);
                    alert('An error occurred while deleting the customer. Please try again.');
                }
            });
        }
    });

    //edit customer
    $('#customerTable').on('click', '.edit-btn', function (event) {
        event.preventDefault();
        const customerId = $(this).closest('tr').find('td:first').text();//extract id from button
        sessionStorage.setItem('editCustomerId', customerId);//add id to session storage so can access in that page
        window.location.href = '/edit.html';
    });

    //sorting
    $('#customerTable').on('click', '.sortable-header', function (event) {
        const sortField = $(this).data('field');
        const currentSortOrder = $(this).data('sortOrder') || 'ASC'; // Default to 'ASC' if not set

        // Toggle the sort order on each click
        const newSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    
        // Update the data attribute with the new sort order
        $(this).data('sortOrder', newSortOrder);
        const recordsPerPage = $('#rec').val();
        // Make an AJAX request with sorting parameters
        searchCustomers(currentPage, recordsPerPage, sortField, newSortOrder);
    });

    // Function to handle the search
    function searchCustomers(pageNumber, recordsPerPage, sortField, sortOrder) {
        const searchCriteria = $('#criteria').val();
        const searchTerm = $('#searchTerm').val();

        $.ajax({
            url: 'http://localhost:8080/search',
            type: 'GET',
            contentType: 'application/json',
            data: {
                searchCriteria: searchCriteria,
                searchTerm: searchTerm,
                pageNumber: pageNumber,
                records: recordsPerPage,
                sortField: sortField,
                sortOrder: sortOrder
            },
            headers: {
                'Authorization': 'Bearer ' + getToken()
            },
            success: function (data) {
                console.log('Search API Response:', data);
                $('#customerTable tbody').empty();
                //for each data create a dynamic table row
                data.content.forEach(function (customer) {
                    const row = `<tr>
                        <td>${customer.id}</td>
                        <td>${customer.firstName}</td>
                        <td>${customer.lastName}</td>
                        <td class="scrollable-cell">${customer.street}</td>
                        <td class="scrollable-cell">${customer.address}</td>
                        <td>${customer.city}</td>
                        <td>${customer.state}</td>
                        <td class="scrollable-cell">${customer.email}</td>
                        <td>${customer.phoneNumber}</td>
                        <td>
                            <a th:href="@{'/edit/' + ${customer.id}}" class="edit-btn">Edit</a>
                            <a th:href="@{'/delete/' + ${customer.id}}" class="delete-btn" data-customer-id="${customer.id}">Delete</a>
                        </td>
                    </tr>`;
                    $('#customerTable tbody').append(row);
                });
                if(data.empty==true){
                    document.getElementById('message').textContent = "No data";
                }
                setTimeout(function() {
                    document.getElementById('message').textContent = '';
                }, 3000);
                generatePaginationLinks(data.totalPages, pageNumber);
            },
            error: function (error) {
                console.error('Search API Error:', error);
                alert('An error occurred while searching. Please try again.');
            }
        });
    }
    /**
     * used to assist pagination
     * 
     */
    function updateCurrentPage(newPage) {
        currentPage = newPage;
    }

    /**
     * based on number pages generates that many number
     */
    function generatePaginationLinks(totalPages, currentPage) {
        const paginationContainer = $('#paginationContainer');
        paginationContainer.empty();

        for (let i = 0; i < totalPages; i++) {
            const pageLink = $('<a/>', {
                class: 'pagination-link',
                href: '#',
                text: i + 1,
                click: function (event) {
                    event.preventDefault();
                    searchCustomers(i, $('#rec').val());
                }
            });

            if (i === currentPage) {
                pageLink.addClass('active');
            }

            paginationContainer.append($('<li/>').append(pageLink));
        }
    }
    //search functionality
    $('#searchForm').submit(function (event) {
        event.preventDefault();
        const pageNumber = 0;
        const recordsPerPage = $('#rec').val();
        searchCustomers(pageNumber, recordsPerPage);
    });
    //pagination
    $('.pagination-link').click(function (event) {
        event.preventDefault();
        const pageNumber = $(this).text() - 1;//0 based index
        const recordsPerPage = $('#rec').val();
        updateCurrentPage(pageNumber)
        searchCustomers(pageNumber, recordsPerPage);
    });
    //number of records in table
    $('#rec').change(function () {
        const pageNumber = 0;
        const recordsPerPage = $(this).val();
        searchCustomers(pageNumber, recordsPerPage);
    });

    const initialPageNumber = 0;
    const initialRecordsPerPage = $('#rec').val();
    searchCustomers(initialPageNumber, initialRecordsPerPage);

    console.log(getToken());
});
