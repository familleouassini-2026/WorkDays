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
      <body className={inter.className}>
        {children}
        <EncoderDrawer />
        <FeedbackBanner />
      </body>
    </html>
  );
}
