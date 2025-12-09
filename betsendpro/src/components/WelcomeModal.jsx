import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText
} from "@ionic/react";

const WelcomeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show modal on page load
    setOpen(true);
  }, []);

  return (
    <IonModal isOpen={open} backdropDismiss={false}>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Welcome!</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        style={{
          padding: "20px",
          textAlign: "center"
        }}
      >
        <IonText>
          <h2>Welcome to Speedfly Sendometer</h2>
          <p style={{ marginTop: "10px", opacity: 0.8 }}>
            This site allows users to sign up, customize their profile, and
            participate in voting rounds to bring awareness to their friends they think are flying too hard. 
            Every user becomes a contestant, and others can place votes to let you know if you are sending too hard.
          </p>
          <p style={{ marginTop: "10px", opacity: 0.8 }}>
           if you see your name getting votes, it's not a bad idea to reflect on your decision making, flying style, and wing choice.
           Cheers!
          </p>
        </IonText>

        <IonButton
          expand="block"
          color="primary"
          style={{ marginTop: "20px" }}
          onClick={() => setOpen(false)}
        >
          Get Started
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default WelcomeModal;
