import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeSage — AI Code Reviewer & Bug Explainer",
  description:
    "Paste your code, get instant AI-powered bug detection, complexity analysis, and an optimized version — explained line-by-line. Built for students and developers.",
  keywords: [
    "AI code review",
    "bug explainer",
    "code analyzer",
    "LLM",
    "Groq",
    "Llama",
    "complexity analysis",
    "Big-O",
  ],
  authors: [{ name: "CodeSage" }],
  openGraph: {
    title: "CodeSage — AI Code Reviewer",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <div className="bg-aurora" aria-hidden />
        {children}
      </body>
    </html>
  );
}
