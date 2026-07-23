import type { Metadata } from "next";

import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  LanguageProvider,
} from "../components/LanguageProvider";

import DambaChatbot from "@/components/DambaChatbot";

export const metadata: Metadata = {
  title: {
    default: "Damba SV Freiburg",
    template: "%s | Damba SV Freiburg",
  },

  description:
    "Damba SV Freiburg : football, intégration, solidarité et engagement communautaire à Freiburg im Breisgau.",

  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          <Header />

          {children}

          <Footer />
        </LanguageProvider>
              <DambaChatbot />
      </body>
    </html>
  );
}
