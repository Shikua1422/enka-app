"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function ScanPage() {

  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [myProfile, setMyProfile] =
    useState<any>(null);

  const scannerRef =
    useRef<Html5QrcodeScanner | null>(null);

  const processingRef = useRef(false);

  useEffect(() => {

    const init = async () => {

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

    init();

    return () => {
      scannerRef.current?.clear();
    };

  }, []);

  const startScanner = (myId: string) => {

    // 二重起動防止
    if (scannerRef.current) return;

    const scanner =
      new Html5QrcodeScanner(
        "reader",
        {
          fps: 5,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        false
      );

    scannerRef.current = scanner;

    scanner.render(

      async (decodedText) => {

        // 処理中なら無視
        if (processingRef.current) {
          return;
        }

        processingRef.current = true;

        try {

          const result =
            await handleExchange(
              myId,
              decodedText
            );

          // 成功時のみ履歴へ
          if (result === "success") {

            // カメラ停止
            await scanner.clear();

            // 少し待ってから遷移
            setTimeout(() => {
              router.push("/history");
            }, 300);

            return;
          }

          // 既交換
          if (result === "already") {
            alert("このユーザーとは交換済みです");
          }

          // 自分
          if (result === "self") {
            alert("自分自身は交換できません");
          }

        } catch (e) {
          console.error(e);
        }

        // 連打防止
        setTimeout(() => {
          processingRef.current = false;
        }, 1500);

      },

      () => {}
    );
  };

  const handleExchange = async (
    myId: string,
    targetId: string
  ) => {

    // 自分禁止
    if (myId === targetId) {
      return "self";
    }

    // 組み合わせ固定
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

    // 既交換
    if (historySnap.exists()) {
      return "already";
    }

    // 相手存在確認
    const targetSnap =
      await getDoc(
        doc(db, "users", targetId)
      );

    if (!targetSnap.exists()) {
      return "notfound";
    }

    // 保存
    await setDoc(historyRef, {
      users: [myId, targetId],
      createdAt: Date.now(),
    });

    return "success";
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">

      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Scan
        </h1>

        {/* PROFILE CARD */}
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl mb-6">

          <div className="flex flex-col items-center">

            {myProfile?.icon && (
              <img
                src={myProfile.icon}
                alt="icon"
                className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4 object-cover"
              />
            )}

            <div className="text-2xl font-bold mb-2">
              {myProfile?.name || "NO NAME"}
            </div>

            <div className="text-zinc-400 text-center whitespace-pre-wrap mb-6">
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

        {/* SCANNER */}
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl">

          <h2 className="text-xl font-bold mb-4">
            QR読み取り
          </h2>

          <div id="reader" />

          <p className="text-zinc-500 text-sm mt-4">
            読み取り成功後、自動で履歴へ移動します
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