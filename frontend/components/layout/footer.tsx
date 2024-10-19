import Link from "next/link";
import { GithubIcon, ShieldCheckIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Footer component.
 * It displays copyright information, privacy notice and a link to the GitHub repository.
 *
 * @return {JSX.Element} The rendered Footer component.
 */
export default function Footer(): JSX.Element {
  return (
    <footer className="w-full bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm">
        {/* Copyright and author link */}
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <Link
            href={siteConfig.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500"
          >
            {siteConfig.author}
          </Link>
        </p>

        <div className="flex space-x-2 sm:space-x-4">
          {/* Privacy notice modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Link
                href="/"
                className="flex items-center hover:text-blue-500"
                aria-label="Privacy Notice"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-1" />
                <span className="sr-only sm:not-sr-only">Privacy</span>
              </Link>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Privacy Notice</DialogTitle>
                <DialogDescription className="text-foreground">
                  {siteConfig.privacyNotice}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* GitHub repository link */}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-blue-500"
            aria-label="GitHub repository"
          >
            <GithubIcon className="h-5 w-5 mr-1" />
            <span className="sr-only sm:not-sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
