"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

import { QrReader } from "react-qr-reader";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();

  const [uid, setUid] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userUid = localStorage.getItem("uid");

    if (!userUid) return;

    setUid(userUid);
  }, []);

  const onScan = async (targetUid: string) => {
    if (!targetUid) return;

    if (loading) return;

    if (targetUid === uid) return;

    setLoading(true);

    const historyId = `${uid}_${targetUid}`;

    const historyRef = doc(
      db,
      "histories",
      historyId
    );

    const historySnap = await getDoc(historyRef);

    if (historySnap.exists()) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", targetUid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setLoading(false);
      return;
    }

    const data = userSnap.data();

    await setDoc(historyRef, {
      ownerUid: uid,
      targetUid,
      xId: data.xId,
      bio: data.bio,
      iconUrl: data.iconUrl,
      createdAt: Date.now(),
    });

    router.push("/history");
  };

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: "white" }}>
          QR Scan
        </h1>

        <div
          style={{
            overflow: "hidden",
            borderRadius: 20,
            width: "100%",
            marginTop: 20,
          }}
        >
          <QrReader
            constraints={{
              facingMode: "environment",
            }}
            onResult={(result) => {
              if (!result) return;

              onScan(result.getText());
            }}
            style={{
              width: "100%",
            }}
          />
        </div>
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