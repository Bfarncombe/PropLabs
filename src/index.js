import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyC3HdoLNxy4ov8kVaQ18t7LhmWItYhH-dI",
  authDomain: "avatech-production.firebaseapp.com",
  databaseURL: "https://avatech-production.firebaseio.com",
  projectId: "avatech-production",
  storageBucket: "avatech-production.appspot.com",
  messagingSenderId: "187261748086",
  appId: "1:187261748086:web:5f341b27108b6e4f643057",
  measurementId: "G-CZB1E9DZJ3",
});

const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    console.log("logged in");
  } else {
    console.log("No user");
  }
});
