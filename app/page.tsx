import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>エンカ交換アプリ</h1>

      <Link href="/profile">
        <button
          style={{
            padding: "15px",
            width: "250px",
            cursor: "pointer",
          }}
        >
          プロフィール作成・編集
        </button>
      </Link>

      <Link href="/scan">
        <button
          style={{
            padding: "15px",
            width: "250px",
            cursor: "pointer",
          }}
        >
          QRコード読み取り
        </button>
      </Link>

      <Link href="/history">
        <button
          style={{
            padding: "15px",
            width: "250px",
            cursor: "pointer",
          }}
        >
          交換履歴
        </button>
      </Link>
    </main>
  );
}