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
} from "@ionic/react";

import {
  collectionGroup,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");

  const runSearch = async (term) => {
    const q = term.toLowerCase().trim();
    if (!q) {
      setResults([]);
      setStatus("");
      return;
    }

    try {
      const found = [];

      // ===============================
      // WING REVIEWS
      // ===============================
      const wingSnap = await getDocs(collectionGroup(db, "wingReviews"));
      wingSnap.forEach((doc) => {
        const d = doc.data();

        const matches =
          d.wingName?.toLowerCase().includes(q) ||
          d.text?.toLowerCase().includes(q) ||
          d.authorName?.toLowerCase().includes(q);

        if (matches) {
          found.push({
            type: "Wing",
            name: d.wingName,
            rating: d.rating,
            text: d.text,
            author: d.authorName,
          });
        }
      });

      // ===============================
      // HARNESS REVIEWS
      // ===============================
      const harnessSnap = await getDocs(collectionGroup(db, "harnessReviews"));
      harnessSnap.forEach((doc) => {
        const d = doc.data();

        const matches =
          d.harnessName?.toLowerCase().includes(q) ||
          d.text?.toLowerCase().includes(q) ||
          d.authorName?.toLowerCase().includes(q);

        if (matches) {
          found.push({
            type: "Harness",
            name: d.harnessName,
            rating: d.rating,
            text: d.text,
            author: d.authorName,
          });
        }
      });

      setResults(found);
      setStatus(found.length === 0 ? "No matches found." : "");
    } catch (err) {
      console.error("Search error:", err);
      setStatus("Search failed.");
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>Search Gear & Reviews</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
          <IonInput
            placeholder="Search wings, harnesses, pilots, or reviews..."
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

          <IonList style={{ marginTop: 16 }}>
            {results.map((r, i) => (
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
