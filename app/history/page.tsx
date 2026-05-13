"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function HistoryPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("exchangeHistory") || "[]"
    );

    const unsubList: any[] = [];

    saved.forEach((item: any) => {
      const ref = doc(db, "users", item.id);

      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== item.id);

            return [
              { id: item.id, ...data },
              ...filtered,
            ];
          });
        }
      });

      unsubList.push(unsub);
    });

    return () => unsubList.forEach((u) => u());
  }, []);

  return (
    <div style={{ padding: 15 }}>
      <h2>交換履歴（リアルタイム）</h2>

      {users.map((u) => (
        <div key={u.id} style={card}>
          {u.iconBase64 && (
            <img
              src={u.iconBase64}
              style={{ width: 60, borderRadius: "50%" }}
            />
          )}

          <p>{u.name}</p>
          <p>{u.bio}</p>
        </div>
      ))}
    </div>
  );
}

const card = {
  marginBottom: 10,
  padding: 15,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
};