import React from "react";
import { IonButton } from "@ionic/react";

const AuthButtons = ({ user }) => {
  if (user) return null;

  return (
    <div
      className="no-focus"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        padding: "10px 16px",
        background: "rgba(0,0,0,0.25)",
        zIndex: 99999,
        position: "relative",
      }}
    >
      <IonButton
        size="small"
        routerLink="/signin"
        color="danger"
        style={{ "--border-radius": "8px" }}
      >
        Sign In
      </IonButton>

      <IonButton
        size="small"
        routerLink="/signup"
        color="primary"
        style={{ "--border-radius": "8px" }}
      >
        Sign Up
      </IonButton>
    </div>
  );
};

export default AuthButtons;
