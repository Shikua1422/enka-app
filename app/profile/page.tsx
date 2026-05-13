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

  // 🔥 起動時にローカルから復元
  useEffect(() => {
    const saved = localStorage.getItem("profile");

    if (saved) {
      const profile = JSON.parse(saved);

      setName(profile.name || "");
      setBio(profile.bio || "");
      setIconBase64(profile.iconBase64 || "");
      setUserId(profile.id || "");
    }
  }, []);

  // 💾 保存（Firestore + localStorage）
  const handleSave = async () => {
    const id = userId || crypto.randomUUID();

    const data = {
      name,
      bio,
      iconBase64,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", id), data);

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

      {/* 名前 */}
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

      {/* 画像アップロード */}
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

      {/* プレビュー画像 */}
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

      {/* 自由記述 */}
      <textarea
        placeholder="自由記述（自己紹介など）"
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

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        保存
      </button>

      {/* QR表示 */}
      {userId && (
        <div style={{ marginTop: "30px" }}>
          <p>あなたのQRコード</p>

          <QRCodeCanvas value={userId} size={200} />
        </div>
      )}

      {/* 👇リアルタイムプレビュー */}
      <div
        style={{
          marginTop: "40px",
          border: "1px solid #ccc",
          padding: "20px",
          width: "320px",
          borderRadius: "10px",
        }}
      >
        <h2>プレビュー</h2>

        {iconBase64 && (
          <img
            src={iconBase64}
            alt="icon"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
            }}
          />
        )}

        <p>名前: {name || "未入力"}</p>

        <div
          style={{
            whiteSpace: "pre-wrap",
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          {bio || "自由記述が未入力です"}
        </div>
      </div>
    </main>
  );
}