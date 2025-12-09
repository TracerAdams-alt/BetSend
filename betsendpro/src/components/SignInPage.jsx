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

import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from "../firebase";

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.detail.value }));
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      setMessage("Signed in successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Sign-in failed. Check your email and password.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setMessage("");
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const nameOrEmail = user.displayName || user.email;
      setMessage("Signed in with Google as " + nameOrEmail);
    } catch (err) {
      console.error(err);
      setMessage("Google sign-in failed. Please try again.");
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
        <div style={{ padding: "16px", maxWidth: "480px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "12px" }}>Welcome back!</h2>
          <p style={{ opacity: 0.8 }}>Sign in to continue.</p>

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

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.2)",
              margin: "20px 0"
            }}
          />

          {/* EMAIL SIGN IN FORM */}
          <form onSubmit={handleEmailSignIn}>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
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
            </IonList>

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
