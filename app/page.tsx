"use client";

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [name, setName] = useState("");
  const [oshi, setOshi] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("name");
    const savedOshi = localStorage.getItem("oshi");

    if (savedName) {
      setName(savedName);
    }

    if (savedOshi) {
      setOshi(savedOshi);
    }
  }, []);

  const handleSave = async () => {
    try {
      // localStorage保存
      localStorage.setItem("name", name);
      localStorage.setItem("oshi", oshi);

      // Firebase保存
      const docRef = await addDoc(collection(db, "users"), {
  name: name,
  oshi: oshi,
  createdAt: new Date(),
});

setUserId(docRef.id);

      alert("Firebaseに保存しました！");
    } catch (error) {
      console.error(error);
      alert("保存に失敗しました");
    }
  };

  return (
    <main style={{ padding: "40px" }}>
      <h1>エンカ交換アプリ</h1>

      <div style={{ marginTop: "20px" }}>
        <p>名前</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px",
            width: "300px",
            marginBottom: "20px",
          }}
        />

        <p>推し</p>
        <input
          type="text"
          value={oshi}
          onChange={(e) => setOshi(e.target.value)}
          style={{
            padding: "8px",
            width: "300px",
            marginBottom: "20px",
          }}
        />

        <br />

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