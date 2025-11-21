import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temporal - Streetwear",
  description: "Bienvenue dans l'univers Temporal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
