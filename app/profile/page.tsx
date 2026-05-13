"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [iconBase64, setIconBase64] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);

      setName(profile.name || "");
      setBio(profile.bio || "");
      setIconBase64(profile.iconBase64 || "");
      setUserId(profile.id || "");
    }
  }, []);

  const handleSave = async () => {
    const id = userId || crypto.randomUUID();

    await setDoc(doc(db, "users", id), {
      name,
      bio,
      iconBase64,
      createdAt: new Date(),
    });

    setUserId(id);

    localStorage.setItem(
      "profile",
      JSON.stringify({
        id,
        name,
        bio,
        iconBase64,
      })
    );

    alert("保存しました！");
  };

  return (
    <main style={{ padding: "40px" }}>
      <h1>プロフィール編集</h1>

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
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          const reader = new FileReader();

          reader.onloadend = () => {
            setIconBase64(reader.result as string);
          };

          reader.readAsDataURL(file);
        }}
        style={{
          display: "block",
          marginBottom: "10px",
        }}
      />

      {iconBase64 && (
        <img
          src={iconBase64}
          alt="icon"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
      )}

      <textarea
        placeholder="自由記述欄"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
          padding: "10px",
          width: "300px",
          height: "120px",
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
    </main>
  );
}