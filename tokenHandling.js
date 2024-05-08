// Function to fetch new token
function refreshToken() {
    axios.post('http://localhost:3000/refresh-token')
        .then(response => {
            // Token refreshed successfully
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            dismissExpirationWarning();
            fetchDataAndRefreshUI(); // Refresh UI after getting new token
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
            alert('An error occurred while refreshing the token. Please try again later.');
        });
}

// Function to handle token expiration warning
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = parseJwt(token);
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = decodedToken.exp - currentTime;
        if (expiresIn <= 20) { // Show warning when token expires in 20 seconds
            document.getElementById('expirationWarning').style.display = 'block';
        }
    }
}

// Function to parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Function to dismiss expiration warning
function dismissExpirationWarning() {
    document.getElementById('expirationWarning').style.display = 'none';
}

// Call checkTokenExpiration on page load
document.addEventListener('DOMContentLoaded', function() {
    checkTokenExpiration();
    setInterval(checkTokenExpiration, 1000); // Check token expiration every second
});
