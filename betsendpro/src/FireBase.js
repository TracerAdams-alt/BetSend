// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLKnWZZbUKeV8GxQuqKED1nhnV8Q2UNPM",
  authDomain: "betsendproject.firebaseapp.com",
  projectId: "betsendproject",
  storageBucket: "betsendproject.appspot.com"
  messagingSenderId: "28540565270",
  appId: "1:28540565270:web:6bd959c913e90cbe494237",
  measurementId: "G-32X0B5N8R8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
