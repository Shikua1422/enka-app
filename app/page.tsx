"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export default function LoginPage() {
  const router = useRouter();

  const [xId, setXId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (uid) {
      router.push("/profile");
    }
  }, []);

  const login = async () => {
    if (!xId || !password) {
      alert("入力してください");
      return;
    }

    const uid = xId.toLowerCase();

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        xId,
        password,
        bio: "",
        iconUrl: `https://unavatar.io/x/${xId}`,
        createdAt: Date.now(),
      });
    } else {
      const data = snap.data();

      if (data.password !== password) {
        alert("パスワードが違います");
        return;
      }
    }

    localStorage.setItem("uid", uid);

    router.push("/profile");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#1e293b",
          padding: 24,
          borderRadius: 20,
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          ENKA
        </h1>

        <input
          placeholder="X ID"
          value={xId}
          onChange={(e) => setXId(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={login}
          style={buttonStyle}
        >
          ログイン / 新規登録
        </button>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  marginBottom: 12,
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "bold",
  fontSize: 16,
};