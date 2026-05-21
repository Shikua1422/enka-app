"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../firebase";

import Link from "next/link";

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (!uid) return;

    const q = query(
      collection(db, "histories"),
      where("ownerUid", "==", uid)
    );

    return onSnapshot(q, (snapshot) => {
      const list: any[] = [];

      snapshot.forEach((doc) => {
        list.push(doc.data());
      });

      list.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      setItems(list);
    });
  }, []);

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            color: "white",
            marginBottom: 20,
          }}
        >
          Exchange History
        </h1>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#334155",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <img
              src={item.iconUrl}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
              }}
            />

            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                @{item.xId}
              </div>

              <div
                style={{
                  color: "#cbd5e1",
                  marginTop: 4,
                }}
              >
                {item.bio}
              </div>
            </div>
          </div>
        ))}
      </div>

      <nav style={navStyle}>
        <Link href="/profile">Profile</Link>
        <Link href="/scan">Scan</Link>
        <Link href="/history">History</Link>
      </nav>
    </main>
  );
}

const mainStyle = {
  minHeight: "100vh",
  background: "#0f172a",
  padding: 20,
};

const cardStyle = {
  background: "#1e293b",
  borderRadius: 24,
  padding: 24,
  maxWidth: 500,
  margin: "0 auto",
};

const navStyle = {
  position: "fixed" as const,
  bottom: 0,
  left: 0,
  right: 0,
  background: "#111827",
  display: "flex",
  justifyContent: "space-around",
  padding: 16,
  color: "white",
};