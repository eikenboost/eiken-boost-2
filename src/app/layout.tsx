import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Eiken Boost 2",
  description: "英検2級に、15分で近づく。単語・長文・英作文・面接を毎日続ける学習アプリ。",
  applicationName: "Eiken Boost 2",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={noto.variable}>
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
