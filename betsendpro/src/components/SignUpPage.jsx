import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText
} from "@ionic/react";

import { auth, db, googleProvider } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

const SignUpPage = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.detail.value
    }));
  };

  // ======================================================
  // 🔥 Save user profile + contestant entry to Firestore
  // ======================================================
  const createUserInFirestore = async (user) => {
    const uid = user.uid;

    const firstName = user.displayName?.split(" ")[0] || "";
    const lastName = user.displayName?.split(" ")[1] || "";

    // USERS collection
    await setDoc(
      doc(db, "users", uid),
      {
        firstName,
        lastName,
        wings: [],
        photoDataUrl: "",
        updatedAt: Date.now()
      },
      { merge: true }
    );

    // CONTESTANTS collection
    await setDoc(
      doc(db, "contestants", uid),
      {
        burgerVotes: 0,
        friesVotes: 0,
        firstName,
        lastName,
        wings: [],
        photoDataUrl: ""
      },
      { merge: true }
    );
  };

  // ======================================================
  // 🔥 Email/Password Signup
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setMessage("Please fill out all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCred.user;

      await createUserInFirestore(user);

      setMessage("Account created! Welcome.");
    } catch (err) {
      console.error(err);
      setMessage("Sign-up failed: " + err.message);
    }
  };

  // ======================================================
  // 🔥 Google Sign-In
  // ======================================================
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await createUserInFirestore(user);

      setMessage(`Signed in with Google as ${user.displayName}`);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage("Google sign-in failed. Please try again.");
    }
  };

  // Error styling
  const lower = message.toLowerCase();
  const isError =
    lower.includes("failed") ||
    lower.includes("fill") ||
    lower.includes("match");

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          style={{
            padding: "16px",
            maxWidth: "480px",
            margin: "0 auto"
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>Join Speedfly Casino</h2>
          <p style={{ opacity: 0.8 }}>
            Create an account to start playing.
          </p>

          {message && (
            <IonText color={isError ? "danger" : "success"}>
              <p style={{ marginTop: "12px" }}>{message}</p>
            </IonText>
          )}

          {/* GOOGLE SIGN-IN */}
          <IonButton
            expand="block"
            color="light"
            onClick={handleGoogleSignIn}
            style={{ marginTop: "16px" }}
          >
            Continue with Google
          </IonButton>

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.2)",
              margin: "20px 0"
            }}
          />

          {/* EMAIL SIGN-UP FORM */}
          <form onSubmit={handleSubmit}>
            <IonList>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={form.email}
                  onIonChange={handleChange("email")}
                  placeholder="you@example.com"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={form.password}
                  onIonChange={handleChange("password")}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Confirm Password</IonLabel>
                <IonInput
                  type="password"
                  value={form.confirmPassword}
                  onIonChange={handleChange("confirmPassword")}
                />
              </IonItem>
            </IonList>

            <IonButton
              type="submit"
              expand="block"
              color="primary"
              style={{ marginTop: "16px" }}
            >
              Create Account
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignUpPage;
