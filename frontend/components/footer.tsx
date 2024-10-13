import Link from "next/link";
import { GithubIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm md:justify-right text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <Link
            href="https://vishwajeet.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500"
          >
            Vishwajeet Ghatage
          </Link>
        </p>
        <Link
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-blue-500"
        >
          <GithubIcon className="h-5 w-5 mr-1" />
          <span className="sr-only sm:not-sr-only">GitHub</span>
        </Link>
      </div>
    </footer>
  );
}
