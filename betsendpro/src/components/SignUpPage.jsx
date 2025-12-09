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

import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";      // ✅ FIXED IMPORT
import { doc, setDoc } from "firebase/firestore";     // Firestore for Step 3

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setMessage("Please fill out all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage("Account created! (Fake for now)");
    console.log("Signup data:", form);
  };

  // ⭐ GOOGLE SIGN-IN + FIRESTORE SAVE
  const handleGoogleSignIn = async () => {
    try {
      setMessage("");

      // Google authentication
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const name = user.displayName || user.email || "Player";

      // ----------------------------------------------------
      // 🔥 Save user to Firestore (users/{uid})
      // ----------------------------------------------------
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email || "",
          avatar: user.photoURL || "",
          createdAt: Date.now()
        },
        { merge: true }
      );

      // ----------------------------------------------------
      // 🔥 Add user as contestant (contestants/{uid})
      // ----------------------------------------------------
      await setDoc(
        doc(db, "contestants", user.uid),
        {
          name: user.displayName || "",
          avatar: user.photoURL || "",
          burgerVotes: 0,
          friesVotes: 0,
          createdAt: Date.now()
        },
        { merge: true }
      );

      // ----------------------------------------------------

      setMessage("Signed in with Google as " + name);
      console.log("Google user saved:", user);

    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage("Google sign-in failed. Please try again.");
    }
  };

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
          <p style={{ opacity: 0.8 }}>Create an account to start playing.</p>

          {message && (
            <IonText color={isError ? "danger" : "success"}>
              <p style={{ marginTop: "12px" }}>{message}</p>
            </IonText>
          )}

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

          <form onSubmit={handleSubmit}>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Username</IonLabel>
                <IonInput
                  value={form.username}
                  onIonChange={handleChange("username")}
                  placeholder="LuckyPlayer123"
                />
              </IonItem>

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
