import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Damba SV Freiburg",
    template: "%s | Damba SV Freiburg",
  },
  description:
    "Damba SV Freiburg, club de football, d’intégration et de solidarité à Freiburg im Breisgau.",
  keywords: [
    "Damba SV Freiburg",
    "football Freiburg",
    "club de football Freiburg",
    "football loisirs Freiburg",
    "intégration Freiburg",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Header />

        <main className="site-main">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
