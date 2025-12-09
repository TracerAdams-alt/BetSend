import React, { useState, useEffect } from "react";
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

import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

const LobbyPage = () => {
  const [contestants, setContestants] = useState([]);

  // =====================================
  // 🔥 REAL-TIME CONTESTANT SYNC (with selection preservation)
  // =====================================
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contestants"), (snapshot) => {
      setContestants((prev) => {
        // Map previous contestants by ID for preserving UI-only fields
        const prevMap = Object.fromEntries(prev.map((c) => [c.id, c]));

        return snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;

          return {
            id,
            ...data,
            // Preserve UI selected choice if it existed before
            selected: prevMap[id]?.selected || null,
          };
        });
      });
    });

    return () => unsubscribe();
  }, []);

  // =====================================
  // UI Selection Handler
  // =====================================
  const handleSelect = (id, choice) => {
    setContestants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: choice } : c))
    );
  };

  // =====================================
  // 🔥 VOTING LOGIC
  // =====================================
  const handleEnterVote = async (contestantId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be signed in to vote.");
      return;
    }

    const voterId = currentUser.uid;
    const voteDocId = `${voterId}_${contestantId}`;

    const voteRef = doc(db, "votes", voteDocId);
    const contestantRef = doc(db, "contestants", contestantId);

    const prevVoteSnap = await getDoc(voteRef);
    const previousChoice = prevVoteSnap.exists()
      ? prevVoteSnap.data().choice
      : null;

    const contestantSnap = await getDoc(contestantRef);
    if (!contestantSnap.exists()) return;

    let { burgerVotes, friesVotes } = contestantSnap.data();

    const contestant = contestants.find((c) => c.id === contestantId);
    const newChoice = contestant?.selected;

    if (!newChoice) return;
    if (newChoice === previousChoice) return;

    // Remove old vote
    if (previousChoice === "burger") burgerVotes--;
    if (previousChoice === "fries") friesVotes--;

    // Add new vote
    if (newChoice === "burger") burgerVotes++;
    if (newChoice === "fries") friesVotes++;

    await updateDoc(contestantRef, { burgerVotes, friesVotes });

    await setDoc(voteRef, {
      voterId,
      contestantId,
      choice: newChoice,
      updatedAt: Date.now(),
    });
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle className="page-title">Sender Lobby</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="lobby-container">
          <h2 className="section-title">Vote Here</h2>

          <IonList>
            {contestants.map((contestant) => (
              <IonItem
                key={contestant.id}
                className="contestant-item"
                style={{
                  alignItems: "center",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                }}
              >
                {/* Avatar */}
                <IonAvatar
                  slot="start"
                  className="contestant-avatar"
                  style={{ width: "48px", height: "48px" }}
                >
                  {contestant.photoDataUrl ? (
                    <img src={contestant.photoDataUrl} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">?</div>
                  )}
                </IonAvatar>

                {/* Name + Wings */}
                <IonLabel
                  style={{
                    marginLeft: "8px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="contestant-name"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                  >
                    {contestant.firstName} {contestant.lastName}
                  </span>

                  {contestant.wings?.length > 0 && (
                    <span
                      className="contestant-wings"
                      style={{
                        fontSize: "11px",
                        opacity: 0.6,
                        marginTop: "2px",
                      }}
                    >
                      Wings: {contestant.wings.join(", ")}
                    </span>
                  )}
                </IonLabel>

                {/* Voting Panel */}
                <div
                  className="vote-panel"
                  slot="end"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginLeft: "12px",
                  }}
                >
                  {auth.currentUser ? (
                    <>
                      <IonRadioGroup
                        value={contestant.selected}
                        onIonChange={(e) =>
                          handleSelect(contestant.id, e.detail.value)
                        }
                        className="vote-group"
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          className="vote-option"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>🩹</span>
                          <IonRadio value="burger" />
                        </div>

                        <div
                          className="vote-option"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>💀</span>
                          <IonRadio value="fries" />
                        </div>
                      </IonRadioGroup>

                      <IonText className="vote-tally" style={{ fontSize: "14px" }}>
                        {contestant.burgerVotes || 0} |{" "}
                        {contestant.friesVotes || 0}
                      </IonText>

                      <IonButton
                        size="small"
                        className="vote-button"
                        style={{ height: "28px", fontSize: "12px" }}
                        disabled={!contestant.selected}
                        onClick={() => handleEnterVote(contestant.id)}
                      >
                        Enter
                      </IonButton>
                    </>
                  ) : (
                    <IonText
                      className="guest-vote-text"
                      style={{ opacity: 0.6, fontSize: "12px" }}
                    >
                      Sign in to vote.
                    </IonText>
                  )}
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
