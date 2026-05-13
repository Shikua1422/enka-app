"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

type User = {
  id: string;
  name?: string;
  bio?: string;
  iconBase64?: string;
};

export default function HistoryPage() {
  const [historyUsers, setHistoryUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("exchangeHistory") || "[]"
    );

    if (savedHistory.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    const users: User[] = [];

    savedHistory.forEach((item: any) => {
      const ref = doc(db, "users", item.id);

      // 🔥 リアルタイム監視
      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          const updatedUser: User = {
            id: item.id,
            name: data.name,
            bio: data.bio,
            iconBase64: data.iconBase64,
          };

          setHistoryUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== item.id);
            return [updatedUser, ...filtered];
          });
        }
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>交換履歴（リアルタイム）</h1>

      {historyUsers.length === 0 && (
        <p>まだ交換履歴がありません</p>
      )}

      {historyUsers.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            width: "320px",
            borderRadius: "10px",
          }}
        >
          {item.iconBase64 && (
            <img
              src={item.iconBase64}
              alt="icon"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
          )}

          <p>名前: {item.name}</p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            {item.bio}
          </div>
        </div>
      ))}
    </main>
  );
}