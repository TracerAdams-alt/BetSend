// ==============================
//  Firebase Initialization File
//  Safe, clean, production-ready
// ==============================

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// ------------------------------
// 🔥 Your Firebase configuration
// ------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDLKnWZZbUKeV8GxQuqKED1nhnV8Q2UNPM",
  authDomain: "betsendproject.firebaseapp.com",
  projectId: "betsendproject",
  storageBucket: "betsendproject.appspot.com",
  messagingSenderId: "28540565270",
  appId: "1:28540565270:web:6bd959c913e90cbe494237",
  measurementId: "G-32X0B5N8R8"
};

// ------------------------------
// 🔥 Initialize Firebase services
// ------------------------------
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);

// ------------------------------
// 🔥 Re-export useful auth helpers
// ------------------------------
export {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// ------------------------------
// Optional: expose app for debugging
// ------------------------------
// window.firebaseApp = app;

export default app;
