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
  IonText,
} from "@ionic/react";

import {
  auth,
  db,
  googleProvider,
  createContestantIfMissing,
} from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const TEST_ACCOUNT = {
  email: "test.claim@speedfly.dev",
  password: "test1234",
};

const SignUpPage = () => {
  const [form, setForm] = useState({
    email: TEST_ACCOUNT.email,
    password: TEST_ACCOUNT.password,
    confirmPassword: TEST_ACCOUNT.password,
  });

  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.detail.value ?? "",
    }));
  };

  // ============================
  // EMAIL SIGNUP
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.password) {
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

      // Create Firestore user profile
      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: "",
          lastName: "",
          photoDataUrl: "",
          wings: [],
          harnesses: [],
          location: "",
          createdAt: Date.now(),
        },
        { merge: true }
      );

      // Create contestant doc if missing
      await createContestantIfMissing(user.uid);

      setMessage("Account created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Signup failed: " + err.message);
    }
  };

  // ============================
  // GOOGLE SIGN-IN
  // ============================
  const handleGoogleSignIn = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          photoDataUrl: user.photoURL || "",
          wings: [],
          harnesses: [],
          location: "",
          createdAt: Date.now(),
        },
        { merge: true }
      );

      await createContestantIfMissing(user.uid);

      setMessage("Signed in with Google!");
    } catch (err) {
      console.error(err);
      setMessage("Google sign-in failed.");
    }
  };

  const isError = message.toLowerCase().includes("fail");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
          {/* TEST ACCOUNT NOTICE */}
          <IonText color="warning">
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              🧪 Test account is pre-filled for vote-claim testing.
            </p>
          </IonText>

          {/* GOOGLE */}
          <IonButton expand="block" onClick={handleGoogleSignIn}>
            Continue with Google
          </IonButton>

          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.2)",
              margin: "20px 0",
            }}
          />

          {/* EMAIL SIGNUP */}
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

            <IonButton
              expand="block"
              type="submit"
              style={{ marginTop: 16 }}
            >
              Create Account
            </IonButton>
          </form>

          {message && (
            <IonText color={isError ? "danger" : "success"}>
              <p style={{ marginTop: 12 }}>{message}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignUpPage;
