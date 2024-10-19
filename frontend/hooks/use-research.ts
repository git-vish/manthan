import { useState, useRef } from "react";
import { createParser, ParseEvent } from "eventsource-parser";
import { siteConfig } from "@/config/site";

interface ResearchMetadata {
  queries?: string[];
  runId?: string;
}

/**
 * Custom hook for handling research-related functionality.
 *
 * @returns {Object} An object containing research-related state and functions.
 */
export function useResearch() {
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [metadata, setMetadata] = useState<ResearchMetadata>({});
  const [error, setError] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Handles Server-Sent Events (SSE) based on the event type.
   *
   * @param {("progress" | "stream" | "end")} event - The type of SSE event.
   * @param {string} data - The data associated with the SSE event.
   */
  const handleSSEEvent = (
    event: "progress" | "stream" | "error" | "end",
    data: string
  ): void => {
    const jsonData = JSON.parse(data);

    switch (event) {
      case "progress":
        setProgressMessage(jsonData.content);
        break;
      case "stream":
        setReport((prevReport) => prevReport + jsonData.content);
        break;
      case "error":
        setError(jsonData.content || siteConfig.alerts.streamError);
        break;
      case "end":
        setMetadata({
          queries: jsonData.queries,
          runId: jsonData.run_id,
        });
        break;
    }
  };

  /**
   * Initiates the research process for a given topic.
   *
   * @param {string} topic - The research topic.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (topic: string): Promise<void> => {
    // Reset state for new submission
    setReport("");
    setError("");
    setMetadata({});
    setProgressMessage("Initiating research");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || siteConfig.alerts.streamError);
      }

      const SSEParser = createParser((event: ParseEvent) => {
        if (event && event.type === "event") {
          handleSSEEvent(
            event.event as "progress" | "stream" | "error" | "end",
            event.data
          );
        }
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream.");
      }

      const decoder = new TextDecoder();

      // Read the response stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Exit loop if done
        const chunk = decoder.decode(value, { stream: true });
        SSEParser.feed(chunk); // Feed chunk to SSE parser
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setError(siteConfig.alerts.abortError);
      } else {
        setError((err as Error).message || siteConfig.alerts.streamError);
      }
    } finally {
      setProgressMessage("");
      abortControllerRef.current = null;
    }
  };

  return {
    report,
    metadata,
    progressMessage,
    error,
    handleSubmit,
  };
}
