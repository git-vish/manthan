import Link from "next/link";
import { GithubIcon } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Footer component for the ManthanAI application.
 * Displays copyright information and a link to the GitHub repository.
 *
 * @return {JSX.Element} The rendered Footer component
 */
export default function Footer(): JSX.Element {
  return (
    <footer className="w-full bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm md:justify-right">
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
    </footer>
  );
}
