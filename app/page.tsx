"use client";

import { useState } from "react";
import ProfilePage from "./profile/page";
import ScanPage from "./scan/page";
import HistoryPage from "./history/page";

export default function App() {
  const [tab, setTab] = useState<"profile" | "scan" | "history">(
    "profile"
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        paddingBottom: "70px",
      }}
    >
      {/* 本体 */}
      <div>
        {tab === "profile" && <ProfilePage />}
        {tab === "scan" && <ScanPage />}
        {tab === "history" && <HistoryPage />}
      </div>

      {/* タブバー */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#fff",
          display: "flex",
          borderTop: "1px solid #ddd",
        }}
      >
        <TabButton
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          label="プロフィール"
        />

        <TabButton
          active={tab === "scan"}
          onClick={() => setTab("scan")}
          label="QR"
        />

        <TabButton
          active={tab === "history"}
          onClick={() => setTab("history")}
          label="履歴"
        />
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: "none",
        background: "none",
        fontWeight: "bold",
        color: active ? "#111827" : "#999",
        fontSize: "12px",
      }}
    >
      {label}
    </button>
  );
}