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

import { auth, db, googleProvider, createContestantIfMissing } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
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
    setForm((prev) => ({ ...prev, [field]: e.detail.value }));
  };

  // ============================
  // EMAIL SIGNUP
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (!form.email || !form.password) {
        setMessage("Please fill out all required fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCred.user;

      // Create user profile
      await setDoc(doc(db, "users", user.uid), {
        firstName: "",
        lastName: "",
        photoDataUrl: "",
        wings: []
      });

      // Create contestant doc
      await createContestantIfMissing(user.uid);

      setMessage("Account created!");
    } catch (err) {
      console.error(err);
      setMessage("Signup failed.");
    }
  };

  // ============================
  // GOOGLE SIGN-IN
  // ============================
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create Firestore user profile if missing
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          photoDataUrl: user.photoURL || "",
          wings: []
        },
        { merge: true }
      );

      // Create contestant entry
      await createContestantIfMissing(user.uid);

      setMessage("Signed in with Google!");
    } catch (err) {
      console.error(err);
      setMessage("Google sign-in failed.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: "16px", maxWidth: "480px", margin: "0 auto" }}>
          <IonButton expand="block" onClick={handleGoogleSignIn}>
            Continue with Google
          </IonButton>

          <form onSubmit={handleSubmit}>
            <IonList>
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

              <IonItem>
                <IonLabel position="stacked">Confirm Password</IonLabel>
                <IonInput
                  type="password"
                  value={form.confirmPassword}
                  onIonChange={handleChange("confirmPassword")}
                />
              </IonItem>
            </IonList>

            <IonButton expand="block" type="submit" style={{ marginTop: "16px" }}>
              Create Account
            </IonButton>
          </form>

          {message && (
            <IonText color="success">
              <p>{message}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignUpPage;
