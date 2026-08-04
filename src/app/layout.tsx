import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackBanner from "@/components/feedback-banner";
import EncoderDrawer from "@/components/encoder-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkDays - Gestion RH",
  description: "Application de gestion des ressources humaines pour entreprises belges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body className={inter.className}>
        {children}
        <EncoderDrawer />
        <FeedbackBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
