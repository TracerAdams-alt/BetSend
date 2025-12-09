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
  IonRadioGroup,
  IonList,
  IonAvatar,
  IonText,
  IonButton,
} from "@ionic/react";

const LobbyPage = () => {
  const [contestants, setContestants] = useState([
    {
      id: "example1",
      name: "Tracer Adams",
      avatar: "",
      selected: null,       // current choice: "burger" | "fries" | null
      committedVote: null,  // what we've already counted
      burgerVotes: 0,
      friesVotes: 0,
    },
    {
      id: "example2",
      name: "Wings McGee",
      avatar: "",
      selected: null,
      committedVote: null,
      burgerVotes: 0,
      friesVotes: 0,
    },
    {
      id: "example3",
      name: "FryLord9000",
      avatar: "",
      selected: null,
      committedVote: null,
      burgerVotes: 0,
      friesVotes: 0,
    },
  ]);

  // Update which choice is selected for a contestant (but don't touch tallies yet)
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

  // When Enter Vote is pressed:
  // - If no previous vote: add 1 to selected side
  // - If previous vote exists and changed: move 1 from old side to new side
  const handleEnterVote = (id) => {
    setContestants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (!c.selected) return c;

        let burgerVotes = c.burgerVotes;
        let friesVotes = c.friesVotes;
        const prevVote = c.committedVote;
        const newVote = c.selected;

        // If the vote hasn't changed, do nothing
        if (prevVote === newVote) {
          return c;
        }

        // Remove previous vote from tallies if there was one
        if (prevVote === "burger") {
          burgerVotes = Math.max(0, burgerVotes - 1);
        } else if (prevVote === "fries") {
          friesVotes = Math.max(0, friesVotes - 1);
        }

        // Add new vote
        if (newVote === "burger") {
          burgerVotes += 1;
        } else if (newVote === "fries") {
          friesVotes += 1;
        }

        return {
          ...c,
          burgerVotes,
          friesVotes,
          committedVote: newVote, // remember what we've counted
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
        <div
          style={{
            padding: "16px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
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
                <IonLabel className="ion-text-wrap">
                  {contestant.name}
                </IonLabel>

                {/* Controls cluster on the right */}
                <div
                  slot="end"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginLeft: "16px",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Radio group: burger / fries */}
                  <IonRadioGroup
                    value={contestant.selected}
                    onIonChange={(e) =>
                      handleSelect(contestant.id, e.detail.value)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {/* 🍔 + radio */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>🍔</span>
                      <IonRadio value="burger" />
                    </div>

                    {/* 🍟 + radio */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>🍟</span>
                      <IonRadio value="fries" />
                    </div>
                  </IonRadioGroup>

                  {/* Tallies */}
                  <IonText style={{ fontSize: "0.9rem" }}>
                    {contestant.burgerVotes} | {contestant.friesVotes}
                  </IonText>

                  {/* Enter Vote button */}
                  <IonButton
                    size="small"
                    onClick={() => handleEnterVote(contestant.id)}
                    disabled={!contestant.selected}
                  >
                    Enter Vote
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LobbyPage;
