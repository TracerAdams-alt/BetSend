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
  IonToggle,
  IonAvatar,
  IonButton,
  IonText
} from "@ionic/react";

const STORAGE_KEY = "betsend_profile_v1";

const AccountPage = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    isDarkMode: false,
    isAnonymous: false,
    photoDataUrl: "",
    wingsOfChoice: []
  });

  const [status, setStatus] = useState("");
  const [wingInput, setWingInput] = useState("");

  // Load saved profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(function (prev) {
          return { ...prev, ...parsed };
        });
      }
    } catch (e) {
      console.error("Failed to load profile from storage", e);
    }
  }, []);

  // Persist profile whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile to storage", e);
    }
  }, [profile]);

  // (optional) dark mode hook, can be removed later
  useEffect(() => {
    document.body.classList.toggle("dark", profile.isDarkMode);
  }, [profile.isDarkMode]);

  const handleNameChange = (field) => (e) => {
    const value = e.detail.value || "";
    setProfile(function (prev) {
      return { ...prev, [field]: value };
    });
    setStatus("");
  };

  const handleToggleChange = (field) => (e) => {
    const checked = e.detail.checked;
    setProfile(function (prev) {
      return { ...prev, [field]: checked };
    });
    setStatus("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfile(function (prev) {
        return { ...prev, photoDataUrl: result };
      });
      setStatus("Profile photo updated.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setStatus("Account settings saved.");
  };

  const handleWingInputChange = (e) => {
    const value = e.detail.value || "";
    setWingInput(value);
    setStatus("");
  };

  const handleAddWing = () => {
    const trimmed = wingInput.trim();
    if (!trimmed) return;

    setProfile(function (prev) {
      const prevList = Array.isArray(prev.wingsOfChoice)
        ? prev.wingsOfChoice
        : [];
      return {
        ...prev,
        wingsOfChoice: prevList.concat(trimmed)
      };
    });

    setWingInput("");
    setStatus("Wing of choice added.");
  };

  const handleRemoveWing = (indexToRemove) => {
    setProfile(function (prev) {
      const prevList = Array.isArray(prev.wingsOfChoice)
        ? prev.wingsOfChoice
        : [];
      return {
        ...prev,
        wingsOfChoice: prevList.filter(function (_item, index) {
          return index !== indexToRemove;
        })
      };
    });
    setStatus("Wing of choice removed.");
  };

  const displayName = profile.isAnonymous
    ? "Anonymous Player"
    : (profile.firstName || "") +
      (profile.lastName ? " " + profile.lastName : "");

  const showRealName =
    !profile.isAnonymous && (profile.firstName || profile.lastName);

  const isError = false;

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>My Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          style={{
            padding: "16px",
            maxWidth: "520px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              marginBottom: "12px"
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
                    fontSize: "24px",
                    background: "rgba(255,255,255,0.1)"
                  }}
                >
                  ?
                </div>
              )}
            </IonAvatar>

            <div style={{ flex: 1 }}>
              <IonText>
                <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                  {displayName || "Unnamed Player"}
                </h2>
              </IonText>
              {showRealName && (
                <p style={{ margin: "4px 0 0", opacity: 0.7 }}>
                  Real name visible to you only.
                </p>
              )}
            </div>
          </div>

          {/* Compact, left-aligned Profile Photo Upload */}
          <div style={{ marginBottom: "16px" }}>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />

            <IonButton
              size="small"
              onClick={() => {
                const el = document.getElementById("photoInput");
                if (el) el.click();
              }}
              style={{
                "--border-radius": "10px",
                paddingLeft: "18px",
                paddingRight: "18px",
                fontWeight: "bold",
                marginTop: "4px",
                marginLeft: "0",
                width: "fit-content"
              }}
              color="primary"
            >
              Upload Photo
            </IonButton>
          </div>

          <IonList>
            <IonItem>
              <IonLabel position="stacked">First name</IonLabel>
              <IonInput
                value={profile.firstName}
                onIonChange={handleNameChange("firstName")}
                placeholder="First name"
                disabled={profile.isAnonymous}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Last name</IonLabel>
              <IonInput
                value={profile.lastName}
                onIonChange={handleNameChange("lastName")}
                placeholder="Last name"
                disabled={profile.isAnonymous}
              />
            </IonItem>

            <IonItem>
              <IonLabel>Anonymous mode</IonLabel>
              <IonToggle
                checked={profile.isAnonymous}
                onIonChange={handleToggleChange("isAnonymous")}
              />
            </IonItem>

            {/* Wings of choice input wrapped in a form so Enter works */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddWing();
              }}
              style={{ width: "100%" }}
            >
              <IonItem>
                <IonLabel position="stacked">Wings of choice</IonLabel>
                <IonInput
                  value={wingInput}
                  onIonChange={handleWingInputChange}
                  placeholder="R3X 11m, UL5 13m, Line 8m..."
                />
                <IonButton
                  size="small"
                  slot="end"
                  type="submit"
                >
                  Add
                </IonButton>
              </IonItem>
            </form>

            {/* Wings of choice list */}
            {Array.isArray(profile.wingsOfChoice) &&
              profile.wingsOfChoice.map(function (wing, index) {
                return (
                  <IonItem key={index}>
                    <IonLabel>{wing}</IonLabel>
                    <IonButton
                      size="small"
                      fill="clear"
                      slot="end"
                      onClick={function () {
                        handleRemoveWing(index);
                      }}
                    >
                      Remove
                    </IonButton>
                  </IonItem>
                );
              })}
          </IonList>

          <IonButton
            expand="block"
            color="primary"
            style={{ marginTop: "20px" }}
            onClick={handleSave}
          >
            Save Account Settings
          </IonButton>

          {status && (
            <IonText color={isError ? "danger" : "success"}>
              <p style={{ marginTop: "12px" }}>{status}</p>
            </IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountPage;
