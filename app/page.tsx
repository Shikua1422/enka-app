"use client";

import { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [name, setName] = useState("");
  const [oshi, setOshi] = useState("");
  const [userId, setUserId] = useState("");

  const handleSave = async () => {
    const id = crypto.randomUUID();

    await setDoc(doc(db, "users", id), {
      name: name,
      oshi: oshi,
      createdAt: new Date(),
    });

    setUserId(id);

    localStorage.setItem(
      "profile",
      JSON.stringify({
        id,
        name,
        oshi,
      })
    );
  };

  return (
    <main style={{ padding: "40px" }}>
      <h1>エンカ交換アプリ</h1>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "300px",
          }}
        />

        <input
          type="text"
          placeholder="推し"
          value={oshi}
          onChange={(e) => setOshi(e.target.value)}
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "300px",
          }}
        />

        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          保存
        </button>

        {userId && (
          <div style={{ marginTop: "30px" }}>
            <p>あなたのQRコード</p>

            <QRCodeCanvas value={userId} size={200} />
          </div>
        )}
      </div>
    </main>
  );
}