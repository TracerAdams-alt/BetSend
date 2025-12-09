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
  onSnapshot
} from "firebase/firestore";

const LobbyPage = () => {
  const [contestants, setContestants] = useState([]);

  // 🔥 Real-time Firestore listener for contestants
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        selected: null
      }));

      setContestants(list);
    });

    return () => unsubscribe();
  }, []);

  // Local selection
  const handleSelect = (id, choice) => {
    setContestants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, selected: choice } : c
      )
    );
  };

  // Voting logic
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

    await updateDoc(contestantRef, {
      burgerVotes,
      friesVotes
    });

    await setDoc(voteRef, {
      voterId,
      contestantId,
      choice: newChoice,
      updatedAt: Date.now()
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
              <IonItem key={contestant.id} className="contestant-item">

                {/* Avatar */}
                <IonAvatar slot="start" className="contestant-avatar">
                  {contestant.photoDataUrl ? (
                    <img src={contestant.photoDataUrl} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">?</div>
                  )}
                </IonAvatar>

                {/* Name + wings */}
                <IonLabel>
                  <div className="contestant-name">
                    {contestant.firstName} {contestant.lastName}
                  </div>

                  {contestant.wings?.length > 0 && (
                    <div className="contestant-wings">
                      Wings: {contestant.wings.join(", ")}
                    </div>
                  )}
                </IonLabel>

                {/* Vote UI */}
                <div className="vote-panel" slot="end">
                  {auth.currentUser ? (
                    <>
                      <IonRadioGroup
                        value={contestant.selected}
                        onIonChange={(e) =>
                          handleSelect(contestant.id, e.detail.value)
                        }
                        className="vote-group"
                      >
                        <div className="vote-option">
                          <span>Injury</span>
                          <IonRadio value="burger" />
                        </div>

                        <div className="vote-option">
                          <span>Fatality</span>
                          <IonRadio value="fries" />
                        </div>
                      </IonRadioGroup>

                      <IonText className="vote-tally">
                        {contestant.burgerVotes || 0} | {contestant.friesVotes || 0}
                      </IonText>

                      <IonButton
                        size="small"
                        className="vote-button"
                        disabled={!contestant.selected}
                        onClick={() => handleEnterVote(contestant.id)}
                      >
                        Enter Vote
                      </IonButton>
                    </>
                  ) : (
                    <IonText className="guest-vote-text">
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
