import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonText,
} from "@ionic/react";

import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Small text sanitizer to block XSS injections
const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

const LeaderboardPage = () => {
  const [contestants, setContestants] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contestants"), (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data() || {};

        const firstName = clean(data.firstName || "");
        const lastName = clean(data.lastName || "");

        const wings = Array.isArray(data.wings)
          ? data.wings.map(clean)
          : [];

        const burgerVotes =
          typeof data.burgerVotes === "number" ? data.burgerVotes : 0;
        const friesVotes =
          typeof data.friesVotes === "number" ? data.friesVotes : 0;

        return {
          id: doc.id,
          firstName,
          lastName,
          wings,
          burgerVotes,
          friesVotes,
          totalVotes: burgerVotes + friesVotes,
          photoDataUrl: data.photoDataUrl || "",
        };
      });

      // Stable sorting: total votes first, then name
      list.sort((a, b) => {
        const diff = b.totalVotes - a.totalVotes;
        if (diff !== 0) return diff;

        // tie-breaker
        return (a.firstName + a.lastName).localeCompare(
          b.firstName + b.lastName
        );
      });

      setContestants(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Leaderboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "12px" }}>Top Contestants</h2>

          <IonList>
            {contestants.map((c, index) => (
              <IonItem key={c.id}>
                {/* Rank number */}
                <div style={{ width: "24px", textAlign: "center", marginRight: "8px" }}>
                  <IonText color="primary">
                    <b>{index + 1}</b>
                  </IonText>
                </div>

                {/* Avatar */}
                <IonAvatar slot="start">
                  {c.photoDataUrl ? (
                    <img src={c.photoDataUrl} alt="avatar" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    >
                      ?
                    </div>
                  )}
                </IonAvatar>

                {/* Name + Wings */}
                <IonLabel>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                    {c.firstName} {c.lastName}
                  </div>

                  {c.wings.length > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.6,
                        marginTop: "2px",
                      }}
                    >
                      Wings: {c.wings.join(", ")}
                    </div>
                  )}
                </IonLabel>

                {/* Vote totals */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "right",
                    minWidth: "80px",
                  }}
                >
                  <IonText>🩹 {c.burgerVotes}</IonText>
                  <IonText>💀 {c.friesVotes}</IonText>
                  <IonText style={{ marginTop: "4px" }}>
                    🗳️ <b>{c.totalVotes}</b>
                  </IonText>
                </div>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardPage;
