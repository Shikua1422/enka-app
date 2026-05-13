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
    const saved = localStorage.getItem("profile");
    if (saved) {
      const p = JSON.parse(saved);
      setName(p.name || "");
      setBio(p.bio || "");
      setIconBase64(p.iconBase64 || "");
      setUserId(p.id || "");
    }
  }, []);

  const save = async () => {
    const id = userId || crypto.randomUUID();

    await setDoc(doc(db, "users", id), {
      name,
      bio,
      iconBase64,
      updatedAt: new Date(),
    });

    setUserId(id);

    localStorage.setItem(
      "profile",
      JSON.stringify({ id, name, bio, iconBase64 })
    );

    alert("保存しました");
  };

  return (
    <div style={{ padding: 15 }}>
      <h2>プロフィール</h2>

      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => setIconBase64(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />

      {iconBase64 && (
        <img
          src={iconBase64}
          style={{ width: 80, height: 80, borderRadius: "50%" }}
        />
      )}

      <textarea
        placeholder="自己紹介"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{ ...input, height: 100 }}
      />

      <button onClick={save} style={button}>
        保存
      </button>

      {userId && (
        <div style={{ marginTop: 20 }}>
          <QRCodeCanvas value={userId} size={160} />
        </div>
      )}
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  border: "1px solid #ddd",
  borderRadius: 10,
};

const button = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: "bold",
};