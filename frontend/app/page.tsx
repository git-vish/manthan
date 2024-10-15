"use client";

import { useState, useEffect } from "react";
import AlertWrapper from "@/components/common/alert-wrapper";
import { Header, Footer } from "@/components/layout";
import { Chat } from "@/components/chat";
import { siteConfig } from "@/config/site";

/**
 * Home component for the ManthanAI application.
 * Handles API initialization and renders the main interface.
 *
 * @returns {JSX.Element} The rendered Home component
 */
export default function Home(): JSX.Element {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [initError, setInitError] = useState<string>("");

  useEffect(() => {
    checkHealth();
  }, []);

  /**
   * Checks the health of the backend API with a timeout.
   * Sets the initialization state based on the response.
   */
  const checkHealth = async (): Promise<void> => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 2 * 60 * 1000); // 2 minutes timeout

    try {
      const response = await fetch("/api/health", {
        method: "GET",
        signal: abortController.signal,
      });

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
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {(isInitializing || initError) && (
          <section
            id="hero"
            className="flex-grow container mx-auto mb-8 px-4 py-12 flex flex-col items-center justify-center text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {siteConfig.chatBanner.subheader}
            </h1>

            <p className="text-xl max-w-2xl">{siteConfig.description}</p>
          </section>
        )}

        {isInitializing && (
          <AlertWrapper
            variant="loader"
            title={siteConfig.alerts.init.title}
            description={siteConfig.alerts.init.description}
          />
        )}

        {initError && (
          <AlertWrapper
            variant="error"
            title={siteConfig.alerts.error.title}
            description={initError}
          />
        )}

        {!isInitializing && !initError && <Chat />}
      </main>

      <Footer />
    </div>
  );
}
