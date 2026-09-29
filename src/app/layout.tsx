import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI 短剧导演 · 第一部短剧从这里开始",
  description: "面向新手的八步短剧制作工作台",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
