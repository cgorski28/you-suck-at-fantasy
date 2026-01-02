import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  title: "YouSuckAtFantasyFootball.com - Fantasy Football Roast Report",
  description: "Find out how many points you left on the bench and how bad you really are at fantasy football. Get your ESPN Fantasy Football roast report.",
  keywords: ["fantasy football", "ESPN", "roast", "bench points", "lineup optimizer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
