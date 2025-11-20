import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'AI Newsletter for Company Bulletin',
  description: '게시판 요약 & 맞춤형 정보 제공',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

