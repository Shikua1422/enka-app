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

  const [showQR, setShowQR] =
    useState(false);

  const scannerRef =
    useRef<Html5QrcodeScanner | null>(null);

  const processingRef = useRef(false);

  useEffect(() => {

    const init = async () => {

      let savedUserId =
        localStorage.getItem("userId");

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
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
          aspectRatio: 1,
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

          if (result === "success") {

            await scanner.clear();

            setTimeout(() => {
              router.push("/history");
            }, 300);

            return;
          }

          if (result === "already") {
            alert(
              "このユーザーとは交換済みです"
            );
          }

          if (result === "self") {
            alert(
              "自分自身は交換できません"
            );
          }

        } catch (e) {
          console.error(e);
        }

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

    if (myId === targetId) {
      return "self";
    }

    const pairKey =
      [myId, targetId]
        .sort()
        .join("_");

    const pairRef =
      doc(db, "pairs", pairKey);

    const pairSnap =
      await getDoc(pairRef);

    if (pairSnap.exists()) {
      return "already";
    }

    const targetRef =
      doc(db, "users", targetId);

    const targetSnap =
      await getDoc(targetRef);

    if (!targetSnap.exists()) {
      return "notfound";
    }

    const historyId =
      `${pairKey}_${Date.now()}`;

    await setDoc(
      doc(db, "history", historyId),
      {
        users: [myId, targetId],
        pairKey,
        createdAt: Date.now(),
      }
    );

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

            {/* QR BUTTON */}
            <button
              onClick={() =>
                setShowQR(true)
              }
              className="bg-cyan-400 text-black font-bold px-6 py-4 rounded-2xl text-lg active:scale-95 transition"
            >
              QRコードを表示
            </button>

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

      {/* QR MODAL */}
      {showQR && (

        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">

          <div className="bg-white p-8 rounded-3xl">

            <QRCodeCanvas
              value={userId}
              size={320}
              level="H"
              includeMargin={true}
            />

          </div>

          <div className="text-white text-center mt-6 text-lg font-bold">
            相手にQRを読み取ってもらってください
          </div>

          <button
            onClick={() =>
              setShowQR(false)
            }
            className="mt-8 bg-white text-black px-6 py-3 rounded-2xl font-bold"
          >
            閉じる
          </button>

        </div>

      )}

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