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
  IonButton,
} from "@ionic/react";

import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

const VOTE_CATEGORIES = [
  { id: "best_line", label: "🛫 Best Line" },
  { id: "best_edit", label: "🎥 Best Edit" },
];

const RATING_CATEGORIES = [
  { id: "steeze", label: "😎 Steeze" },
  { id: "creativity", label: "🎨 Sustainability" },
];

const LeaderboardPage = () => {
  const [contestants, setContestants] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [ratingStats, setRatingStats] = useState({});

  /* Contestants */
  useEffect(() => {
    return onSnapshot(collection(db, "contestants"), (snap) => {
      setContestants(
        snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            firstName: clean(data.firstName || ""),
            lastName: clean(data.lastName || ""),
            wings: Array.isArray(data.wings)
              ? data.wings.map(clean)
              : [],
            photoDataUrl: data.photoDataUrl || "",
          };
        })
      );
    });
  }, []);

  /* Votes */
  useEffect(() => {
    const q = query(
      collection(db, "votes"),
      where("type", "==", "award_vote")
    );

    return onSnapshot(q, (snap) => {
      const counts = {};
      snap.docs.forEach((d) => {
        const { contestantId, category } = d.data();
        counts[contestantId] ??= {};
        counts[contestantId][category] =
          (counts[contestantId][category] || 0) + 1;
      });
      setVoteCounts(counts);
    });
  }, []);

  /* Ratings */
  useEffect(() => {
    return onSnapshot(collection(db, "ratings"), (snap) => {
      const stats = {};
      snap.docs.forEach((d) => {
        const { contestantId, category, value } = d.data();
        stats[contestantId] ??= {};
        stats[contestantId][category] ??= { sum: 0, count: 0 };
        stats[contestantId][category].sum += value;
        stats[contestantId][category].count += 1;
      });
      setRatingStats(stats);
    });
  }, []);

  const voteAward = async (contestantId, category) => {
    const user = auth.currentUser;
    if (!user) return alert("Sign in to vote");

    await setDoc(
      doc(db, "votes", `${user.uid}_${contestantId}_${category}`),
      {
        voterId: user.uid,
        contestantId,
        category,
        type: "award_vote",
        createdAt: serverTimestamp(),
      }
    );
  };

  const ratePilot = async (contestantId, category, value) => {
    const user = auth.currentUser;
    if (!user) return alert("Sign in to rate");

    await setDoc(
      doc(db, "ratings", `${user.uid}_${contestantId}_${category}`),
      {
        raterId: user.uid,
        contestantId,
        category,
        value,
        updatedAt: serverTimestamp(),
      }
    );
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>Leaderboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
          <IonList>
            {contestants.map((c) => (
              <IonItem key={c.id}>
                <IonAvatar slot="start">
                  {c.photoDataUrl ? <img src={c.photoDataUrl} /> : "?"}
                </IonAvatar>

                <IonLabel>
                  <strong>{c.firstName} {c.lastName}</strong>

                  <div style={{ marginTop: 6 }}>
                    {VOTE_CATEGORIES.map((cat) => (
                      <IonButton
                        key={cat.id}
                        size="small"
                        onClick={() => voteAward(c.id, cat.id)}
                      >
                        {cat.label} ({voteCounts[c.id]?.[cat.id] || 0})
                      </IonButton>
                    ))}
                  </div>

                  {RATING_CATEGORIES.map((cat) => {
                    const stat = ratingStats[c.id]?.[cat.id];
                    const avg = stat
                      ? (stat.sum / stat.count).toFixed(1)
                      : "–";

                    return (
                      <div key={cat.id} style={{ marginTop: 8 }}>
                        <IonText>
                          {cat.label}: <b>{avg}</b>
                        </IonText>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <IonButton
                              key={n}
                              size="small"
                              fill="outline"
                              onClick={() => ratePilot(c.id, cat.id, n)}
                            >
                              {n}
                            </IonButton>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardPage;
