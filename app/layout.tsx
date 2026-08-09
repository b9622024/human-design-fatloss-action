import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人類圖減脂行動測驗",
  description: "Human Design × 減脂行為分析開發版本",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
