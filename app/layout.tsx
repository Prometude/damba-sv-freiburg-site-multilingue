import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SmartMembershipModal from "../components/SmartMembershipModal";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "Damba SV Freiburg",
  description: "Football, intégration et solidarité à Freiburg."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          <Header />
          <main>{children}</main>
          <Footer /><SmartMembershipModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
