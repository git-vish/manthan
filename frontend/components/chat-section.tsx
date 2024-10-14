"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRef, useState, useEffect } from "react";
import { BorderBeam } from "./ui/border-beam";
import { Send } from "lucide-react";
import ReportMarkdown from "./report-markdown";
import ProgressUpdates from "./progress-updates";
import { createParser, ParseEvent } from "eventsource-parser";
import Alert from "./alert";
import { siteConfig } from "@/config/site";
import SearchQueries from "./seach-queries";
// import TopicSuggestions from "./topic-suggestions";

export default function ChatSection(): JSX.Element {
  // State to manage the research topic input
  const [topicInput, setTopicInput] = useState<string>("");

  // State to manage progress message
  const [progressMessage, setProgressMessage] = useState<string>("");
  const isProcessing = progressMessage !== "";

  // State to manage research report
  const [report, setReport] = useState<string>("");

  // State to manage research metadata
  interface ResearchMetadata {
    queries?: string[];
    runId?: string;
  }
  const [metadata, setMetadata] = useState<ResearchMetadata>({});

  // State to manage stream errors
  const [error, setError] = useState<string>("");

  // Ref to abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Effect for auto-scrolling the page
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [report, progressMessage, error]);

  /**
   * Handles the submission of research topic.
   * Clears input, sets processing state, and initiates research.
   */
  const handleSubmit = async (): Promise<void> => {
    const topic = topicInput.trim();
    if (!topic) return; // Early return if the input is empty

    // Reset state for new submission
    setTopicInput("");
    setReport("");
    setError("");
    setMetadata({});
    setProgressMessage("Initiating research");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Initiate research by fetching from the API
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to initiate research");
      }

      const SSEParser = createParser((event: ParseEvent) => {
        if (event && event.type === "event") {
          handleSSEEvent(
            event.event as "progress" | "stream" | "end",
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
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        SSEParser.feed(chunk); // Feed the chunk to the SSE parser
      }
    } catch (err) {
      // Handle fetch errors
      if ((err as Error).name === "AbortError") {
        setError(siteConfig.alerts.abortError);
      } else {
        setError(siteConfig.alerts.streamError);
      }
    } finally {
      abortControllerRef.current = null; // Clear the abort controller reference
    }
  };

  /**
   * Handles Server-Sent Events (SSE) based on the event type.
   *
   * @param {("progress" | "stream" | "end")} event - The type of SSE event
   * @param {string} data - The data associated with the SSE event
   */
  const handleSSEEvent = (
    event: "progress" | "stream" | "end",
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
      case "end":
        setProgressMessage("");
        setMetadata(jsonData);
        break;
    }
  };

  /**
   * Handles key press events in the textarea.
   * Submits on Enter (without Shift) and allows new lines with Shift+Enter.
   *
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event
   */
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of Enter key
      handleSubmit(); // Submit the topic
    }
  };

  return (
    <div className="w-full max-w-2xl px-2 mb-4">
      {/* Input section */}
      <section id="input" className="mb-8">
        <div className="relative rounded-md">
          {!isProcessing && <BorderBeam size={120} borderWidth={2} />}
          <Textarea
            placeholder={siteConfig.topicPlaceholder}
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent min-h-24"
            aria-label="Research question input"
            disabled={isProcessing}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSubmit}
            disabled={topicInput.trim().length === 0 || isProcessing}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Suggested topics section */}
      {/* {!isProcessing && <TopicSuggestions />} */}

      {/* Stream section */}
      {/* Progress updates */}
      {progressMessage && !error && (
        <ProgressUpdates progressMessage={progressMessage} />
      )}

      {/* Search queries */}
      {metadata?.queries && !error && (
        <SearchQueries queries={metadata.queries} />
      )}

      {/* Research report */}
      {report && !error && (
        <ReportMarkdown
          content={report}
          showActions={!isProcessing && !error}
        />
      )}

      {/* Error message */}
      {error && <Alert title={error} variant="error" />}
    </div>
  );
}
