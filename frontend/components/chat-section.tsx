"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRef, useState } from "react";
import { BorderBeam } from "./ui/border-beam";
import { Send } from "lucide-react";
import ReportMarkdown from "./report-markdown";
import ProgressUpdates from "./progress-updates";
import { createParser, ParseEvent } from "eventsource-parser";
import Alert from "./alert";
// import TopicSuggestions from "./topic-suggestions";

export default function ChatSection() {
  // State to manage the research topic input
  const [topicInput, setTopicInput] = useState<string>("");

  // State to manage processing status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // State to mange progress message
  const [progressMessage, setProgressMessage] = useState<string>("");

  // State to manage research report
  const [report, setReport] = useState<string>("");

  // State to manage stream errors
  const [error, setError] = useState<string>("");

  // Ref to abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Handles the submission of research topic.
   * Logs the topic to console and clears the field.
   */
  const handleSubmit = async (): Promise<void> => {
    const topic = topicInput.trim();
    if (!topic) return;

    // Clear the input field
    setTopicInput("");

    // Set the processing state
    setIsProcessing(true);

    // Flush the research report in case it exists
    setReport("");

    // Flush the error in case it exists
    setError("");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Initiate research
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate research");
      }

      const SSEParser = createParser((event: ParseEvent) => {
        if (event) {
          if (event.type === "event") {
            handleSSEEvent(
              event.event as "progress" | "stream" | "end",
              event.data
            );
          }
        }
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream.");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        SSEParser.feed(chunk);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setError("Connection timed out. Please try again in a bit.");
      } else {
        setError("Error. Please try again in a bit.");
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleSSEEvent = (
    event: "progress" | "stream" | "end",
    data: string
  ) => {
    const json_data = JSON.parse(data);
    const content = json_data.content;

    switch (event) {
      case "progress":
        setProgressMessage(content);
        break;
      case "stream":
        setProgressMessage("");
        setReport((prevReport) => prevReport + content);
        break;
      case "end":
        break;
    }
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

  return (
    <div className="w-full max-w-2xl px-2 mb-8">
      {/* Input section */}
      <section id="input" className="mb-8">
        <div className="relative rounded-md">
          {!isProcessing && <BorderBeam size={120} borderWidth={2} />}
          <Textarea
            placeholder="Ask ManthanAI a question..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent min-h-24"
            aria-label="Research question input"
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
