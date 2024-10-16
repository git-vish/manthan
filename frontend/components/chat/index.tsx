"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BorderBeam } from "@/components/ui/border-beam";
import AlertWrapper from "@/components/common/alert-wrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import { CopyIcon, SendIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { useResearch } from "@/hooks/use-research";
import { useFeedback } from "@/hooks/use-feedback";

import { siteConfig } from "@/config/site";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

const MAX_LENGTH = 100;

/**
 * Chat component for handling user input and displaying research results
 * @returns {JSX.Element} The rendered Chat component
 */
export function Chat(): JSX.Element {
  const [topicInput, setTopicInput] = useState<string>("");
  const { toast } = useToast();
  const {
    report,
    metadata,
    progressMessage,
    error,
    handleSubmit: submitResearch,
  } = useResearch();
  const { feedback, setFeedback, handleFeedback } = useFeedback(metadata.runId);

  const isProcessing = progressMessage !== "";

  const handleSubmit = (): void => {
    const topic = topicInput.trim();
    if (!topic) return;
    setTopicInput("");
    setFeedback("");
    submitResearch(topic);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (): void => {
    navigator.clipboard
      .writeText(report)
      .then(() => toast({ description: "Report copied to clipboard!" }))
      .catch(() =>
        toast({
          description: "Failed to copy the report.",
          variant: "destructive",
        })
      );
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = event.target.value;
    if (value.length <= MAX_LENGTH) {
      setTopicInput(value);
    }
  };

  // Effect for auto-scrolling the page
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [report, progressMessage, error]);

  return (
    <>
      <div className="w-full max-w-2xl px-2 mb-4">
        {/* Chat banner */}
        <section id="banner" className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {siteConfig.chatBanner.header}
          </h1>
          <p className="text-md sm:text-lg max-w-2xl mx-auto text-muted-foreground">
            {siteConfig.chatBanner.subheader}
          </p>
        </section>

        {/* Input */}
        <section id="input" className="mb-4">
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
              className="text-md pr-12 resize-none focus-visible:ring-0 bg-stone-50 dark:bg-zinc-900 min-h-24"
              aria-label="Research question input"
              disabled={isProcessing}
            />
            {!isProcessing && topicInput.trim() !== "" && (
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={handleSubmit}
                aria-label="Send message"
                variant="outline"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p className="text-red-500">
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

        {/* Progress updates */}
        {progressMessage && !error && (
          <section id="progress" className="mb-6">
            <AlertWrapper description={progressMessage} variant="progress" />
          </section>
        )}

        {/* Search queries */}
        {metadata?.queries && !error && (
          <Accordion type="single" collapsible className="w-full mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:no-underline text-md">
                Search Queries
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc ml-5">
                  {metadata.queries.map((query, index) => (
                    <li key={index} className="text-md">
                      {query}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Report */}
        {report && !error && (
          <section id="report" className="break-words mb-6">
            <Markdown
              className="prose max-w-none dark:prose-invert"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                [
                  rehypeExternalLinks,
                  {
                    target: "_blank",
                    rel: ["nofollow", "noopener", "noreferrer"],
                  },
                ],
              ]}
            >
              {report}
            </Markdown>
          </section>
        )}

        {/* Actions */}
        {report && !isProcessing && !error && (
          <section id="actions">
            <TooltipProvider>
              <div className="flex space-x-1">
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

        {error && <AlertWrapper title={error} variant="error" />}
      </div>
    </>
  );
}
