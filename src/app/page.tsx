import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CodeReviewer } from "@/components/CodeReviewer";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Header />
      <Hero />
      <CodeReviewer />
      <HowItWorks />
      <Footer />
    </main>
  );
}
