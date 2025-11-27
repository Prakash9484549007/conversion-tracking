// auth.js - Handles Google Login for all pages

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    console.log("Logged in as: " + responsePayload.name);

    // REPLACE WITH YOUR RENDER BACKEND URL
    const backendURL = 'https://shop-backend-0b4p.onrender.com'; 

    fetch(`${backendURL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            token: response.credential,
            userData: responsePayload
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            localStorage.setItem('real_user_id', data.user.googleId);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_pic', data.user.picture);
            updateAuthUI(); // Update buttons immediately
        }
    })
    .catch(err => console.error("Login Error:", err));
}

function updateAuthUI() {
    const userName = localStorage.getItem('user_name');
    const userPic = localStorage.getItem('user_pic');
    const googleBtn = document.getElementById('google-btn');
    const profileDiv = document.getElementById('user-profile');

    if (userName && userPic) {
        // User is Logged In
        if(googleBtn) googleBtn.style.display = 'none';
        if(profileDiv) {
            profileDiv.style.display = 'flex';
            document.getElementById('user-name').innerText = userName;
            document.getElementById('user-pic').src = userPic;
        }
    } else {
        // User is Logged Out
        if(profileDiv) profileDiv.style.display = 'none';
        if(googleBtn) {
            googleBtn.style.display = 'block';
            // Render the Google Button
            if (typeof google !== 'undefined') {
                 google.accounts.id.initialize({
                    client_id: "158272157316-irpbe2f77n313ntai8oqre1uv7klngs5.apps.googleusercontent.com", // <--- PASTE CLIENT ID HERE
                    callback: handleCredentialResponse
                });
                google.accounts.id.renderButton(
                    googleBtn,
                    { theme: "outline", size: "medium", shape: "pill" } 
                );
            }
        }
    }
}

function logout() {
    localStorage.removeItem('real_user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_pic');
    location.reload();
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Run on page load
window.addEventListener('load', updateAuthUI);