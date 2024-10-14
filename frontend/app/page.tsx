"use client";

import { useState, useEffect } from "react";
import Alert from "@/components/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatBanner from "@/components/chat-banner";
import ChatSection from "@/components/chat-section";
import HeroSection from "@/components/hero-section";
import { siteConfig } from "@/config/site";

/**
 * Home component for the ManthanAI application.
 * Handles API initialization and renders the main interface.
 *
 * @return {JSX.Element} The rendered Home component
 */
export default function Home(): JSX.Element {
  // State to manage initialization status
  const [isInitializing, setIsInitializing] = useState(true);

  // State to manage initialization errors
  const [initError, setInitError] = useState<string>("");

  /**
   * Checks the health of the backend API with a timeout.
   * Sets the initialization state based on the response.
   */
  const checkHealth = async (): Promise<void> => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 2 * 60 * 1000); // 2 minutes timeout

    try {
      const response = await fetch("/api/health-check", {
        method: "GET",
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setIsInitializing(false);
        setInitError("");
      } else {
        throw new Error("Health check failed");
      }
    } catch (error) {
      setIsInitializing(false);
      setInitError(
        error instanceof Error && error.name === "AbortError"
          ? siteConfig.alerts.abortError
          : siteConfig.alerts.generalError
      );
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
        {/* Hero section */}
        {(isInitializing || initError) && <HeroSection />}

        {/* Initialization Alert */}
        {isInitializing && (
          <Alert
            variant="loader"
            title={siteConfig.alerts.init.title}
            description={siteConfig.alerts.init.description}
          />
        )}

        {/* Error Alert */}
        {initError && (
          <Alert
            variant="error"
            title={siteConfig.alerts.error.title}
            description={initError}
          />
        )}

        {/* Main Content - Hidden While Initializing */}
        {!isInitializing && !initError && (
          <>
            {/* Chat banner section */}
            <ChatBanner />

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
