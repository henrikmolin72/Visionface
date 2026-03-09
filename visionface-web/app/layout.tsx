import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Sora } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VisionFace — Estetisk Ansiktsanalys",
  description: "Demokratiserar tillgången till expertutlåtanden inom estetiska ingrepp. AI-driven ansiktsanalys direkt i din webbläsare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${manrope.variable} ${sora.variable} ${cormorantGaramond.variable}`}>
      <body className="antialiased selection:bg-[#E3F2FD]">
        <svg
          className="vf-noise-svg-defs"
          aria-hidden="true"
          width="0"
          height="0"
          style={{ position: "absolute" }}
        >
          <filter id="vf-noise-filter" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="2"
              seed="7"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.045 0"
            />
          </filter>
        </svg>
        <div className="vf-noise-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
