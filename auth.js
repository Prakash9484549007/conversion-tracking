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

// auth.js - ROBUST REDIRECT SYSTEM

// 1. THE SECURITY GUARD (Runs immediately)
(function checkAuth() {
    const userId = localStorage.getItem('real_user_id');
    const currentPath = window.location.href; 
    const isLoginPage = currentPath.includes('login.html');

    // SCENARIO 1: Not logged in, trying to access protected pages
    if (!userId && !isLoginPage) {
        sessionStorage.setItem('return_to', currentPath); // Remember where they wanted to go
        window.location.href = 'login.html';
    } 
    // SCENARIO 2: Logged in, but sitting on login page
    else if (userId && isLoginPage) {
        // Redirect them out of here immediately
        const returnTo = sessionStorage.getItem('return_to');
        if (returnTo && !returnTo.includes('login.html')) {
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
            localStorage.removeItem('guest_user_id'); 

            // === FIXED REDIRECT LOGIC ===
            let returnTo = sessionStorage.getItem('return_to');

            // SAFETY CHECK: If 'return_to' is the login page itself, ignore it!
            if (returnTo && returnTo.includes('login.html')) {
                returnTo = null;
            }
            
            if (returnTo) {
                // Scenario B: User came from a specific page (Shop, WP Form, etc)
                sessionStorage.removeItem('return_to'); // Clear memory
                window.location.href = returnTo;
            } else {
                // Scenario A: User came directly to Login, send to Home
                // Using '/' is safer on Vercel than 'index.html'
                window.location.href = '/index.html'; 
            }
        } else {
            // IF BACKEND FAILS
            alert("Login Failed: " + (data.error || "Unknown Error"));
            console.error("Backend Error:", data);
        }
    })
    .catch(err => {
        console.error("Network/Fetch Error:", err);
        alert("Connection Error. Please try again.");
    });
}

// 3. RENDER BUTTON & UI
window.onload = function() {
    // Render Google Button (Only if the element exists)
    const btnContainer = document.getElementById('google-btn');
    if(btnContainer) {
        google.accounts.id.initialize({
            client_id: "158272157316-irpbe2f77n313ntai8oqre1uv7klngs5.apps.googleusercontent.com", 
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            btnContainer,
            { theme: "outline", size: "large", shape: "pill", width: "250" } 
        );
    }

    // Update Navbar Profile (Only if logged in)
    const userName = localStorage.getItem('user_name');
    const userPic = localStorage.getItem('user_pic');
    
    if (userName && document.getElementById('user-profile')) {
        document.getElementById('user-profile').style.display = 'flex';
        document.getElementById('user-name').innerText = userName;
        document.getElementById('user-pic').src = userPic;
        
        // Hide google button inside navbar if user is logged in
        if(document.getElementById('google-btn')) {
             // Only hide if we are NOT on the dedicated login page
             if(!window.location.href.includes('login.html')) {
                 document.getElementById('google-btn').style.display = 'none';
             }
        }
    }
}

function logout() {
    localStorage.clear();
    sessionStorage.clear(); 
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