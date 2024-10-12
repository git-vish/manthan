"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowTopRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { Send } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled ? "backdrop-blur-md bg-background/90" : "bg-background"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">ManthanAI</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <section id="intro" className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            What would you like to research?
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
            Ask questions, analyze data, explore topics, and more.
          </p>
        </section>

        <section id="chat-input" className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Textarea
              placeholder="Ask ManthanAI a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-lg pr-12 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-primary bg-accent"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2"
              onClick={() => {}}
              disabled={input.trim().length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section id="suggestions" className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">Suggested Topics</h2>
          <div className="flex flex-wrap gap-2">
            {["Langchain vs LlamaIndex", "Summarize", "Who is Leonen M"].map(
              (topic, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                >
                  {topic} <ArrowTopRightIcon className="ml-1 h-3 w-3" />
                </Badge>
              )
            )}
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm">
          <p>&copy; 2024 Vishwajeet Ghatage</p>
          <Link
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary transition-colors"
          >
            <GitHubLogoIcon className="h-5 w-5 mr-1" />
            <span className="sr-only sm:not-sr-only">GitHub Repository</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
