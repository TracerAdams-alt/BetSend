import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";

const BulletinPage = () => {
  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Bulletin Board</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", textAlign: "center" }}>
          <h2>Welcome to the Bulletin Board</h2>
          <p style={{ opacity: 0.7 }}>
            This page will hold posts, announcements, or community updates.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BulletinPage;
