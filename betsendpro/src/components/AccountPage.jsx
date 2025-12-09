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
import { doc, getDoc, setDoc } from "firebase/firestore";

const AccountPage = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    photoDataUrl: "",
    wings: [],
  });

  const [wingInput, setWingInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Load profile one time after auth is ready
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user found — route protection should prevent this.");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      }

      setLoading(false);
    };

    // allow auth.currentUser to populate
    setTimeout(loadProfile, 200);
  }, []);

  // ================================
  // INPUT HANDLERS
  // ================================

  const handleNameChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.detail.value }));
    setStatus("");
  };

  const handleWingChange = (e) => {
    setWingInput(e.detail.value);
  };

  const addWing = () => {
    if (!wingInput.trim()) return;

    setProfile((prev) => ({
      ...prev,
      wings: [...prev.wings, wingInput.trim()],
    }));

    setWingInput("");
    setStatus("");
  };

  const handleWingKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWing();
    }
  };

  const removeWing = (index) => {
    setProfile((prev) => ({
      ...prev,
      wings: prev.wings.filter((_, i) => i !== index),
    }));
    setStatus("");
  };

  // ================================
  // PHOTO UPLOAD
  // ================================
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, photoDataUrl: reader.result }));
      setStatus("Photo updated (not saved yet)");
    };
    reader.readAsDataURL(file);
  };

  // ================================
  // SAVE TO FIRESTORE
  // ================================
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatus("You must be signed in to save.");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          ...profile,
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

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ================================
  // LOADING SCREEN
  // ================================
  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div
            style={{
              padding: 40,
              color: "white",
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            Loading profile...
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // ================================
  // PAGE UI
  // ================================
  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>My Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", maxWidth: "520px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <IonAvatar style={{ width: "64px", height: "64px" }}>
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt="Profile" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.1)",
                    fontSize: "24px",
                  }}
                >
                  ?
                </div>
              )}
            </IonAvatar>

            <IonText>
              <h2 style={{ margin: 0 }}>
                {profile.firstName || profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : "Unnamed Player"}
              </h2>
            </IonText>
          </div>

          {/* Upload Photo Button */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <IonButton
              onClick={() => document.getElementById("photoInput").click()}
              size="small"
            >
              Upload Photo
            </IonButton>
          </div>

          {/* Name Fields */}
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
          </IonList>

          {/* Wings List */}
          <div style={{ marginTop: "20px" }}>
            <IonLabel>Wings</IonLabel>

            <IonItem>
              <IonInput
                placeholder="Wings"
                value={wingInput}
                onIonChange={handleWingChange}
                onKeyPress={handleWingKeyPress}
              />
              <IonButton size="small" onClick={addWing}>
                Add
              </IonButton>
            </IonItem>

            {profile.wings.map((wing, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 4px",
                  opacity: 0.85,
                }}
              >
                <span>{wing}</span>
                <span
                  style={{
                    cursor: "pointer",
                    color: "#ff6b6b",
                    fontWeight: "bold",
                    marginLeft: "10px",
                  }}
                  onClick={() => removeWing(idx)}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <IonButton
            expand="block"
            color="primary"
            style={{ marginTop: "24px" }}
            onClick={handleSave}
          >
            Save Account Settings
          </IonButton>

          {/* Logout Button */}
          <IonButton
            expand="block"
            color="danger"
            style={{ marginTop: "12px" }}
            onClick={handleLogout}
          >
            Log Out
          </IonButton>

          {status && (
            <IonText>
              <p style={{ marginTop: "10px", opacity: 0.9 }}>{status}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountPage;
