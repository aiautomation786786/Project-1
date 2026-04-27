import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollProgress } from "@/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codian — AI Code Reviewer & Bug Explainer",
  description:
    "Paste your code and get instant AI-powered bug detection, complexity analysis, and an optimized version — explained line-by-line.",
  keywords: [
    "AI code review",
    "bug explainer",
    "code analyzer",
    "complexity analysis",
    "Big-O",
    "static analysis",
  ],
  authors: [{ name: "Codian" }],
  openGraph: {
    title: "Codian — AI Code Reviewer",
    description:
      "Instant AI-powered code review, bug explanations and optimization suggestions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider>
          <ScrollProgress />
          <div className="bg-aurora" aria-hidden>
            <div className="bg-aurora-orb" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
