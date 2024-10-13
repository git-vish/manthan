import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { ThemeToggle } from "./theme-toggle";
import { BotIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex-1" />
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="flex items-center space-x-2 text-2xl font-bold hover:cursor-pointer focus:outline-none"
              aria-label="ManthanAI Information"
            >
              <BotIcon className="h-6 w-6" />
              <span>ManthanAI</span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 border border-border p-4 rounded-md bg-background">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About ManthanAI</h4>
              <p className="text-sm">
                ManthanAI is your intelligent research assistant. Ask questions,
                analyze data, and explore topics with the power of AI.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <nav className="flex-1 flex justify-end items-center">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
