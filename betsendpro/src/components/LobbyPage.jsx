import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonRadio,
  IonList,
  IonAvatar,
  IonText,
  IonButton,
} from "@ionic/react";

const LobbyPage = () => {
  // Example contestants (static for now)
  const [contestants, setContestants] = useState([
    {
      id: "example1",
      name: "Tracer Adams",
      avatar: "",
      selected: null,      // "burger" | "fries" | null
      burgerVotes: 0,
      friesVotes: 0,
    },
    {
      id: "example2",
      name: "Wings McGee",
      avatar: "",
      selected: null,
      burgerVotes: 0,
      friesVotes: 0,
    },
    {
      id: "example3",
      name: "FryLord9000",
      avatar: "",
      selected: null,
      burgerVotes: 0,
      friesVotes: 0,
    },
  ]);

  // Just change the *selected* choice; doesn't affect tallies yet
  const handleSelect = (id, choice) => {
    setContestants((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              selected: choice,
            }
          : c
      )
    );
  };

  // When Enter Vote is pressed, increment the tally for the selected side
  const handleEnterVote = (id) => {
    setContestants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (!c.selected) return c;

        let burgerVotes = c.burgerVotes;
        let friesVotes = c.friesVotes;

        if (c.selected === "burger") burgerVotes += 1;
        if (c.selected === "fries") friesVotes += 1;

        return {
          ...c,
          burgerVotes,
          friesVotes,
        };
      })
    );
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Contestant Voter</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "12px" }}>Vote Burger or Fries</h2>

          <IonList>
            {contestants.map((contestant) => (
              <IonItem key={contestant.id} style={{ alignItems: "center" }}>
                {/* Avatar */}
                <IonAvatar slot="start">
                  {contestant.avatar ? (
                    <img src={contestant.avatar} alt="avatar" />
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

                {/* Name */}
                <IonLabel>{contestant.name}</IonLabel>

                {/* 🍔 + radio */}
                <span style={{ marginRight: "6px" }}>🍔</span>
                <IonRadio
                  checked={contestant.selected === "burger"}
                  onIonChange={() => handleSelect(contestant.id, "burger")}
                />

                {/* 🍟 + radio */}
                <span style={{ marginLeft: "14px", marginRight: "6px" }}>
                  🍟
                </span>
                <IonRadio
                  checked={contestant.selected === "fries"}
                  onIonChange={() => handleSelect(contestant.id, "fries")}
                />

                {/* Tallies */}
                <IonText style={{ marginLeft: "14px", fontSize: "0.9rem" }}>
                  {contestant.burgerVotes} | {contestant.friesVotes}
                </IonText>

                {/* Enter Vote button at end of line */}
                <IonButton
                  size="small"
                  slot="end"
                  onClick={() => handleEnterVote(contestant.id)}
                  disabled={!contestant.selected}
                  style={{ marginLeft: "8px" }}
                >
                  Enter Vote
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LobbyPage;
