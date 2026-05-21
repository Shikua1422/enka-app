"use client";

import { useEffect, useRef, useState } from "react";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

import { Html5Qrcode } from "html5-qrcode";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();

  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const [uid, setUid] = useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const myUid = localStorage.getItem("uid");

    if (!myUid) return;

    setUid(myUid);

    const scanner =
      new Html5Qrcode("reader");

    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          if (loading) return;

          if (decodedText === myUid)
            return;

          setLoading(true);

          const historyId =
            myUid + "_" + decodedText;

          const historyRef = doc(
            db,
            "histories",
            historyId
          );

          const historySnap =
            await getDoc(historyRef);

          if (historySnap.exists()) {
            setLoading(false);
            return;
          }

          const userRef = doc(
            db,
            "users",
            decodedText
          );

          const userSnap =
            await getDoc(userRef);

          if (!userSnap.exists()) {
            setLoading(false);
            return;
          }

          const data = userSnap.data();

          await setDoc(historyRef, {
            ownerUid: myUid,
            targetUid: decodedText,
            xId: data.xId,
            bio: data.bio,
            iconUrl: data.iconUrl,
            createdAt: Date.now(),
          });

          if (scanner.isScanning) {
            await scanner.stop();
          }

          router.push("/history");
        }
      )
      .catch(console.error);

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            color: "white",
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          QR Scan
        </h1>

        <div
          id="reader"
          style={{
            width: "100%",
            overflow: "hidden",
            borderRadius: 20,
          }}
        />

        <p
          style={{
            color: "#cbd5e1",
            marginTop: 16,
            textAlign: "center" as const,
          }}
        >
          QRコードを読み込んで交換
        </p>
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