"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebase";

export default function HistoryPage() {
  const [histories, setHistories] = useState<any[]>([]);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    const myId =
      localStorage.getItem("userId");

    if (!myId) return;

    const q = query(
      collection(db, "history"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, async (snapshot) => {
      const list: any[] = [];

      for (const item of snapshot.docs) {
        const data = item.data();

        if (!data.users.includes(myId)) continue;

        const targetId = data.users.find(
          (id: string) => id !== myId
        );

        const targetSnap = await getDoc(
          doc(db, "users", targetId)
        );

        if (!targetSnap.exists()) continue;

        list.push({
          id: item.id,
          ...targetSnap.data(),
        });
      }

      setHistories(list);
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          History
        </h1>

        <div className="space-y-4">

          {histories.map((user) => (
            <div
              key={user.id}
              className="bg-zinc-900 rounded-3xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-4">

                {user.icon && (
                  <img
                    src={user.icon}
                    alt="icon"
                    className="w-16 h-16 rounded-full border-2 border-cyan-400"
                  />
                )}

                <div>

                  <div className="text-xl font-bold">
                    {user.name}
                  </div>

                  <div className="text-zinc-400 text-sm whitespace-pre-wrap">
                    {user.bio}
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

        <Link href="/profile" className="text-white">
          Profile
        </Link>

        <Link href="/scan" className="text-white">
          Scan
        </Link>

        <Link href="/history" className="text-cyan-400 font-bold">
          History
        </Link>

      </div>
    </div>
  );
}