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

import { useHistory } from "react-router-dom";

import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Basic text sanitizer
const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : str;

const LobbyPage = () => {
  const [contestants, setContestants] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [user, setUser] = useState(null);

  const history = useHistory();

  // Track auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Load contestants
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contestants"), (snapshot) => {
      const list = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};

        return {
          id: docSnap.id,
          firstName: clean(data.firstName || ""),
          lastName: clean(data.lastName || ""),
          wings: Array.isArray(data.wings)
            ? data.wings.map((w) => clean(w))
            : [],
          location: clean(data.location || ""),

          burgerVotes:
            typeof data.burgerVotes === "number" ? data.burgerVotes : 0,
          friesVotes:
            typeof data.friesVotes === "number" ? data.friesVotes : 0,

          totalVotes:
            (typeof data.burgerVotes === "number" ? data.burgerVotes : 0) +
            (typeof data.friesVotes === "number" ? data.friesVotes : 0),

          photoDataUrl: data.photoDataUrl || "",
          isUnclaimed: !!data.isUnclaimed,
        };
      });

      // Sort by votes
      list.sort((a, b) => b.totalVotes - a.totalVotes);

      setContestants(list);
    });

    return () => unsubscribe();
  }, []);

  // Radio selection handler
  const handleSelect = (contestantId, choice) => {
    setSelectedMap((prev) => ({
      ...prev,
      [contestantId]: choice,
    }));
  };

  // Voting function (fixed)
  const handleEnterVote = async (contestantId) => {
    if (!user) {
      alert("You must be signed in to vote.");
      return;
    }

    const voterId = user.uid;
    const voteDocId = `${voterId}_${contestantId}`;
    const voteRef = doc(db, "votes", voteDocId);
    const contestantRef = doc(db, "contestants", contestantId);

    const newChoice = selectedMap[contestantId];
    if (!newChoice) return;

    if (loadingMap[contestantId]) return;

    setLoadingMap((prev) => ({ ...prev, [contestantId]: true }));

    try {
      const prevVoteSnap = await getDoc(voteRef);
      const previousChoice = prevVoteSnap.exists()
        ? prevVoteSnap.data().choice
        : null;

      if (previousChoice === newChoice) {
        setLoadingMap((prev) => ({ ...prev, [contestantId]: false }));
        return;
      }

      // Build updates safely
      const updates = {};

      if (previousChoice === "burger") updates.burgerVotes = increment(-1);
      if (previousChoice === "fries") updates.friesVotes = increment(-1);

      if (newChoice === "burger") updates.burgerVotes = increment(1);
      if (newChoice === "fries") updates.friesVotes = increment(1);

      await updateDoc(contestantRef, updates);

      await setDoc(voteRef, {
        voterId,
        contestantId,
        choice: newChoice,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Vote Error:", err);
    }

    setLoadingMap((prev) => ({ ...prev, [contestantId]: false }));
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
          
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 16px",
              marginTop: "12px",
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              Vote Here
            </h2>

            <IonButton
              size="small"
              onClick={() => history.push("/add-contestant")}
            >
              Add Contestant
            </IonButton>
          </div>

          {/* Contestant List */}
          <div className="contestant-list-container">
            <IonList style={{ background: "transparent" }}>
              {contestants.map((c) => (
                <IonItem key={c.id} className="contestant-item">
                  
                  {/* Avatar */}
                  <IonAvatar slot="start" className="contestant-avatar">
                    {c.photoDataUrl ? (
                      <img src={c.photoDataUrl} alt="avatar" />
                    ) : (
                      <div className="avatar-placeholder">?</div>
                    )}
                  </IonAvatar>

                  {/* Name, Wings, Location */}
                  <IonLabel>
                    <div className="contestant-name">
                      {c.firstName} {c.lastName}
                    </div>

                    {c.wings.length > 0 && (
                      <div className="contestant-wings">
                        Wings: {c.wings.join(", ")}
                      </div>
                    )}

                    {c.location && (
                      <div
                        style={{
                          fontSize: "12px",
                          opacity: 0.6,
                          marginTop: "2px",
                        }}
                      >
                        📍 {c.location}
                      </div>
                    )}

                    {c.isUnclaimed && (
                      <IonText
                        style={{
                          fontSize: "12px",
                          opacity: 0.7,
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        (Unclaimed contestant)
                      </IonText>
                    )}
                  </IonLabel>

                  {/* Voting UI */}
                  <div className="vote-panel" slot="end">
                    {user ? (
                      <>
                        <IonRadioGroup
                          value={selectedMap[c.id] || null}
                          onIonChange={(e) =>
                            handleSelect(c.id, e.detail.value)
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
                          {c.burgerVotes} | {c.friesVotes}
                        </IonText>

                        <IonButton
                          size="small"
                          disabled={
                            !selectedMap[c.id] || loadingMap[c.id]
                          }
                          onClick={() => handleEnterVote(c.id)}
                        >
                          {loadingMap[c.id] ? "..." : "Enter Vote"}
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
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LobbyPage;
