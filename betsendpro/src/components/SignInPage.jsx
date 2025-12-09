import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Logged in!");
    } catch (err) {
      setMessage("Login failed: " + err.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: "16px" }}>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value)}
            />
          </IonItem>

          <IonButton expand="block" onClick={handleSignIn}>
            Sign In
          </IonButton>

          {message && (
            <p style={{ marginTop: "12px" }}>{message}</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignInPage;
