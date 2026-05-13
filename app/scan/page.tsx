"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ScanPage() {
  const [result, setResult] = useState("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function startScanner() {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: 250,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          setResult(decodedText);

          const docRef = doc(db, "users", decodedText);

          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        },
        () => {}
      );
    }

    startScanner();
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>QRコード読み取り</h1>

      <div id="reader" style={{ width: "300px" }} />

      <p>読み取り結果:</p>
      <p>{result}</p>

      {userData && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "20px",
            width: "320px",
            borderRadius: "10px",
          }}
        >
          <h2>相手プロフィール</h2>

          {userData.iconBase64 && (
            <img
              src={userData.iconBase64}
              alt="icon"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
          )}

          <p>名前: {userData.name}</p>

          <p>プロフィール:</p>

          <div
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            {userData.bio}
          </div>
        </div>
      )}
    </main>
  );
}