"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function HistoryPage() {
  const [historyUsers, setHistoryUsers] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const savedHistory = JSON.parse(
        localStorage.getItem("exchangeHistory") || "[]"
      );

      const users = [];

      for (const item of savedHistory) {
        const docRef = doc(db, "users", item.id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          users.push({
            id: item.id,
            ...docSnap.data(),
          });
        }
      }

      setHistoryUsers(users);
    }

    loadHistory();
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>交換履歴</h1>

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