// Firebase auth + shared utilities for GAURAV AI
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Firebase configuration (must match provided config exactly)
const firebaseConfig = {
  apiKey: "AIzaSyCgiM5aNDDJhFHGG9-eK-lwAEPM3u4w448",
  authDomain: "sign-in-ae5ca.firebaseapp.com",
  projectId: "sign-in-ae5ca",
  storageBucket: "sign-in-ae5ca.firebasestorage.app",
  messagingSenderId: "976958705327",
  appId: "1:976958705327:web:d99ebeeb72154797d34e5a",
  measurementId: "G-66LVVCPBZ7"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Shared constants
export const adminEmail = "admin@gauravai.com";
export const coursesCatalog = [
  {
    id: "course1",
    title: "AI Foundation",
    price: 999,
    qrImage: "assets/upi-999.svg",
    description: "Master AI fundamentals, ML workflows, and core tooling."
  },
  {
    id: "course2",
    title: "Applied AI",
    price: 1499,
    qrImage: "assets/upi-1499.svg",
    description: "Build real-world AI products with structured pipelines."
  },
  {
    id: "course3",
    title: "Advanced AI Mastery",
    price: 1500,
    qrImage: "assets/upi-1500.svg",
    description: "Scale AI systems, MLOps, and enterprise deployment."
  }
];

// UI helpers
export const toggleLoader = (state) => {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  loader.classList.toggle("active", state);
};

const showToast = (message, isError = false) => {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.style.color = isError ? "#ff6b6b" : "#36d399";
};

// Authentication flows
const signupForm = document.querySelector("#signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    toggleLoader(true);
    const name = signupForm.querySelector("#signup-name").value.trim();
    const email = signupForm.querySelector("#signup-email").value.trim();
    const password = signupForm.querySelector("#signup-password").value.trim();

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const role = email.toLowerCase() === adminEmail ? "admin" : "user";
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email,
        role,
        purchasedCourses: []
      });
      showToast("Account created. Redirecting to login...");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    } catch (error) {
      showToast(error.message, true);
    } finally {
      toggleLoader(false);
    }
  });
}

const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    toggleLoader(true);
    const email = loginForm.querySelector("#login-email").value.trim();
    const password = loginForm.querySelector("#login-password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Welcome back! Checking your workspace...");
    } catch (error) {
      showToast(error.message, true);
      toggleLoader(false);
    }
  });
}

const logoutButton = document.querySelector("[data-logout]");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    toggleLoader(true);
    await signOut(auth);
    window.location.href = "index.html";
  });
}

// Session handling and protected routes
const protectedPage = document.body?.dataset?.protected === "true";
const adminOnly = document.body?.dataset?.admin === "true";
const redirectOnAuth = document.body?.dataset?.redirect === "true";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (protectedPage) {
      window.location.href = "login.html";
    }
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  if (!userData) {
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName || "Learner",
      email: user.email,
      role: user.email === adminEmail ? "admin" : "user",
      purchasedCourses: []
    });
  }

  if (adminOnly && userData?.role !== "admin") {
    window.location.href = "dashboard.html";
    return;
  }

  if (!adminOnly && userData?.role === "admin" && !window.location.pathname.endsWith("admin.html")) {
    window.location.href = "admin.html";
    return;
  }

  if (redirectOnAuth) {
    toggleLoader(false);
    window.location.href = userData?.role === "admin" ? "admin.html" : "dashboard.html";
  }
});

// Expose Firestore helpers for admin/analytics usage
export const firestoreUtils = {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs
};
