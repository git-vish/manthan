import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/config/site";

/**
 * Header component for the ManthanAI application.
 * Displays the site name and a hover card with information.
 *
 * @return {JSX.Element} The rendered Header component
 */
export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex-1" />
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              className="flex items-center space-x-2 text-2xl font-bold font-mono hover:cursor-pointer focus:outline-none"
              aria-label="ManthanAI Information"
            >
              <span>{siteConfig.name}</span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 border border-border p-4 rounded-md bg-background">
            <div className="space-y-2">
              <p className="text-sm italic">{siteConfig.hoverCard}</p>
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
