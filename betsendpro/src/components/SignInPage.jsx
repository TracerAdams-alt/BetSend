import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from "@ionic/react";

import { auth, googleProvider, db, createContestantIfMissing } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SignInPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.detail.value,
    }));
  };

  // ====================================================
  //  HANDLE EMAIL / PASSWORD SIGN-IN
  // ====================================================
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = result.user;

      // Ensure Firestore profile exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          firstName: "",
          lastName: "",
          photoDataUrl: "",
          wings: [],
          burgerVotes: 0,
          friesVotes: 0,
          createdAt: Date.now(),
        });
      }

      // Ensure contestant entry exists
      await createContestantIfMissing(user.uid);

      setMessage("Signed in successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Login failed: " + err.message);
    }
  };

  // ====================================================
  //  GOOGLE SIGN-IN
  // ====================================================
  const handleGoogleSignIn = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Ensure Firestore profile exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          photoDataUrl: user.photoURL || "",
          wings: [],
          burgerVotes: 0,
          friesVotes: 0,
          createdAt: Date.now(),
        });
      }

      // Ensure contestant entry exists
      await createContestantIfMissing(user.uid);

      setMessage("Signed in with Google!");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage("Google sign-in failed.");
    }
  };

  const isError = message.toLowerCase().includes("fail");

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          style={{
            padding: "16px",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          <h2>Welcome Back</h2>
          <p style={{ opacity: 0.8 }}>Sign in to continue.</p>

          {message && (
            <IonText color={isError ? "danger" : "success"}>
              <p style={{ marginTop: "12px" }}>{message}</p>
            </IonText>
          )}

          {/* GOOGLE LOGIN */}
          <IonButton
            expand="block"
            color="light"
            onClick={handleGoogleSignIn}
            style={{ marginTop: "12px" }}
          >
            Sign In with Google
          </IonButton>

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.2)",
              margin: "20px 0",
            }}
          />

          {/* EMAIL LOGIN FORM */}
          <form onSubmit={handleEmailSignIn}>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={form.email}
                onIonChange={handleChange("email")}
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

            <IonButton
              type="submit"
              expand="block"
              color="primary"
              style={{ marginTop: "16px" }}
            >
              Sign In
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignInPage;
