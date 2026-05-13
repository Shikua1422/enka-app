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

    const unsub: any[] = [];

    saved.forEach((item: any) => {
      const ref = doc(db, "users", item.id);

      const u = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setUsers((prev) => {
            const filtered = prev.filter((x) => x.id !== item.id);
            return [{ id: item.id, ...snap.data() }, ...filtered];
          });
        }
      });

      unsub.push(u);
    });

    return () => unsub.forEach((f) => f());
  }, []);

  return (
    <div style={{ padding: 15 }}>
      <h2>交換履歴</h2>

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