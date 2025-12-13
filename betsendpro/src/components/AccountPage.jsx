import React, { useEffect, useRef, useState } from "react";
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
  IonTextarea,
} from "@ionic/react";

import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const normalizeKey = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Basic text sanitizer (matches your general pattern)
const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

/* ============================================================
   ✅ CLIENT-SIDE IMAGE COMPRESSION (NEW)
   - Allows "any size" upload by resizing/compressing before saving
   - Output stays small enough for Firestore
   ============================================================ */
const compressImageToDataUrl = (file, maxDim = 900, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onerror = reject;
    img.onerror = reject;

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      let { width, height } = img;

      // Resize proportionally to fit within maxDim
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // JPEG keeps size small and universally supported
      const out = canvas.toDataURL("image/jpeg", quality);
      resolve(out);
    };

    reader.readAsDataURL(file);
  });

const AccountPage = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    photoDataUrl: "",
    wings: [],
    harnesses: [],
    location: "",
  });

  const [wingInput, setWingInput] = useState("");
  const [harnessInput, setHarnessInput] = useState("");

  const [wingReviews, setWingReviews] = useState({});
  const [harnessReviews, setHarnessReviews] = useState({});

  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  // ✅ CLAIM FUNCTIONALITY (RESTORED)
  const [unclaimedList, setUnclaimedList] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [claimedContestantId, setClaimedContestantId] = useState(null);

  const statusTimerRef = useRef(null);
  const showTemporaryStatus = (msg) => {
    setStatus(msg);
    clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => setStatus(""), 8000);
  };

  // ============================================================
  // AUTH + LOAD PROFILE + REVIEWS
  // ============================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) return;

        setUser(u);

        const userSnap = await getDoc(doc(db, "users", u.uid));
        if (userSnap.exists()) {
          const d = userSnap.data();
          setProfile({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            photoDataUrl: d.photoDataUrl || "",
            wings: Array.isArray(d.wings) ? d.wings : [],
            harnesses: Array.isArray(d.harnesses) ? d.harnesses : [],
            location: d.location || "",
          });
          setClaimedContestantId(d.claimedContestantId || null);
        }

        // Load wing reviews
        const wingSnap = await getDocs(
          collection(db, "users", u.uid, "wingReviews")
        );
        const wingMap = {};
        wingSnap.forEach((d) => {
          wingMap[d.id] = {
            text: d.data().text || "",
            rating: typeof d.data().rating === "number" ? d.data().rating : 0,
          };
        });
        setWingReviews(wingMap);

        // Load harness reviews
        const harnessSnap = await getDocs(
          collection(db, "users", u.uid, "harnessReviews")
        );
        const harnessMap = {};
        harnessSnap.forEach((d) => {
          harnessMap[d.id] = {
            text: d.data().text || "",
            rating: typeof d.data().rating === "number" ? d.data().rating : 0,
          };
        });
        setHarnessReviews(harnessMap);
      } catch (err) {
        console.error("ACCOUNT LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ============================================================
  // LOAD UNCLAIMED CONTESTANTS (for name suggestions)
  // ============================================================
  useEffect(() => {
    const loadUnclaimed = async () => {
      try {
        const qy = query(
          collection(db, "contestants"),
          where("isUnclaimed", "==", true)
        );
        const snap = await getDocs(qy);
        setUnclaimedList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Unclaimed load error:", err);
      }
    };
    loadUnclaimed();
  }, []);

  // ============================================================
  // NAME INPUT HANDLER (DRIVES CLAIM SUGGESTIONS)
  // ============================================================
  const handleNameChange = (field) => (e) => {
    const raw = e.detail.value ?? "";
    const value = clean(raw);

    setProfile((prev) => {
      const updated = { ...prev, [field]: value };

      // Only show suggestions if user hasn't claimed already
      if (!claimedContestantId) {
        const fullName = `${updated.firstName} ${updated.lastName}`.trim();
        if (fullName.length >= 2) {
          const search = fullName.toLowerCase();

          const matches = unclaimedList.filter((c) => {
            const candidate = (
              c.nameSearch ||
              `${c.firstName || ""} ${c.lastName || ""}`
            )
              .toLowerCase()
              .trim();

            return candidate.includes(search);
          });

          setNameSuggestions(matches.slice(0, 6));
        } else {
          setNameSuggestions([]);
        }
      } else {
        setNameSuggestions([]);
      }

      return updated;
    });

    setStatus("");
  };

  const handleLocationChange = (e) => {
    setProfile((p) => ({ ...p, location: clean(e.detail.value ?? "") }));
  };

  // ============================================================
  // PHOTO UPLOAD (✅ NOW COMPRESSED, NO 2MB HARD CAP)
  // ============================================================
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      // Resize/compress to a safe base64 size for Firestore
      const dataUrl = await compressImageToDataUrl(file, 900, 0.82);
      setProfile((p) => ({ ...p, photoDataUrl: dataUrl }));
    } catch (err) {
      console.error("Photo compress error:", err);
      alert("Could not process that image.");
    }
  };

  // ============================================================
  // ADD / REMOVE GEAR
  // ============================================================
  const addWing = () => {
    const v = (wingInput ?? "").trim();
    if (!v) return;
    if (profile.wings.includes(v)) return;
    setProfile((p) => ({ ...p, wings: [...p.wings, v] }));
    setWingInput("");
  };

  const addHarness = () => {
    const v = (harnessInput ?? "").trim();
    if (!v) return;
    if (profile.harnesses.includes(v)) return;
    setProfile((p) => ({ ...p, harnesses: [...p.harnesses, v] }));
    setHarnessInput("");
  };

  const removeItem = (type, value) => {
    setProfile((p) => ({
      ...p,
      [type]: p[type].filter((x) => x !== value),
    }));
  };

  // ============================================================
  // ✅ CLAIM A CONTESTANT (RESTORED)
  // ============================================================
  const handleClaim = async (c) => {
    if (!user) return;

    const ok = window.confirm(
      `Claim "${c.firstName || ""} ${c.lastName || ""}". Inherit their votes?`
    );
    if (!ok) return;

    const cleanFirst = profile.firstName.trim();
    const cleanLast = profile.lastName.trim();

    try {
      const contestantRef = doc(db, "contestants", c.id);

      await updateDoc(contestantRef, {
        isUnclaimed: false,
        ownerUid: user.uid,
        firstName: cleanFirst,
        lastName: cleanLast,
        // also set avatar/location now (safe merge for lobby display)
        photoDataUrl: profile.photoDataUrl || "",
        location: profile.location || "",
        updatedAt: Date.now(),
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        claimedContestantId: c.id,
        firstName: cleanFirst,
        lastName: cleanLast,
        updatedAt: Date.now(),
      });

      setClaimedContestantId(c.id);
      setNameSuggestions([]);
      showTemporaryStatus("Contestant claimed!");
    } catch (err) {
      console.error("Claim error:", err);
      setStatus("Failed to claim contestant.");
    }
  };

  // ============================================================
  // SAVE SETTINGS + REVIEWS
  // ✅ FIX: also sync to contestants so Lobby updates
  // ============================================================
  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);

    try {
      const cleanFirst = profile.firstName.trim();
      const cleanLast = profile.lastName.trim();
      const cleanLocation = profile.location.trim();

      // ---- Save user profile ----
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profile,
          firstName: cleanFirst,
          lastName: cleanLast,
          location: cleanLocation,
          claimedContestantId: claimedContestantId || null,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // ✅ NEW: Sync to contestant doc that Lobby reads
      // If claimed -> use claimedContestantId
      // If not claimed -> use own uid (createContestantIfMissing pattern)
      const targetContestantId = claimedContestantId || user.uid;

      await setDoc(
        doc(db, "contestants", targetContestantId),
        {
          firstName: cleanFirst,
          lastName: cleanLast,
          photoDataUrl: profile.photoDataUrl || "",
          location: cleanLocation,
          wings: Array.isArray(profile.wings) ? profile.wings : [],
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // Save wing reviews
      for (const wing of profile.wings) {
        const key = normalizeKey(wing);
        await setDoc(
          doc(db, "users", user.uid, "wingReviews", key),
          {
            wingName: wing,
            rating: wingReviews[key]?.rating || 0,
            text: wingReviews[key]?.text || "",
            authorName: `${cleanFirst} ${cleanLast}`.trim(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      // Save harness reviews
      for (const harness of profile.harnesses) {
        const key = normalizeKey(harness);
        await setDoc(
          doc(db, "users", user.uid, "harnessReviews", key),
          {
            harnessName: harness,
            rating: harnessReviews[key]?.rating || 0,
            text: harnessReviews[key]?.text || "",
            authorName: `${cleanFirst} ${cleanLast}`.trim(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      showTemporaryStatus("Settings saved!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setStatus("Failed to save settings.");
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/signin";
  };

  // ============================================================
  // STARS
  // ============================================================
  const Stars = ({ value, onChange }) => (
    <div style={{ display: "flex", gap: 4, margin: "6px 0" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            cursor: "pointer",
            fontSize: 18,
            opacity: n <= value ? 1 : 0.3,
          }}
          onClick={() => onChange(n)}
        >
          ⭐
        </span>
      ))}
    </div>
  );

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

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="dark">
          <IonTitle>My Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
          {/* PROFILE HEADER */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <IonAvatar style={{ width: 72, height: 72 }}>
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt="profile" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.15)",
                    fontSize: 24,
                  }}
                >
                  ?
                </div>
              )}
            </IonAvatar>

            <div>
              <IonText>
                <h2 style={{ margin: 0 }}>
                  {profile.firstName || profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`.trim()
                    : "Unnamed Pilot"}
                </h2>
              </IonText>

              <input
                type="file"
                hidden
                id="photoInput"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <IonButton
                size="small"
                onClick={() => document.getElementById("photoInput").click()}
              >
                Upload Photo
              </IonButton>
            </div>
          </div>

          {/* NAME + LOCATION INPUTS (AND CLAIM SUGGESTIONS) */}
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

          {/* ✅ CLAIM UI (RESTORED) */}
          {!claimedContestantId && nameSuggestions.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <IonText>
                <b>Claim your existing votes:</b>
              </IonText>

              {nameSuggestions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.12)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleClaim(s)}
                >
                  {clean(s.firstName || "")} {clean(s.lastName || "")}
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                    Click to claim and inherit votes
                  </div>
                </div>
              ))}
            </div>
          )}

          {claimedContestantId && (
            <IonText>
              <p style={{ marginTop: 10, opacity: 0.75 }}>
                ✅ You have claimed a contestant profile.
              </p>
            </IonText>
          )}

          {/* ADD WING */}
          <IonItem style={{ marginTop: 12 }}>
            <IonInput
              placeholder="Add wing"
              value={wingInput}
              onIonChange={(e) => setWingInput(e.detail.value ?? "")}
            />
            <IonButton onClick={addWing}>Add</IonButton>
          </IonItem>

          {/* ADD HARNESS */}
          <IonItem>
            <IonInput
              placeholder="Add harness"
              value={harnessInput}
              onIonChange={(e) => setHarnessInput(e.detail.value ?? "")}
            />
            <IonButton onClick={addHarness}>Add</IonButton>
          </IonItem>

          {/* WINGS */}
          <Section
            title="Wings"
            items={profile.wings}
            reviews={wingReviews}
            setReviews={setWingReviews}
            removeItem={(v) => removeItem("wings", v)}
            Stars={Stars}
          />

          {/* HARNESSES */}
          <Section
            title="Harnesses"
            items={profile.harnesses}
            reviews={harnessReviews}
            setReviews={setHarnessReviews}
            removeItem={(v) => removeItem("harnesses", v)}
            Stars={Stars}
          />

          <IonButton expand="block" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Account Settings"}
          </IonButton>

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

const Section = ({ title, items, reviews, setReviews, removeItem, Stars }) => (
  <div style={{ marginTop: 24 }}>
    <IonLabel>
      <h3>{title}</h3>
    </IonLabel>

    {items.map((item) => {
      const key = normalizeKey(item);
      const review = reviews[key] || { text: "", rating: 0 };

      return (
        <div key={key} style={{ marginTop: 12 }}>
          <strong>{item}</strong>

          <Stars
            value={review.rating}
            onChange={(r) =>
              setReviews((prev) => ({
                ...prev,
                [key]: { ...review, rating: r },
              }))
            }
          />

          <IonTextarea
            value={review.text}
            placeholder={`Your thoughts on this ${title.slice(0, -1)}...`}
            onIonChange={(e) =>
              setReviews((prev) => ({
                ...prev,
                [key]: { ...review, text: e.detail.value ?? "" },
              }))
            }
            autoGrow
          />

          <IonButton
            size="small"
            color="danger"
            style={{ marginTop: 6 }}
            onClick={() => removeItem(item)}
          >
            Remove
          </IonButton>
        </div>
      );
    })}
  </div>
);

export default AccountPage;
