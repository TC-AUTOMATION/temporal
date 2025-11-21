import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temporal - French Streetwear Brand",
  description: "Bienvenue dans l'univers Temporal",
  icons: {
    icon: "/temporal-logo-t.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-background text-foreground overflow-x-hidden">{children}</body>
    </html>
  );
}
