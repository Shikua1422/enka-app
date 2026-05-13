"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { QRCodeCanvas } from "qrcode.react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      const saved = localStorage.getItem("profile");
      if (!saved) return;

      const local = JSON.parse(saved);
      if (!local.id) return;

      const snap = await getDoc(doc(db, "users", local.id));

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setBio(data.bio || "");
        setIconUrl(data.iconUrl || "");
        setUserId(local.id);
      }
    };

    load();
  }, []);

  // 💾 保存（画像アップロード込み）
  const handleSave = async () => {
    const id = userId || crypto.randomUUID();

    let uploadedUrl = iconUrl;

    // 🔥 画像が変更された時だけアップロード
    if (file) {
      const storageRef = ref(storage, `icons/${id}`);
      await uploadBytes(storageRef, file);
      uploadedUrl = await getDownloadURL(storageRef);
    }

    const data = {
      name,
      bio,
      iconUrl: uploadedUrl,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", id), data);

    setUserId(id);

    localStorage.setItem(
      "profile",
      JSON.stringify({ id, ...data })
    );

    alert("保存しました");
  };

  return (
    <main style={{ padding: 15 }}>
      <h2>プロフィール</h2>

      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />

      {/* 画像 */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setFile(f);
        }}
      />

      {/* プレビュー */}
      {iconUrl && (
        <img
          src={iconUrl}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            marginTop: 10,
          }}
        />
      )}

      <textarea
        placeholder="自己紹介"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{ ...input, height: 120 }}
      />

      <button onClick={handleSave} style={button}>
        保存
      </button>

      {userId && (
        <div style={{ marginTop: 20 }}>
          <QRCodeCanvas value={userId} size={160} />
        </div>
      )}
    </main>
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
  color: "white",
  fontWeight: "bold",
};