"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRef, useState, useEffect, ChangeEvent } from "react";
import { BorderBeam } from "./ui/border-beam";
import { CopyIcon, SendIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import ReportMarkdown from "./report-markdown";
import ProgressUpdates from "./progress-updates";
import { createParser, ParseEvent } from "eventsource-parser";
import Alert from "./alert";
import { siteConfig } from "@/config/site";
import SearchQueries from "./seach-queries";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

// import TopicSuggestions from "./topic-suggestions";

export default function ChatSection(): JSX.Element {
  // State to store the research topic input
  const [topicInput, setTopicInput] = useState<string>("");

  // State to store progress message
  const [progressMessage, setProgressMessage] = useState<string>("");
  const isProcessing = progressMessage !== "";

  // State to store research report
  const [report, setReport] = useState<string>("");

  // State to store research metadata
  interface ResearchMetadata {
    queries?: string[];
    runId?: string;
  }
  const [metadata, setMetadata] = useState<ResearchMetadata>({});

  // State to store feedback
  const [feedback, setFeedback] = useState<string>("");

  // State to store stream errors
  const [error, setError] = useState<string>("");

  // Ref to abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const { toast } = useToast();

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
    setFeedback("");
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
      setProgressMessage("");
      abortControllerRef.current = null;
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

  const handleCopy = (): void => {
    // toast({ description: "Copying report to clipboard" });
    navigator.clipboard
      .writeText(report)
      .then(() => {
        toast({
          description: "Report copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy report:", err);
        toast({
          description: "Failed to copy the report.",
          variant: "destructive",
        });
      });
  };

  const handleFeedback = async (
    userFeedback: "upvoted" | "downvoted"
  ): Promise<void> => {
    if (feedback !== "") return;

    setFeedback(userFeedback);
    toast({
      description: "Thanks for your feedback!",
    });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ run_id: metadata.runId, value: userFeedback }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setFeedback("");
      toast({
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  //   const MIN_LENGTH = 10;
  const MAX_LENGTH = 100;

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const value = event.target.value;
    if (value.length <= MAX_LENGTH) {
      setTopicInput(value);
    }
  }

  return (
    <div className="w-full max-w-2xl px-2 mb-4">
      {/* Input section */}
      <section id="input" className="mb-8">
        <div className="relative rounded-md mb-2">
          {!isProcessing && (
            <BorderBeam
              size={120}
              borderWidth={2}
              colorFrom="#3B82F6"
              colorTo="#14B8A6"
            />
          )}
          <Textarea
            placeholder={siteConfig.topicPlaceholder}
            value={topicInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-stone-50 dark:bg-zinc-900 min-h-24"
            aria-label="Research question input"
            disabled={isProcessing}
          />
          {!isProcessing && topicInput.trim() !== "" && (
            <Button
              size="icon"
              className="absolute right-2 bottom-2"
              onClick={handleSubmit}
              aria-label="Send message"
              variant="secondary"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {/* topicInput.length < MIN_LENGTH
              ? `Please enter at least ${MIN_LENGTH} characters.` */}
            {topicInput.length === MAX_LENGTH ? `Max length reached.` : null}
          </p>
          <div className="hidden sm:block">
            Use{" "}
            <Badge variant="secondary" className="text-xs px-1 py-0.5">
              Shift
            </Badge>
            +
            <Badge variant="secondary" className="text-xs px-1 py-0.5">
              Enter
            </Badge>{" "}
            for a new line
          </div>
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
      {report && !error && <ReportMarkdown content={report} />}

      {/* Actions */}
      {report && !isProcessing && !error && (
        <section id="actions">
          <TooltipProvider>
            <div className="flex space-x-1">
              {/* Copy report */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Copy report to clipboard"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                  >
                    <CopyIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy report</p>
                </TooltipContent>
              </Tooltip>

              {/* Upvote */}
              {feedback !== "downvoted" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Upvote"
                      className={
                        feedback === "upvoted"
                          ? "text-blue-500 hover:text-blue-500"
                          : "text-muted-foreground hover:text-foreground"
                      }
                      onClick={() => handleFeedback("upvoted")}
                    >
                      <ThumbsUpIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upvote</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Downvote */}
              {feedback !== "upvoted" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Downvote"
                      className={
                        feedback === "downvoted"
                          ? "text-red-500 hover:text-red-500"
                          : "text-muted-foreground hover:text-foreground"
                      }
                      onClick={() => handleFeedback("downvoted")}
                    >
                      <ThumbsDownIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Downvote</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </section>
      )}

      {/* Error message */}
      {error && <Alert title={error} variant="error" />}
    </div>
  );
}
