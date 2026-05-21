"use client";

import { useEffect, useRef, useState } from "react";
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

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // 同じQR連続読み込み防止
  const lastScannedRef = useRef("");
  const isProcessingRef = useRef(false);

  useEffect(() => {
    initializeUser();

    return () => {
      scannerRef.current?.clear();
    };
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
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5,
        qrbox: 250,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {

        // 同じQR連続防止
        if (
          lastScannedRef.current === decodedText
        ) {
          return;
        }

        // 二重実行防止
        if (isProcessingRef.current) {
          return;
        }

        isProcessingRef.current = true;
        lastScannedRef.current = decodedText;

        try {
          await exchangeProfile(
            myId,
            decodedText
          );
        } catch (e) {
          console.error(e);
        }

        // 3秒後に再読込可能
        setTimeout(() => {
          lastScannedRef.current = "";
        }, 3000);

        isProcessingRef.current = false;
      },
      () => {}
    );
  };

  const exchangeProfile = async (
    myId: string,
    targetId: string
  ) => {

    // 自分禁止
    if (myId === targetId) {
      return;
    }

    // 2人の組み合わせ固定
    const historyId =
      [myId, targetId]
        .sort()
        .join("_");

    const historyRef = doc(
      db,
      "history",
      historyId
    );

    const historySnap =
      await getDoc(historyRef);

    // 既交換なら無視
    if (historySnap.exists()) {
      return;
    }

    const targetSnap = await getDoc(
      doc(db, "users", targetId)
    );

    if (!targetSnap.exists()) {
      return;
    }

    await setDoc(historyRef, {
      users: [myId, targetId],
      createdAt: Date.now(),
    });

    alert("交換しました！");
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
              {myProfile?.name || "NO NAME"}
            </div>

            <div className="text-zinc-400 mb-6 text-center whitespace-pre-wrap">
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

          <p className="text-zinc-500 text-sm mt-4">
            同じユーザーは1回のみ交換できます
          </p>

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

        <Link
          href="/profile"
          className="text-white"
        >
          Profile
        </Link>

        <Link
          href="/scan"
          className="text-cyan-400 font-bold"
        >
          Scan
        </Link>

        <Link
          href="/history"
          className="text-white"
        >
          History
        </Link>

      </div>
    </div>
  );
}