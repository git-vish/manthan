"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  ArrowTopRightIcon,
  ExclamationTriangleIcon,
  GitHubLogoIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { Send } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Home component for the ManthanAI application.
 * Handles API initialization and renders the main interface.
 *
 * @return {JSX.Element} The rendered Home component
 */
export default function Home() {
  // State to manage the input text in the textarea
  const [input, setInput] = useState("");

  // State to manage initialization status
  const [isInitializing, setIsInitializing] = useState(true);

  // State to manage initialization errors
  const [initError, setInitError] = useState("");

  /**
   * Handles the submission of user input.
   * Logs the input to console and clears the input field.
   */
  const handleSubmit = () => {
    console.log("User input:", input);
    setInput("");
    // TODO: Integrate API call to /stream endpoint
  };

  /**
   * Handles key press events in the textarea.
   * Submits on Enter (without Shift) and allows new lines with Shift+Enter.
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /**
   * Checks the health of the backend API with a timeout.
   * Sets the initialization state based on the response.
   */
  const checkHealth = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2 * 60 * 1000); // 2 minutes timeout

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/health`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        setIsInitializing(false);
        setInitError("");
      } else {
        throw new Error("Health check failed");
      }
    } catch (error) {
      setIsInitializing(false);
      if (error instanceof Error && error.name === "AbortError") {
        setInitError("Connection timed out. Please try again in a bit.");
      } else {
        setInitError("Failed to connect. Please try again in a bit.");
      }
      console.error("Health check error:", error);
    }
  };

  // Effect to check API health on component mount
  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header section */}
      <header className="w-full border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex-1" />
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                className="flex items-center space-x-2 text-2xl font-bold hover:cursor-pointer focus:outline-none"
                aria-label="ManthanAI Information"
              >
                <span>ManthanAI</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">About ManthanAI</h4>
                <p className="text-sm">
                  ManthanAI is your intelligent research assistant. Ask
                  questions, analyze data, and explore topics with the power of
                  AI.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
          <nav className="flex-1 flex justify-end items-center">
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content section */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Initialization Alert */}
        {isInitializing && (
          <div className="w-full max-w-2xl mb-8">
            <Alert className="flex items-center space-x-4">
              <UpdateIcon className="h-6 w-6 text-blue-500 animate-spin" />
              <div>
                <AlertTitle>Getting Things Ready...</AlertTitle>
                <AlertDescription>
                  The system is waking up from inactivity. This might take up to
                  a minute.
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        {/* Error Alert */}
        {initError && (
          <div className="w-full max-w-2xl mb-8">
            <Alert
              variant="destructive"
              className="flex items-center space-x-4"
            >
              <ExclamationTriangleIcon className="h-6 w-6" />
              <div>
                <AlertTitle>Oops! Something Went Wrong</AlertTitle>
                <AlertDescription>{initError}</AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        {/* Main Content - Hidden While Initializing */}
        {!isInitializing && !initError && (
          <>
            {/* Introduction section */}
            <section id="intro" className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                What would you like to research?
              </h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
                Ask questions, analyze data, explore topics, and more.
              </p>
            </section>

            {/* Chat input section */}
            <section id="chat-input" className="w-full max-w-2xl mb-8">
              <div className="relative">
                <Textarea
                  placeholder="Ask ManthanAI a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent min-h-24"
                  aria-label="Research question input"
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2"
                  onClick={handleSubmit}
                  disabled={input.trim().length === 0}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </section>

            {/* Suggested topics section */}
            <section id="suggestions" className="w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-3">Suggested Topics</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "Langchain vs LlamaIndex",
                  "Summarize",
                  "Who is Leonen M",
                ].map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                  >
                    {topic} <ArrowTopRightIcon className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer section */}
      <footer className="w-full bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://vishwajeet.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
            >
              Vishwajeet Ghatage
            </Link>
          </p>
          <Link
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-muted-foreground"
          >
            <GitHubLogoIcon className="h-5 w-5 mr-1" />
            <span className="sr-only sm:not-sr-only">GitHub</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
