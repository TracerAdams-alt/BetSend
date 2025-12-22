import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonText
} from "@ionic/react";

import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit
} from "firebase/firestore";

// Simple sanitizer to block HTML injection/XSS
const clean = (str) =>
  typeof str === "string"
    ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

const BulletinPage = () => {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  //  Load posts (latest first)
  useEffect(() => {
    const q = query(
      collection(db, "bulletin"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: clean(data.text || ""),
          author: clean(data.author || "Unknown"),
          createdAt: data.createdAt?.toDate?.() || new Date()
        };
      });
      setPosts(arr);
    });

    return () => unsub();
  }, []);

  // ===========================
  // POST MESSAGE
  // ===========================
  const handlePost = async () => {
    if (!auth.currentUser) {
      alert("You must be signed in to post.");
      return;
    }

    if (!message.trim()) return;

    if (sending) return; // rate limit
    setSending(true);

    try {
      await addDoc(collection(db, "bulletin"), {
        text: clean(message.trim()),
        author: auth.currentUser.displayName || "Anonymous",
        createdAt: serverTimestamp()
      });

      setMessage("");
    } catch (err) {
      console.error("POST ERROR:", err);
    }

    setSending(false);
  };

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar color="dark">
          <IonTitle>Bulletin Board</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
          <h2>Community Bulletin Board</h2>
          <p style={{ opacity: 0.7 }}>
            Post updates, announcements, or messages to the group.
          </p>

          {/* Posting UI */}
          <IonItem>
            <IonInput
              placeholder="Write a message..."
              value={message}
              onIonChange={(e) => setMessage(e.detail.value)}
            />
            <IonButton
              onClick={handlePost}
              disabled={!message.trim() || sending}
            >
              Post
            </IonButton>
          </IonItem>

          <IonList style={{ marginTop: "20px" }}>
            {posts.map((p) => (
              <IonItem key={p.id}>
                <IonLabel>
                  <b>{p.author}</b>
                  <p style={{ margin: "4px 0" }}>{p.text}</p>
                  <IonText color="medium" style={{ fontSize: "12px" }}>
                    {p.createdAt.toLocaleString()}
                  </IonText>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BulletinPage;
