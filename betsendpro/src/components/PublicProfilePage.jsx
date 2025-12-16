import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonText,
  IonLabel,
  IonButton,
} from "@ionic/react";

import { useParams, useHistory } from "react-router-dom";

import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

// ------------------------------------
// helpers
// ------------------------------------
const normalizeKey = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

// ------------------------------------
// stars (read-only)
// ------------------------------------
const Stars = ({ value }) => (
  <div style={{ display: "flex", gap: 4, margin: "6px 0" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{
          fontSize: 18,
          opacity: n <= value ? 1 : 0.3,
        }}
      >
        ⭐
      </span>
    ))}
  </div>
);

// ------------------------------------
// main page
// ------------------------------------
const PublicProfilePage = () => {
  const { uid } = useParams();
  const history = useHistory();

  const [profile, setProfile] = useState(null);
  const [wingReviews, setWingReviews] = useState({});
  const [harnessReviews, setHarnessReviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // -------------------------
        // user profile
        // -------------------------
        const userSnap = await getDoc(doc(db, "users", uid));
        if (!userSnap.exists()) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const d = userSnap.data();

        setProfile({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          photoDataUrl: d.photoDataUrl || "",
          wings: Array.isArray(d.wings) ? d.wings : [],
          harnesses: Array.isArray(d.harnesses) ? d.harnesses : [],
          location: d.location || "",
        });

        // -------------------------
        // wing reviews
        // -------------------------
        const wingSnap = await getDocs(
          collection(db, "users", uid, "wingReviews")
        );
        const wingMap = {};
        wingSnap.forEach((doc) => {
          wingMap[doc.id] = {
            text: doc.data().text || "",
            rating: doc.data().rating || 0,
          };
        });
        setWingReviews(wingMap);

        // -------------------------
        // harness reviews
        // -------------------------
        const harnessSnap = await getDocs(
          collection(db, "users", uid, "harnessReviews")
        );
        const harnessMap = {};
        harnessSnap.forEach((doc) => {
          harnessMap[doc.id] = {
            text: doc.data().text || "",
            rating: doc.data().rating || 0,
          };
        });
        setHarnessReviews(harnessMap);
      } catch (err) {
        console.error("Public profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [uid]);

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: 40, textAlign: "center" }}>
            Loading profile...
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!profile) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ padding: 40, textAlign: "center" }}>
            Profile not found.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "Unnamed Pilot";

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>{displayName}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
          {/* header */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <IonAvatar style={{ width: 72, height: 72 }}>
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt="avatar" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 24,
                  }}
                >
                  ?
                </div>
              )}
            </IonAvatar>

            <div>
              <IonText>
                <h2 style={{ margin: 0 }}>{displayName}</h2>
              </IonText>

              {profile.location && (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>📍 {clean(profile.location)}</p>
                </IonText>
              )}
            </div>
          </div>

          {/* wings */}
          <Section
            title="Wings"
            items={profile.wings}
            reviews={wingReviews}
          />

          {/* harnesses */}
          <Section
            title="Harnesses"
            items={profile.harnesses}
            reviews={harnessReviews}
          />

          <IonButton
            expand="block"
            style={{ marginTop: 24 }}
            onClick={() => history.goBack()}
          >
            Back
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ------------------------------------
// reusable section
// ------------------------------------
const Section = ({ title, items, reviews }) => (
  <div style={{ marginTop: 24 }}>
    <IonLabel>
      <h3>{title}</h3>
    </IonLabel>

    {items.length === 0 && (
      <IonText color="medium">
        <p>No {title.toLowerCase()} listed.</p>
      </IonText>
    )}

    {items.map((item) => {
      const key = normalizeKey(item);
      const review = reviews[key] || { text: "", rating: 0 };

      return (
        <div key={key} style={{ marginTop: 12 }}>
          <strong>{clean(item)}</strong>

          <Stars value={review.rating} />

          {review.text && (
            <IonText>
              <p style={{ marginTop: 4, opacity: 0.9 }}>
                {clean(review.text)}
              </p>
            </IonText>
          )}
        </div>
      );
    })}
  </div>
);

export default PublicProfilePage;
