"use client";

import { useState, useEffect } from "react";
import Alert from "@/components/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import IntroSection from "@/components/intro-section";
import ChatSection from "@/components/chat-section";

/**
 * Home component for the ManthanAI application.
 * Handles API initialization and renders the main interface.
 *
 * @return {JSX.Element} The rendered Home component
 */
export default function Home() {
  // State to manage initialization status
  const [isInitializing, setIsInitializing] = useState(true);

  // State to manage initialization errors
  const [initError, setInitError] = useState("");

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
      <Header />

      {/* Main content section */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Initialization Alert */}
        {isInitializing && (
          <Alert
            variant="loader"
            title="Getting Things Ready..."
            description="The system is waking up from inactivity. This might take up to a minute."
          />
        )}

        {/* Error Alert */}
        {initError && (
          <Alert
            variant="error"
            title="Oops! Something Went Wrong"
            description={initError}
          />
        )}

        {/* Main Content - Hidden While Initializing */}
        {!isInitializing && !initError && (
          <>
            {/* Introduction section */}
            <IntroSection />

            {/* Chat section */}
            <ChatSection />
          </>
        )}
      </main>

      {/* Footer section */}
      <Footer />
    </div>
  );
}
