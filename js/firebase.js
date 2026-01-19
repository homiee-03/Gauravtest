// Shared Firebase initialization for lightweight auth pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgiM5aNDDJhFHGG9-eK-lwAEPM3u4w448",
  authDomain: "sign-in-ae5ca.firebaseapp.com",
  projectId: "sign-in-ae5ca",
  storageBucket: "sign-in-ae5ca.firebasestorage.app",
  messagingSenderId: "976958705327",
  appId: "1:976958705327:web:d99ebeeb72154797d34e5a",
  measurementId: "G-66LVVCPBZ7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
