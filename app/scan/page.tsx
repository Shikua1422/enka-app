"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function ScanPage() {
  const [result, setResult] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setResult(decodedText);
      },
      (error) => {
        // 読み取り失敗時
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>QRコード読み取り</h1>

      <div id="reader" style={{ width: "300px" }} />

      <p>読み取り結果:</p>
      <p>{result}</p>
    </main>
  );
}