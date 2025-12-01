// // auth.js - STRICT MODE (No Guest Access)

// // 1. THE SECURITY GUARD (Runs immediately)
// (function checkAuth() {
//     const userId = localStorage.getItem('real_user_id');
//     const path = window.location.pathname;
//     const isLoginPage = path.includes('login.html');

//     if (!userId && !isLoginPage) {
//         // Not logged in? Go to Login Page
//         window.location.href = 'login.html';
//     } 
//     else if (userId && isLoginPage) {
//         // Already logged in? Go to Shop (Don't let them stay on login page)
//         window.location.href = 'shop.html';
//     }
// })();

// // 2. HANDLE LOGIN RESPONSE
// function handleCredentialResponse(response) {
//     const responsePayload = decodeJwtResponse(response.credential);
//     console.log("Logged in as: " + responsePayload.name);

//     const backendURL = 'https://shop-backend-0b4p.onrender.com'; 

//     fetch(`${backendURL}/api/auth/google`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//             token: response.credential,
//             userData: responsePayload
//             // No guestId needed anymore
//         })
//     })
//     .then(res => res.json())
//     .then(data => {
//         if(data.success) {
//             // Save Session
//             localStorage.setItem('real_user_id', data.user.googleId);
//             localStorage.setItem('user_name', data.user.name);
//             localStorage.setItem('user_pic', data.user.picture);
            
//             // Redirect to main site
//             window.location.href = 'index.html';
//         }
//     })
//     .catch(err => console.error("Login Error:", err));
// }

// // 3. RENDER BUTTON (Only needed on Login Page or if we want re-auth)
// window.onload = function() {
//     // If we are on the login page, render the button
//     if(document.getElementById('google-btn')) {
//         google.accounts.id.initialize({
//             client_id: "158272157316-irpbe2f77n313ntai8oqre1uv7klngs5.apps.googleusercontent.com", // <--- PASTE YOUR ID HERE
//             callback: handleCredentialResponse
//         });
//         google.accounts.id.renderButton(
//             document.getElementById("google-btn"),
//             { theme: "outline", size: "large", shape: "pill", width: "250" } 
//         );
//     }

//     // If we are on internal pages, show profile in Navbar
//     const userName = localStorage.getItem('user_name');
//     const userPic = localStorage.getItem('user_pic');
    
//     if (userName && document.getElementById('user-profile')) {
//         document.getElementById('user-profile').style.display = 'flex';
//         document.getElementById('user-name').innerText = userName;
//         document.getElementById('user-pic').src = userPic;
//         // Hide google button inside navbar if it exists
//         if(document.getElementById('google-btn-nav')) {
//             document.getElementById('google-btn-nav').style.display = 'none';
//         }
//     }
// }

// function logout() {
//     localStorage.clear(); // Wipe everything
//     window.location.href = 'login.html'; // Kick back to login
// }

// function decodeJwtResponse(token) {
//     var base64Url = token.split('.')[1];
//     var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
//     return JSON.parse(jsonPayload);
// }

// function deleteAccount() {
//     const userId = localStorage.getItem('real_user_id');
//     if(!confirm("⚠️ ARE YOU SURE? This cannot be undone.")) return;

//     const backendURL = 'https://shop-backend-0b4p.onrender.com'; 

//     fetch(`${backendURL}/api/auth/delete/${userId}`, { method: 'DELETE' })
//     .then(res => res.json())
//     .then(data => {
//         alert(data.message);
//         logout();
//     })
//     .catch(err => alert("Error: " + err.message));
// }

// auth.js - SMART REDIRECT SYSTEM

// 1. THE SECURITY GUARD (Runs immediately)
(function checkAuth() {
    const userId = localStorage.getItem('real_user_id');
    const currentPath = window.location.href; // Get full URL
    const isLoginPage = currentPath.includes('login.html');

    if (!userId && !isLoginPage) {
        // NOT LOGGED IN?
        // Step A: Remember where they were trying to go
        sessionStorage.setItem('return_to', currentPath);
        
        // Step B: Kick them to Login
        window.location.href = 'login.html';
    } 
    else if (userId && isLoginPage) {
        // ALREADY LOGGED IN?
        // Check if there is a saved return place, otherwise default to Shop
        const returnTo = sessionStorage.getItem('return_to');
        if (returnTo) {
            window.location.href = returnTo;
        } else {
            window.location.href = 'index.html';
        }
    }
})();

// 2. HANDLE LOGIN RESPONSE
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
            userData: responsePayload,
            guestId: localStorage.getItem('guest_user_id')
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            // Save Session
            localStorage.setItem('real_user_id', data.user.googleId);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_pic', data.user.picture);
            localStorage.removeItem('guest_user_id'); // Cleanup guest

            // === SMART REDIRECT LOGIC ===
            const returnTo = sessionStorage.getItem('return_to');
            
            if (returnTo) {
                // Scenario B: They came from a specific page (e.g., Iframe/WP Form)
                // Clear the memory and send them back
                sessionStorage.removeItem('return_to');
                window.location.href = returnTo;
            } else {
                // Scenario A: They came directly to login.html
                window.location.href = 'index.html'; 
            }
        }
    })
    .catch(err => console.error("Login Error:", err));
}

// 3. RENDER BUTTON & UI
window.onload = function() {
    // If on login page, render button
    if(document.getElementById('google-btn')) {
        google.accounts.id.initialize({
            client_id: "158272157316-irpbe2f77n313ntai8oqre1uv7klngs5.apps.googleusercontent.com", 
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("google-btn"),
            { theme: "outline", size: "large", shape: "pill", width: "250" } 
        );
    }

    // Update Navbar Profile
    const userName = localStorage.getItem('user_name');
    const userPic = localStorage.getItem('user_pic');
    
    if (userName && document.getElementById('user-profile')) {
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('user-name').innerText = userName;
        document.getElementById('user-pic').src = userPic;
        if(document.getElementById('google-btn')) {
             // Hide the login button if it exists in navbar (not main login page)
             if(!window.location.href.includes('login.html')) {
                 document.getElementById('google-btn').style.display = 'none';
             }
        }
    }
}

function logout() {
    localStorage.clear();
    sessionStorage.clear(); // Clear redirect history too
    window.location.href = 'login.html';
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function deleteAccount() {
    const userId = localStorage.getItem('real_user_id');
    if(!confirm("⚠️ ARE YOU SURE? This cannot be undone.")) return;

    const backendURL = 'https://shop-backend-0b4p.onrender.com'; 

    fetch(`${backendURL}/api/auth/delete/${userId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        logout();
    })
    .catch(err => alert("Error: " + err.message));
}