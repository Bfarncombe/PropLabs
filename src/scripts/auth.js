const env = require("dotenv");

// Firebase configuration
var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "avatech-production.firebaseapp.com",
  databaseURL: "https://avatech-production.firebaseio.com",
  projectId: "avatech-production",
  storageBucket: "avatech-production.appspot.com",
  messagingSenderId: "187261748086",
  appId: "1:187261748086:web:5f341b27108b6e4f643057",
  measurementId: "G-CZB1E9DZJ3",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

// register function
function registerUser() {
  // Get all our input fields
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;

  if (validate_email(email) == false) {
    alert("Email is invalid. Please try again.");
    return;
    // Don't continue running the code
  }
  if (validate_password(password) == false) {
    alert("Password is invalid. Password must be at least 6 characters.");
  }
  // Begin authentication
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      var user = auth.currentUser;

      // Add this user to Firebase Database
      var database_ref = database.ref();

      // Create User data
      var user_data = {
        email: email,
        last_login: Date.now(),
      };

      // Push to Firebase Database
      database_ref.child("users/" + user.uid).set(user_data);
      user.sendEmailVerification();
      // Done
      window.location = "register-confirmed.html";
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code;
      var error_message = error.message;

      alert(error_message);
    });
}

// login function
function login() {
  // Get all our input fields
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;

  // Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
    alert("Email or Password is incorrect");
    return;
    // Don't continue running the code
  }
  // Firebase user authentication
  auth
    .signInWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      var user = auth.currentUser;
      if (!user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }
      // Add this user to Firebase Database
      var database_ref = database.ref();

      // Create User data
      var user_data = {
        last_login: Date.now(),
      };

      // Push to Firebase Database
      database_ref.child("users/" + user.uid).update(user_data);

      // Done => check whether user wants to remain logged in or not before moving to home page

      stayLoggedIn(user);
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code;
      var error_message = error.message;

      alert(error_message);
    });
}

// Allows users to remain logged in depending if they have selected the option
// If the want to stay logged in then that info will be stored in local storage
function stayLoggedIn(user) {
  let keepLoggedIn = document.getElementById("flexCheckDefault").checked;

  if (!keepLoggedIn) {
    sessionStorage.setItem("user", JSON.stringify(user));
    window.location = "home.html";
  } else {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("keepLoggedIn", "true");
    window.location = "home.html";
  }
}

// Send password reset email
function sendNewPassword() {
  email = document.getElementById("email").value;
  if (validate_email(email) == false) {
    alert("Email is invalid. Please try again.");
    return;
  }
  auth.sendPasswordResetEmail(email);
  window.location = "password-reset-complete.html";
}

// Validation Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/;
  if (expression.test(email) == true) {
    // Email is good
    return true;
  } else {
    // Email is not good
    return false;
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false;
  } else {
    return true;
  }
}

// Home page
let username = document.getElementById("user_name");
let signoutLink = document.getElementById("signoutLink");
var current_user = null;

//Get users Name
function getUsername() {
  let keepLoggedIn = localStorage.getItem("keepLoggedIn");

  if (keepLoggedIn == "true") {
    current_user = JSON.parse(localStorage.getItem("user"));
  } else {
    current_user = JSON.parse(sessionStorage.getItem("user"));
  }
  return current_user;
}

// Signout
// remove data from both sessionStorage and localStorage and use auth to sign user out
function signout() {
  sessionStorage.removeItem("user");
  localStorage.removeItem("user");
  localStorage.removeItem("keepLoggedIn");
  auth.signOut().then(() => {
    window.location = "login.html";
  });
}
