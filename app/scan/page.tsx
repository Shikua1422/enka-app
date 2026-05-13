"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function ScanPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const start = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render((text) => {
        const ref = doc(db, "users", text);

        // 🔥 リアルタイム監視
        onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setUser(snap.data());
          }
        });
      }, () => {});
    };

    start();
  }, []);

  return (
    <div style={{ padding: 15 }}>
      <h2>QR読み取り</h2>

      <div id="reader" />

      {user && (
        <div style={card}>
          {user.iconBase64 && (
            <img
              src={user.iconBase64}
              style={{ width: 80, borderRadius: "50%" }}
            />
          )}

          <p>{user.name}</p>
          <p>{user.bio}</p>
        </div>
      )}
    </div>
  );
}

const card = {
  marginTop: 20,
  padding: 15,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
};