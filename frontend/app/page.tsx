"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Link from "next/link";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ManthanAI</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl sm:text-5xl md:text-5xl font-bold mb-6">
          Research. Analyze. Discover.
        </h2>
        <p className="text-xl mb-8 max-w-2xl">
          ManthanAI is an advanced LLM-based autonomous agent designed to
          perform comprehensive online research on any given topic.
        </p>
        <div className="w-full max-w-md mb-8"></div>
        <div className="flex space-x-4">
          <Link href="/chat">
            <RainbowButton className="h-9 px-4 py-2">Get Started</RainbowButton>
          </Link>
          <Button variant="outline">Learn More</Button>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center">
        <p>&copy; 2024 Vishwajeet Ghatage. All rights reserved.</p>
      </footer>
    </div>
  );
}
