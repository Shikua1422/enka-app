"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function ScanPage() {
  const [userId, setUserId] = useState("");
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const savedUserId =
      localStorage.getItem("userId");

    if (!savedUserId) return;

    setUserId(savedUserId);

    const snap = await getDoc(
      doc(db, "users", savedUserId)
    );

    if (snap.exists()) {
      setMyProfile(snap.data());
    }

    startScanner(savedUserId);
  };

  const startScanner = (myId: string) => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        await exchangeProfile(myId, decodedText);
      },
      () => {}
    );
  };

  const exchangeProfile = async (
    myId: string,
    targetId: string
  ) => {
    if (myId === targetId) {
      alert("自分自身とは交換できません");
      return;
    }

    const historyId =
      [myId, targetId].sort().join("_");

    const historyRef = doc(
      db,
      "history",
      historyId
    );

    const historySnap = await getDoc(historyRef);

    if (historySnap.exists()) {
      alert("すでに交換済みです");
      return;
    }

    const targetSnap = await getDoc(
      doc(db, "users", targetId)
    );

    if (!targetSnap.exists()) {
      alert("ユーザーが存在しません");
      return;
    }

    await setDoc(historyRef, {
      users: [myId, targetId],
      createdAt: Date.now(),
    });

    alert("交換しました");
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Scan
        </h1>

        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl mb-6">

          <div className="flex flex-col items-center">

            {myProfile?.icon && (
              <img
                src={myProfile.icon}
                alt="icon"
                className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4"
              />
            )}

            <div className="text-2xl font-bold">
              {myProfile?.name}
            </div>

            <div className="text-zinc-400 mb-6 text-center">
              {myProfile?.bio}
            </div>

            <div className="bg-white p-4 rounded-2xl">
              <QRCodeCanvas
                value={userId}
                size={220}
              />
            </div>

          </div>

        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4">
            QR読み取り
          </h2>

          <div id="reader" />
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

        <Link href="/profile" className="text-white">
          Profile
        </Link>

        <Link href="/scan" className="text-cyan-400 font-bold">
          Scan
        </Link>

        <Link href="/history" className="text-white">
          History
        </Link>

      </div>
    </div>
  );
}