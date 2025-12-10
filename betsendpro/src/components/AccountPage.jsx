import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonAvatar,
  IonButton,
  IonText,
} from "@ionic/react";

import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MAX_WING_LENGTH = 40;
const MAX_WINGS_COUNT = 20;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // ~2MB

const AccountPage = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    photoDataUrl: "",
    wings: [],
    location: "",
  });

  const [wingInput, setWingInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [unclaimedList, setUnclaimedList] = useState([]);
  const [claimedContestantId, setClaimedContestantId] = useState(null);

  // ============================================================
  // LOAD AUTH + PROFILE
  // ============================================================
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(u);

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            photoDataUrl: data.photoDataUrl || "",
            wings: Array.isArray(data.wings) ? data.wings : [],
            location: data.location || "",
          });
          setClaimedContestantId(data.claimedContestantId || null);
        }
      } catch (err) {
        console.error("Load profile error:", err);
      }
      setLoading(false);
    });
  }, []);

  // Load all unclaimed contestants once
  useEffect(() => {
    const loadUnclaimed = async () => {
      try {
        const q = query(
          collection(db, "contestants"),
          where("isUnclaimed", "==", true)
        );
        const snap = await getDocs(q);
        setUnclaimedList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.log("Unclaimed error:", err);
      }
    };
    loadUnclaimed();
  }, []);

  // ============================================================
  // INPUT HANDLERS
  // ============================================================
  const handleNameChange = (field) => (e) => {
    const value = e.detail.value ?? "";
    if (value.length > 60) return;

    const updated = { ...profile, [field]: value };
    setProfile(updated);

    const fullName = `${updated.firstName} ${updated.lastName}`.trim();

    if (fullName.length >= 2) {
      const search = fullName.toLowerCase();
      const matches = unclaimedList.filter((c) => {
        const candidate = (
          c.nameSearch ||
          `${c.firstName || ""} ${c.lastName || ""}`
        ).toLowerCase();
        return candidate.includes(search);
      });

      setNameSuggestions(matches.slice(0, 5));
    } else {
      setNameSuggestions([]);
    }

    setStatus("");
  };

  const handleLocationChange = (e) => {
    setProfile((p) => ({ ...p, location: e.detail.value ?? "" }));
  };

  const handleWingChange = (e) => {
    const v = e.detail.value ?? "";
    if (v.length <= MAX_WING_LENGTH) setWingInput(v);
  };

  const addWing = () => {
    const trimmed = wingInput.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_WING_LENGTH) return;
    if (profile.wings.length >= MAX_WINGS_COUNT) return;
    if (profile.wings.includes(trimmed)) return;

    setProfile((p) => ({ ...p, wings: [...p.wings, trimmed] }));
    setWingInput("");
  };

  const removeWing = (i) => {
    setProfile((p) => ({
      ...p,
      wings: p.wings.filter((_, idx) => idx !== i),
    }));
  };

  // ============================================================
  // PHOTO UPLOAD
  // ============================================================
  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    if (f.size > MAX_IMAGE_BYTES) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile((p) => ({ ...p, photoDataUrl: reader.result }));
    reader.readAsDataURL(f);
  };

  // ============================================================
  // CLAIM A SUGGESTED MATCH
  // ============================================================
  const handleClaim = async (c) => {
    if (!user) return;

    const ok = window.confirm(
      `Claim "${c.firstName} ${c.lastName}" and inherit their votes?`
    );
    if (!ok) return;

    const cleanFirst = profile.firstName.trim();
    const cleanLast = profile.lastName.trim();

    try {
      // Update contestant doc
      const contestantRef = doc(db, "contestants", c.id);
      await updateDoc(contestantRef, {
        isUnclaimed: false,
        ownerUid: user.uid,
        firstName: cleanFirst,
        lastName: cleanLast,
        updatedAt: Date.now(),
      });

      // Update user doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        claimedContestantId: c.id,
        firstName: cleanFirst,
        lastName: cleanLast,
        updatedAt: Date.now(),
      });

      setClaimedContestantId(c.id);
      setNameSuggestions([]);
      setStatus("Contestant claimed!");
    } catch (err) {
      console.error("Claim error:", err);
      setStatus("Failed to claim contestant.");
    }
  };

  // ============================================================
  // SAVE PROFILE → USERS + CONTESTANTS
  // ============================================================
  const handleSave = async () => {
    if (!user) return;

    const cleanFirst = profile.firstName.trim();
    const cleanLast = profile.lastName.trim();
    const cleanLocation = profile.location.trim();
    const cleanWings = profile.wings.map((w) => w.trim());

    if (!cleanFirst && !cleanLast) {
      setStatus("Enter at least a first or last name.");
      return;
    }

    try {
      // ---- Save user profile ----
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          firstName: cleanFirst,
          lastName: cleanLast,
          photoDataUrl: profile.photoDataUrl || "",
          wings: cleanWings,
          location: cleanLocation,
          claimedContestantId: claimedContestantId || null,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // ---- Sync to contestant document (id == uid) ----
      const contestantRef = doc(db, "contestants", user.uid);
      await setDoc(
        contestantRef,
        {
          firstName: cleanFirst,
          lastName: cleanLast,
          photoDataUrl: profile.photoDataUrl || "",
          wings: cleanWings,
          location: cleanLocation,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      setStatus("Settings saved!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setStatus("Failed to save settings.");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/signin";
  };

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

  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "Unnamed Player";

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>My Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <IonAvatar style={{ width: 64, height: 64 }}>
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt="profile" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.2)",
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

            <IonText>
              <h2 style={{ margin: 0 }}>{displayName}</h2>
            </IonText>
          </div>

          {/* Photo button */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <IonButton onClick={() => document.getElementById("photoInput").click()}>
              Upload Photo
            </IonButton>
          </div>

          {/* Inputs */}
          <IonList>
            <IonItem>
              <IonLabel position="stacked">First Name</IonLabel>
              <IonInput
                value={profile.firstName}
                onIonChange={handleNameChange("firstName")}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Last Name</IonLabel>
              <IonInput
                value={profile.lastName}
                onIonChange={handleNameChange("lastName")}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Location</IonLabel>
              <IonInput
                placeholder="City, State or Country"
                value={profile.location}
                onIonChange={handleLocationChange}
              />
            </IonItem>
          </IonList>

          {/* Suggestions */}
          {nameSuggestions.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: 10,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              <IonText>Possible matches:</IonText>
              {nameSuggestions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleClaim(s)}
                >
                  {s.firstName} {s.lastName}
                </div>
              ))}
            </div>
          )}

          {/* Wings */}
          <div style={{ marginTop: 20 }}>
            <IonLabel>Wings</IonLabel>

            <IonItem>
              <IonInput
                placeholder="Add Wing"
                value={wingInput}
                onIonChange={handleWingChange}
              />
              <IonButton onClick={addWing}>Add</IonButton>
            </IonItem>

            {profile.wings.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 4px",
                }}
              >
                <span>{w}</span>
                <span
                  style={{ cursor: "pointer", color: "#ff5b5b", fontWeight: "bold" }}
                  onClick={() => removeWing(i)}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>

          {/* Save */}
          <IonButton expand="block" style={{ marginTop: 20 }} onClick={handleSave}>
            Save Account Settings
          </IonButton>

          {/* Logout */}
          <IonButton
            expand="block"
            color="danger"
            style={{ marginTop: 12 }}
            onClick={handleLogout}
          >
            Log Out
          </IonButton>

          {status && (
            <IonText>
              <p style={{ marginTop: 10 }}>{status}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountPage;
