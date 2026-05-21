"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

import QRCode from "react-qr-code";
import Link from "next/link";

export default function ProfilePage() {
  const [uid, setUid] = useState("");
  const [xId, setXId] = useState("");
  const [bio, setBio] = useState("");

  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const userUid = localStorage.getItem("uid");

    if (!userUid) return;

    setUid(userUid);

    load(userUid);
  }, []);

  const load = async (userUid: string) => {
    const ref = doc(db, "users", userUid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    setXId(data.xId || "");
    setBio(data.bio || "");
  };

  const save = async () => {
    await updateDoc(doc(db, "users", uid), {
      bio,
    });

    alert("保存しました");
  };

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <img
          src={`https://unavatar.io/x/${xId}`}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            marginBottom: 16,
          }}
        />

        <h1 style={{ color: "white" }}>
          @{xId}
        </h1>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="プロフィール"
          style={{
            width: "100%",
            height: 120,
            borderRadius: 12,
            border: "none",
            padding: 12,
            marginTop: 20,
            fontSize: 16,
          }}
        />

        <button
          onClick={save}
          style={buttonStyle}
        >
          保存
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          style={{
            ...buttonStyle,
            background: "#8b5cf6",
          }}
        >
          QR表示
        </button>

        {showQR && (
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 20,
              marginTop: 20,
            }}
          >
            <QRCode
              value={uid}
              size={260}
            />
          </div>
        )}
      </div>

      <nav style={navStyle}>
        <Link href="/profile">Profile</Link>
        <Link href="/scan">Scan</Link>
        <Link href="/history">History</Link>
      </nav>
    </main>
  );
}

const mainStyle = {
  minHeight: "100vh",
  background: "#0f172a",
  padding: 20,
};

const cardStyle = {
  background: "#1e293b",
  borderRadius: 24,
  padding: 24,
  maxWidth: 500,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
};

const buttonStyle = {
  marginTop: 16,
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "bold",
};

const navStyle = {
  position: "fixed" as const,
  bottom: 0,
  left: 0,
  right: 0,
  background: "#111827",
  display: "flex",
  justifyContent: "space-around",
  padding: 16,
  color: "white",
};