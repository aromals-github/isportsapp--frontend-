const inputs = document.querySelectorAll(".input-field");
const toggle_btn = document.querySelectorAll(".toggle");
const main = document.querySelector("main");
const bullets = document.querySelectorAll(".bullets span");
const images = document.querySelectorAll(".image");

inputs.forEach((inp) => {
  inp.addEventListener("focus", () => {
    inp.classList.add("active");
  });
  inp.addEventListener("blur", () => {
    if (inp.value != "") return;
    inp.classList.remove("active");
  });
});

toggle_btn.forEach((btn) => {
  btn.addEventListener("click", () => {
    main.classList.toggle("sign-up-mode");
  });
});

function moveSlider() {
  let index = this.dataset.value;

  let currentImage = document.querySelector(`.img-${index}`);
  images.forEach((img) => img.classList.remove("show"));
  currentImage.classList.add("show");

  const textSlider = document.querySelector(".text-group");
  textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;

  bullets.forEach((bull) => bull.classList.remove("active"));
  this.classList.add("active");
}

bullets.forEach((bullet) => {
  bullet.addEventListener("click", moveSlider);
});




const loginForm = document.getElementById('login-form');
const errorElement = document.getElementById('error-message');
const accessTokenExpiryTimeView = Number(localStorage.getItem('accessTokenExpiryTime'));

const refreshAccessTokenExpiryTime = localStorage.getItem('refreshTokenExpiryTime');
const REFRESH_TOKEN_EXPIRY_DAYS = 60;
const ACCESS_TOKEN_EXPIRY_MINUTES = 30;

// Function to check if a token is expired
function isTokenExpired(token) {
  const expiryTime = token.expires_at ? new Date(token.expires_at).getTime() : 0;
  const currentTime = new Date().getTime();
  return currentTime > expiryTime;
}


// Function to refresh the access token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch('https://isportsapp.azurewebsites.net/api/authentication/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }
    const data = await response.json();
    const accessToken = data.tokens.access;
    const refreshToken_1 = data.tokens.refresh;
    const expiryTime = new Date(data.tokens.access.expires_at).getTime();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken_1);
    localStorage.setItem('accessTokenExpiryTime', expiryTime,expiryTime.toPrecision());
    return accessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    // Redirect to the login page if refreshing the token fails
    window.location.href = 'login.html';
  }
}



loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('https://isportsapp.azurewebsites.net/api/authentication/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    const accessToken = data.tokens.access;
    const refreshToken = data.tokens.refresh;
    const expiryTime = new Date(data.tokens.access.expires_at).getTime();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessTokenExpiryTime', expiryTime);
    window.location.href = 'home.html';
  })
  .catch(error => {
    console.error('Error:', error);
    errorElement.innerText = 'Login failed. Please check your email and password and try again.';
  });
});

// Check if access token has expired and refresh it if needed
const accessTokenExpiryTime = localStorage.getItem('accessTokenExpiryTime');
if (accessTokenExpiryTime && isTokenExpired({expires_at: accessTokenExpiryTime})) {
  const refreshToken = localStorage.getItem('refreshToken');
  refreshAccessToken(refreshToken)
  .then(newAccessToken => {
    console.log('Access token refreshed:', newAccessToken);
  })
  .catch(error => {
    console.error('Error refreshing access token:', error);
    // Redirect to the login page if refreshing the token fails
    window.location.href = 'login.html';
  });
}

// Check if refresh token has expired and redirect to login page if needed
const refreshTokenExpiryTime = localStorage.getItem('refreshTokenExpiryTime');
if (refreshTokenExpiryTime && isTokenExpired({expires_at: refreshTokenExpiryTime})) {
  console.log('Refresh token has expired, redirecting to login page.');
  localStorage.clear();
  window.location.href = 'login.html';
}

/// Set a timer to refresh the access token before it expires
const accessTokenRefreshInterval = setInterval(() => {
  const accessTokenExpiryTime = localStorage.getItem('accessTokenExpiryTime');
  if (accessTokenExpiryTime && isTokenExpired({expires_at: accessTokenExpiryTime})) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshAccessToken(refreshToken)
    .then(newAccessToken => {
      console.log('Access token refreshed:', newAccessToken);
    })
    .catch(error => {
      console.error('Error refreshing access token:', error);

      // Redirect to the login page if refreshing the token fails
      window.location.href = 'login.html';
    });
  }
}, ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000);



const form = document.getElementById('signup-form');
const apiUrl = 'https://isportsapp.azurewebsites.net/api/authentication/signup/'; 

form.addEventListener('submit', (event) => {
  event.preventDefault();

  
  const username = document.getElementById('username').value;
  const email = document.getElementById('newemail').value;
  const password = document.getElementById('passwordforsignup').value;
  console.log(username,email,password)
  
  const data = {
    username,
    email,
    password
  };

  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    // If the response is not ok, throw an error
    if (!response.ok) {
      console.log(response.json())
      throw new Error("User already exits with either same username or email");
    }
    
    // If the response is ok, return the response data
    return response.json();
  })
  .then(responseData => {
    console.log(responseData);
    // Display a success message to the user
    alert('User created successfully! Please Sign into continue.');
    // Reset the form fields
    form.reset();
  })
  .catch(error => {
    
    // Display an error message to the user
    alert(error.message);
  });
});
