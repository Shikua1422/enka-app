"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    let savedUserId = localStorage.getItem("userId");

    if (!savedUserId) {
      savedUserId = crypto.randomUUID();
      localStorage.setItem("userId", savedUserId);
    }

    setUserId(savedUserId);

    const snap = await getDoc(doc(db, "users", savedUserId));

    if (snap.exists()) {
      const data = snap.data();

      setName(data.name || "");
      setBio(data.bio || "");
      setXUrl(data.xUrl || "");
      setIcon(data.icon || "");
    }
  };

  const handleXUrlChange = (value: string) => {
    setXUrl(value);

    const username = value
      .split("x.com/")[1]
      ?.replace("/", "");

    if (username) {
      setIcon(`https://unavatar.io/x/${username}`);
    }
  };

  const saveProfile = async () => {
    if (!userId) return;

    await setDoc(doc(db, "users", userId), {
      name,
      bio,
      xUrl,
      icon,
      updatedAt: Date.now(),
    });

    alert("保存しました");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Profile
        </h1>

        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl">

          <div className="flex justify-center mb-6">
            {icon ? (
              <img
                src={icon}
                alt="icon"
                className="w-28 h-28 rounded-full border-4 border-cyan-400"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-zinc-700" />
            )}
          </div>

          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
          />

          <textarea
            placeholder="自由記述"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 mb-4 h-28"
          />

          <input
            type="text"
            placeholder="https://x.com/ユーザー名"
            value={xUrl}
            onChange={(e) => handleXUrlChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 mb-6"
          />

          <button
            onClick={saveProfile}
            className="w-full bg-cyan-500 hover:bg-cyan-400 transition rounded-xl p-3 font-bold"
          >
            保存
          </button>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-md mx-auto flex justify-around p-4">

        <Link href="/profile" className="text-cyan-400 font-bold">
          Profile
        </Link>

        <Link href="/scan" className="text-white">
          Scan
        </Link>

        <Link href="/history" className="text-white">
          History
        </Link>

      </div>
    </div>
  );
}