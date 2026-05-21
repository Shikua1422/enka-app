"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function HistoryPage() {

  const [histories, setHistories] =
    useState<any[]>([]);

  const [myId, setMyId] = useState("");

  useEffect(() => {

    const savedUserId =
      localStorage.getItem("userId");

    if (!savedUserId) return;

    setMyId(savedUserId);

    // 自分を含む履歴のみ取得
    const q = query(
      collection(db, "history"),
      where("users", "array-contains", savedUserId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(q, async (snapshot) => {

        const list: any[] = [];

        for (const item of snapshot.docs) {

          const data = item.data();

          // 相手ID取得
          const partnerId =
            data.users.find(
              (id: string) =>
                id !== savedUserId
            );

          if (!partnerId) continue;

          // 相手プロフィール取得
          const partnerSnap =
            await getDoc(
              doc(db, "users", partnerId)
            );

          if (!partnerSnap.exists()) {
            continue;
          }

          list.push({
            id: item.id,
            createdAt: data.createdAt,
            partnerId,
            ...partnerSnap.data(),
          });
        }

        setHistories(list);
      });

    return () => unsubscribe();

  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">

      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          History
        </h1>

        <div className="space-y-4">

          {histories.length === 0 && (
            <div className="bg-zinc-900 rounded-3xl p-8 text-center text-zinc-500">
              まだ交換履歴がありません
            </div>
          )}

          {histories.map((user) => (

            <div
              key={user.id}
              className="bg-zinc-900 rounded-3xl p-5 shadow-xl"
            >

              <div className="flex items-center gap-4">

                <img
                  src={
                    user.icon ||
                    "https://placehold.jp/150x150.png"
                  }
                  alt="icon"
                  className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400"
                />

                <div className="flex-1">

                  <div className="text-xl font-bold">
                    {user.name}
                  </div>

                  <div className="text-zinc-400 whitespace-pre-wrap mt-2">
                    {user.bio}
                  </div>

                  <div className="text-xs text-zinc-600 mt-3">
                    ID: {user.partnerId}
                  </div>

                </div>

              </div>

            </div>

          ))}

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
          className="text-white"
        >
          Scan
        </Link>

        <Link
          href="/history"
          className="text-cyan-400 font-bold"
        >
          History
        </Link>

      </div>

    </div>
  );
}