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

      let savedUserId =
        localStorage.getItem("userId");

      // 初回ユーザー生成
      if (!savedUserId) {

        savedUserId =
          crypto.randomUUID();

        localStorage.setItem(
          "userId",
          savedUserId
        );
      }

      setUserId(savedUserId);

      const userRef =
        doc(db, "users", savedUserId);

      const userSnap =
        await getDoc(userRef);

      // 初回プロフィール生成
      if (!userSnap.exists()) {

        await setDoc(userRef, {
          name: "NO NAME",
          bio: "",
          icon:
            "https://placehold.jp/150x150.png",
          updatedAt: Date.now(),
        });

        setMyProfile({
          name: "NO NAME",
          bio: "",
          icon:
            "https://placehold.jp/150x150.png",
        });

      } else {

        setMyProfile(userSnap.data());
      }

      startScanner(savedUserId);
    };

    init();

    return () => {
      scannerRef.current?.clear();
    };

  }, []);

  const startScanner = (myId: string) => {

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

          // 成功
          if (result === "success") {

            await scanner.clear();

            setTimeout(() => {
              router.push("/history");
            }, 300);

            return;
          }

          // 既交換
          if (result === "already") {
            alert(
              "このユーザーとは交換済みです"
            );
          }

          // 自分
          if (result === "self") {
            alert(
              "自分自身は交換できません"
            );
          }

        } catch (e) {
          console.error(e);
        }

        // 連続通知防止
        setTimeout(() => {
          processingRef.current = false;
        }, 2000);

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

    // 固定ペアキー
    const pairKey =
      [myId, targetId]
        .sort()
        .join("_");

    // 交換済み確認
    const pairRef =
      doc(db, "pairs", pairKey);

    const pairSnap =
      await getDoc(pairRef);

    if (pairSnap.exists()) {
      return "already";
    }

    // 相手存在確認
    const targetRef =
      doc(db, "users", targetId);

    const targetSnap =
      await getDoc(targetRef);

    if (!targetSnap.exists()) {
      return "notfound";
    }

    // 履歴ID（毎回ユニーク）
    const historyId =
      `${pairKey}_${Date.now()}`;

    // 履歴保存
    await setDoc(
      doc(db, "history", historyId),
      {
        users: [myId, targetId],
        pairKey,
        createdAt: Date.now(),
      }
    );

    // ペア保存
    await setDoc(
      pairRef,
      {
        users: [myId, targetId],
        createdAt: Date.now(),
      }
    );

    return "success";
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">

      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Scan
        </h1>

        {/* PROFILE */}
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl mb-6">

          <div className="flex flex-col items-center">

            <img
              src={
                myProfile?.icon ||
                "https://placehold.jp/150x150.png"
              }
              alt="icon"
              className="w-24 h-24 rounded-full border-4 border-cyan-400 mb-4 object-cover"
            />

            <div className="text-2xl font-bold mb-2">
              {myProfile?.name}
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

        {/* QR */}
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