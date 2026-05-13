"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [iconBase64, setIconBase64] = useState("");
  const [userId, setUserId] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 初期ロード（Firestore優先）
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
        setIconBase64(data.iconBase64 || "");
        setUserId(local.id);
      }
    };

    load();
  }, []);

  // 💾 自動保存関数
  const autoSave = async (nextData: any) => {
    const id = userId || crypto.randomUUID();

    await setDoc(doc(db, "users", id), nextData);

    setUserId(id);

    localStorage.setItem(
      "profile",
      JSON.stringify({
        id,
        ...nextData,
      })
    );
  };

  // ⏱ デバウンス付き更新
  const scheduleSave = (updated: any) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      autoSave(updated);
    }, 800);
  };

  return (
    <main style={{ padding: 15 }}>
      <h2>プロフィール（自動保存）</h2>

      {/* 名前 */}
      <input
        placeholder="名前"
        value={name}
        onChange={(e) => {
          const v = e.target.value;
          setName(v);
          scheduleSave({
            name: v,
            bio,
            iconBase64,
          });
        }}
        style={input}
      />

      {/* 画像 */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();

          reader.onloadend = () => {
            const img = reader.result as string;

            setIconBase64(img);

            scheduleSave({
              name,
              bio,
              iconBase64: img,
            });
          };

          reader.readAsDataURL(file);
        }}
      />

      {/* アイコン */}
      {iconBase64 && (
        <img
          src={iconBase64}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            marginTop: 10,
          }}
        />
      )}

      {/* 自己紹介 */}
      <textarea
        placeholder="自己紹介"
        value={bio}
        onChange={(e) => {
          const v = e.target.value;
          setBio(v);

          scheduleSave({
            name,
            bio: v,
            iconBase64,
          });
        }}
        style={{ ...input, height: 120 }}
      />

      {/* QR */}
      {userId && (
        <div style={{ marginTop: 20 }}>
          <p>あなたのQR</p>
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