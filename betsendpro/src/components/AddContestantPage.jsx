import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText
} from "@ionic/react";

import { useHistory } from "react-router-dom";

import { auth, db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

const MAX_CONTESTANT_CREATIONS = 10;

// ---------------------------------------------------------
// 🔥 Levenshtein Distance (Fuzzy Similarity Algorithm)
// ---------------------------------------------------------
function levenshtein(a, b) {
  if (!a || !b) return Infinity;

  const matrix = Array.from({ length: a.length + 1 }, () => []);

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}
// ---------------------------------------------------------

const AddContestantPage = () => {
  const [nameInput, setNameInput] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const history = useHistory();

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to add a contestant.");
      return;
    }

    const trimmed = nameInput.trim();
    if (!trimmed) {
      setStatus("Please enter a name.");
      return;
    }

    // ✅ NORMALIZED SPLIT (fixes empty last names)
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");
    const typedName = `${firstName} ${lastName}`.trim().toLowerCase();

    // 🚫 HARD STOP: never create empty contestants
    if (!firstName && !lastName) {
      setStatus("Invalid name.");
      return;
    }

    if (saving) return;
    setSaving(true);
    setStatus("");

    try {
      const contestantsCol = collection(db, "contestants");

      // =====================================================
      // 🔥 GUARDRAIL #1 — LIMIT TO 10 ADDED CONTESTANTS
      // =====================================================
      const userCountQuery = query(
        contestantsCol,
        where("suggestedBy", "==", user.uid)
      );
      const countSnap = await getDocs(userCountQuery);

      if (countSnap.size >= MAX_CONTESTANT_CREATIONS) {
        setStatus(
          `You have reached the limit of ${MAX_CONTESTANT_CREATIONS} added contestants.`
        );
        setSaving(false);
        return;
      }

      // =====================================================
      // 🔥 GUARDRAIL #2 — DUPLICATES + SIMILARITY CHECK
      // =====================================================
      const existingSnap = await getDocs(contestantsCol);

      let blockDueToSimilarity = false;

      existingSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};

        // ✅ IGNORE EMPTY / INVALID CONTESTANTS
        const fn = (data.firstName || "").trim();
        const ln = (data.lastName || "").trim();
        if (!fn && !ln) return;

        const fullLower = `${fn} ${ln}`.trim().toLowerCase();
        if (fullLower.length < 2) return;

        const tokens = fullLower.split(" ");

        // exact match
        if (fullLower === typedName) {
          blockDueToSimilarity = true;
          return;
        }

        // prefix / contains match
        if (
          fullLower.startsWith(typedName) ||
          typedName.startsWith(fullLower)
        ) {
          blockDueToSimilarity = true;
          return;
        }

        // token match
        const typedTokens = typedName.split(" ");
        typedTokens.forEach((t, i) => {
          if (tokens[i] && tokens[i].startsWith(t)) {
            blockDueToSimilarity = true;
          }
        });

        // fuzzy match
        const distance = levenshtein(typedName, fullLower);
        if (distance <= 2) {
          blockDueToSimilarity = true;
        }
      });

      if (blockDueToSimilarity) {
        setStatus(
          "A contestant with a similar name already exists. Please check the roster."
        );
        setSaving(false);
        return;
      }

      // =====================================================
      // 🚀 CREATE NEW UNCLAIMED CONTESTANT
      // =====================================================
      const newRef = doc(contestantsCol);

      await setDoc(newRef, {
        firstName,
        lastName,
        wings: [],
        photoDataUrl: "",
        burgerVotes: 0,
        friesVotes: 0,
        isUnclaimed: true,
        ownerUid: null,
        nameSearch: typedName,
        suggestedBy: user.uid,
        createdAt: serverTimestamp()
      });

      setStatus("Contestant added to the roster as unclaimed.");
      setNameInput("");

      setTimeout(() => {
        history.push("/lobby");
      }, 800);
    } catch (err) {
      console.error("Error adding contestant:", err);
      setStatus("Failed to add contestant.");
    }

    setSaving(false);
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Add Contestant</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
          <h2>Submit a New Contestant</h2>
          <p style={{ opacity: 0.7 }}>
            Type the name of the person you want to add. They’ll
            appear as unclaimed until they create an account and claim it.
          </p>

          <IonItem>
            <IonLabel position="stacked">Contestant Name</IonLabel>
            <IonInput
              placeholder="type contestant name here"
              value={nameInput}
              onIonChange={(e) => setNameInput(e.detail.value ?? "")}
            />
          </IonItem>

          <IonButton
            expand="block"
            style={{ marginTop: "20px" }}
            onClick={handleSubmit}
            disabled={saving || !nameInput.trim()}
          >
            {saving ? "Checking..." : "Add to Roster"}
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

export default AddContestantPage;
