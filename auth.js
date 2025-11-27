const BACKEND_URL = 'https://shop-backend-0b4p.onrender.com'; // Your Render URL

// 1. AUTH GUARD (Runs immediately)
(function checkAccess() {
    const path = window.location.pathname;
    const user = localStorage.getItem('real_user_id');
    
    // Is the user on the Login Page?
    const isLoginPage = path.includes('login.html');

    if (isLoginPage) {
        // If logged in, kick them to Home
        if (user) window.location.href = 'index.html';
    } else {
        // If NOT logged in, kick them to Login
        if (!user) {
            window.location.href = 'login.html';
        }
    }
})();

// 2. GOOGLE LOGIN RESPONSE
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    console.log("Processing: " + responsePayload.name);

    fetch(`${BACKEND_URL}/api/auth/google`, {
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
            // Save Session
            localStorage.setItem('real_user_id', data.user.googleId);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_pic', data.user.picture);
            
            // Redirect to Dashboard
            window.location.href = 'index.html';
        }
    })
    .catch(err => console.error("Login Error:", err));
}

// 3. UI UPDATE (For Navbar)
function updateAuthUI() {
    const userName = localStorage.getItem('user_name');
    const userPic = localStorage.getItem('user_pic');
    
    // If on login page, render the Big Button
    if (window.location.pathname.includes('login.html')) {
        google.accounts.id.initialize({
            client_id: "158272157316-irpbe2f77n313ntai8oqre1uv7klngs5.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("google-btn-container"),
            { theme: "filled_black", size: "large", shape: "pill", width: "250", text: "continue_with" } 
        );
        return; 
    }

    // If on internal pages, show Profile
    const profileDiv = document.getElementById('user-profile');
    if (profileDiv && userName) {
        profileDiv.style.display = 'flex';
        document.getElementById('user-name').innerText = userName;
        document.getElementById('user-pic').src = userPic;
        
        // Hide the old login button container in navbar if it exists
        const oldBtn = document.getElementById('google-btn');
        if(oldBtn) oldBtn.style.display = 'none';
    }
}

// 4. LOGOUT
function logout() {
    localStorage.clear(); // Wipe everything
    window.location.href = 'login.html';
}

// 5. DELETE ACCOUNT
function deleteAccount() {
    const userId = localStorage.getItem('real_user_id');
    
    // 1. Confirm First
    if(!confirm("⚠️ ARE YOU SURE? \n\nThis will permanently delete your account, order history, and wishlist. This action cannot be undone.")) {
        return;
    }

    // 2. Define URL (Safe method)
    const backendURL = 'https://shop-backend-0b4p.onrender.com'; 

    // 3. Send Request
    fetch(`${backendURL}/api/auth/delete/${userId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("Account Deleted Successfully.");
            logout(); // Only logout if successful
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server Error. Please try again.");
    });
}

// Helper: Decode Token
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

window.addEventListener('load', updateAuthUI);