import type { Metadata } from "next";

import "@styles/globals.css";

import Providers from "@/providers";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "EventRadar | Découvrez et créez des événements",
  description:
    "EventRadar : plateforme de gestion, découverte et création d’événements. Trouvez, filtrez, partagez ou proposez vos événements en ligne ou sur place. Interface moderne, validation robuste, scraping automatique.",
  keywords: [
    "événement",
    "événement bénin",
    "event",
    "agenda",
    "sortie",
    "culture",
    "conférence",
    "concert",
    "atelier",
    "bénin",
    "afrique",
    "création d'événement",
    "scraping",
    "découverte",
    "EventRadar",
  ],
  authors: [{ name: "Géry GUEDEGBE", url: "https://www.geryguedegbe.com/" }],
  creator: "Géry GUEDEGBE",
  openGraph: {
    title: "EventRadar | Découvrez et créez des événements",
    description:
      "Trouvez, filtrez, partagez ou proposez vos événements en ligne ou sur place avec EventRadar.",
    url: "https://eventradar.example.com/",
    siteName: "EventRadar",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <ThemeProvider>
        <body className="mediumDesktop:w-[90vw] bg-light-background dark:bg-dark-background ultraDesktop:w-[70vw] ultraLargDesktop:w-[60vw] mx-auto flex min-h-screen w-full max-w-[1600px] flex-col overflow-x-hidden">
          <Providers>
            <Navbar />
            <main className="z-10 px-4 pt-18 sm:px-6 lg:px-8 lg:pt-24">
              {children}
            </main>
          </Providers>

          <Analytics />
        </body>
      </ThemeProvider>
    </html>
  );
}
