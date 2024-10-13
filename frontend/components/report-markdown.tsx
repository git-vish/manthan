import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  CopyIcon,
  FileDownIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RefreshCwIcon,
} from "lucide-react";

interface ReportMarkdownProps {
  content: string;
}

export default function ReportMarkdown({ content }: ReportMarkdownProps) {
  const actions = [
    { label: "Copy", icon: CopyIcon },
    { label: "Download PDF", icon: FileDownIcon },
    { label: "Upvote", icon: ThumbsUpIcon },
    { label: "Downvote", icon: ThumbsDownIcon },
    { label: "Retry", icon: RefreshCwIcon },
  ];
  return (
    <section id="report" className="break-words">
      {/* Markdown Section */}
      <Markdown
        className="prose prose-sm max-w-none dark:prose-invert prose-headings:dark:text-gray-100 prose-p:dark:text-gray-300 prose-a:dark:text-blue-400 prose-strong:dark:text-gray-200 prose-code:dark:text-gray-200 prose-ul:dark:text-gray-300 prose-ol:dark:text-gray-300 prose-li:marker:dark:text-gray-500"
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </Markdown>

      {/* Actions Section */}
      <TooltipProvider>
        <div className="mt-4 flex space-x-1">
          {actions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
}
