import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Onbase Derby - Tap to Win Racing",
  description: "Compete in real-time tap-to-win races. Stake ETH, race with your team, and claim proportional rewards!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
