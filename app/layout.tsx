import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세특메이커 | 학생 활동 기록 도우미",
  description: "학생 활동을 과목별 세특 초안으로 정리하고 저장하는 AI 기록 도우미",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

