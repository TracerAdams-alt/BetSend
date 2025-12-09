// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Your Firebase config (✔ use your real values)
const firebaseConfig = {
  apiKey: "AIzaSyDLKnWZZbUKeV8GxQuqKED1nhnV8Q2UNPM",
  authDomain: "betsendproject.firebaseapp.com",
  projectId: "betsendproject",
  storageBucket: "betsendproject.firebasestorage.app",
  messagingSenderId: "28540565270",
  appId: "1:28540565270:web:6bd959c913e90cbe494237",
  measurementId: "G-32X0B5N8R8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Initialize Auth (THIS is what we actually need)
const auth = getAuth(app);

// Google provider for sign-in
const googleProvider = new GoogleAuthProvider();

// Export so your SignUpPage can use them
export { auth, googleProvider, signInWithPopup };
