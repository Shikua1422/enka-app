"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("exchangeHistory");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>交換履歴</h1>

      {history.length === 0 && <p>まだ交換履歴がありません</p>}

      {history.map((item) => (
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