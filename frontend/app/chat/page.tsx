"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  ThumbsUp,
} from "lucide-react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, []); // Empty dependency array to run only once on mount

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 fixed inset-y-0 left-0 z-50 w-64 bg-background border-r`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-lg">ManthanAI</span>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {}}
            >
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
              <div>
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                  Menu
                </h2>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat History
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Projects
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Feedback
                  </Button>
                </div>
              </div>
              <div>
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                  Recent Chats
                </h2>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Research on AI Ethics
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Quantum Computing Basics
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Climate Change Data
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 bg-muted/50 mt-auto">
            <h3 className="text-sm font-medium">New Feature</h3>
            <p className="text-sm text-muted-foreground">
              You can now edit and save research summaries directly in the chat.
            </p>
          </div>
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          sidebarOpen ? "md:ml-64" : "w-full"
        }`}
      >
        <header className="flex justify-between items-center p-4 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-2">
            What would you like to research?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ask questions, analyze data, explore topics, and more.
          </p>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Textarea
                placeholder="Ask ManthanAI a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-10 min-h-[100px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent"
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={() => {}}
                disabled={input.trim().length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm">
                Analyze climate data <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Summarize research paper{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Compare historical events{" "}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
        <footer className="p-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center space-x-4">
            <Button variant="link" size="sm">
              FAQ
            </Button>
            <Button variant="link" size="sm">
              Pricing
            </Button>
            <Button variant="link" size="sm">
              Terms
            </Button>
            <Button variant="link" size="sm">
              Privacy
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
