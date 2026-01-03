import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  title: "YouSuckAtFantasyFootball.com - Fantasy Football Roast Report",
  description: "Find out how many points you left on the bench and how bad you really are at fantasy football. Get your ESPN Fantasy Football roast report.",
  keywords: ["fantasy football", "ESPN", "roast", "bench points", "lineup optimizer"],
  metadataBase: new URL('https://yousuckatfantasyfootball.com'),
  openGraph: {
    title: "YouSuckAtFantasyFootball.com",
    description: "Welcome to Rock Bottom. Find out how many points you left on the bench and how bad you really are at fantasy football.",
    siteName: "YouSuckAtFantasyFootball.com",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouSuckAtFantasyFootball.com",
    description: "Welcome to Rock Bottom. Find out how many points you left on the bench and how bad you really are at fantasy football.",
    images: ['https://yousuckatfantasyfootball.com/twitter-image?v=2'],
  },
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
