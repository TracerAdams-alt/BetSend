// =======================
//  FIREBASE INITIALIZATION
// =======================
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Your Firebase Config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyDLKnWZZbUKeV8GxQuqKED1nhnV8Q2UNPM",
  authDomain: "betsendproject.firebaseapp.com",
  projectId: "betsendproject",
  storageBucket: "betsendproject.appspot.com",
  messagingSenderId: "28540565270",
  appId: "1:28540565270:web:6bd959c913e90cbe494237",
  measurementId: "G-32X0B5N8R8"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Auth + Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);


// ===========================================
//  AUTO-CREATE CONTESTANT WHEN USER REGISTERS
// ===========================================
export async function createContestantIfMissing(uid) {
  const ref = doc(db, "contestants", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      burgerVotes: 0,
      friesVotes: 0,
      createdAt: Date.now()
    });
  }
}

export default app;
