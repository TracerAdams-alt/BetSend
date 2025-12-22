import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
} from "@ionic/react";

import {
  collection,
  collectionGroup,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

import { useHistory } from "react-router-dom";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [reviewResults, setReviewResults] = useState([]);
  const [status, setStatus] = useState("");

  const history = useHistory();

  const runSearch = async (term) => {
    const q = term.toLowerCase().trim();
    if (!q) {
      setUserResults([]);
      setReviewResults([]);
      setStatus("");
      return;
    }

    try {
      const usersFound = [];
      const reviewsFound = [];

      // ===============================
      //  USER SEARCH (PRIMARY)
      // ===============================
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((doc) => {
        const d = doc.data();

        const fullName = `${d.firstName || ""} ${d.lastName || ""}`
          .toLowerCase()
          .trim();

        if (fullName && fullName.includes(q)) {
          usersFound.push({
            uid: doc.id,
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            photoDataUrl: d.photoDataUrl || "",
            location: d.location || "",
          });
        }
      });

      // ===============================
      //  WING REVIEWS
      // ===============================
      const wingSnap = await getDocs(collectionGroup(db, "wingReviews"));
      wingSnap.forEach((doc) => {
        const d = doc.data();

        const matches =
          d.wingName?.toLowerCase().includes(q) ||
          d.text?.toLowerCase().includes(q) ||
          d.authorName?.toLowerCase().includes(q);

        if (matches) {
          reviewsFound.push({
            type: "Wing",
            name: d.wingName,
            rating: d.rating,
            text: d.text,
            author: d.authorName,
          });
        }
      });

      // ===============================
      //  HARNESS REVIEWS
      // ===============================
      const harnessSnap = await getDocs(collectionGroup(db, "harnessReviews"));
      harnessSnap.forEach((doc) => {
        const d = doc.data();

        const matches =
          d.harnessName?.toLowerCase().includes(q) ||
          d.text?.toLowerCase().includes(q) ||
          d.authorName?.toLowerCase().includes(q);

        if (matches) {
          reviewsFound.push({
            type: "Harness",
            name: d.harnessName,
            rating: d.rating,
            text: d.text,
            author: d.authorName,
          });
        }
      });

      setUserResults(usersFound);
      setReviewResults(reviewsFound);

      if (usersFound.length === 0 && reviewsFound.length === 0) {
        setStatus("No matches found.");
      } else {
        setStatus("");
      }
    } catch (err) {
      console.error("Search error:", err);
      setStatus("Search failed.");
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>Search</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
          <IonInput
            placeholder="Search pilots, wings, harnesses, or reviews..."
            value={query}
            onIonChange={(e) => {
              const v = e.detail.value ?? "";
              setQuery(v);
              runSearch(v);
            }}
          />

          {status && (
            <IonText>
              <p style={{ marginTop: 12 }}>{status}</p>
            </IonText>
          )}

          {/* ===============================
               USER RESULTS
             =============================== */}
          {userResults.length > 0 && (
            <>
              <IonText>
                <h3 style={{ marginTop: 24 }}>Pilots</h3>
              </IonText>

              <IonList>
                {userResults.map((u) => (
                  <IonItem
                    key={u.uid}
                    button
                    onClick={() => history.push(`/profile/${u.uid}`)}
                  >
                    <IonAvatar slot="start">
                      {u.photoDataUrl ? (
                        <img src={u.photoDataUrl} alt="avatar" />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          ?
                        </div>
                      )}
                    </IonAvatar>

                    <IonLabel>
                      <div style={{ fontWeight: "bold" }}>
                        {u.firstName} {u.lastName}
                      </div>
                      {u.location && (
                        <div style={{ fontSize: 13, opacity: 0.75 }}>
                          {u.location}
                        </div>
                      )}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          )}

          {/* ===============================
               REVIEW RESULTS
             =============================== */}
          {reviewResults.length > 0 && (
            <>
              <IonText>
                <h3 style={{ marginTop: 32 }}>Reviews</h3>
              </IonText>

              <IonList>
                {reviewResults.map((r, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <div style={{ fontWeight: "bold" }}>
                        {r.type}: {r.name}
                      </div>

                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        ⭐ {r.rating} — by {r.author}
                      </div>

                      {r.text && (
                        <p style={{ marginTop: 6 }}>{r.text}</p>
                      )}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
