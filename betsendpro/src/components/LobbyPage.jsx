// src/components/LobbyPage.jsx
import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
} from "@ionic/react";

const LobbyPage = () => {
  return (
    <IonPage>
      <IonHeader translucent={true}>
  <IonToolbar color="dark">
    <IonTitle>SenderBets Lobby</IonTitle>

    {/* 👉 SIGN UP button in top-right */}
    <IonButton
      slot="end"
      routerLink="/signup"
      routerDirection="forward"
      size="small"
      color="primary"
      style={{
        marginRight: "8px",
        "--border-radius": "6px",
      }}
    >
      Sign Up
    </IonButton>
  </IonToolbar>
</IonHeader>
      <IonContent fullscreen className="lobby-page">
        <div className="lobby-hero">
          <h1>Welcome to Speedfly Casino</h1>
          <IonText>
            <p>The only gamble you'll hope to lose.</p>
          </IonText>
        </div>

        {/* ...rest of your lobby content here... */}
      </IonContent>
    </IonPage>
  );
};

export default LobbyPage;
