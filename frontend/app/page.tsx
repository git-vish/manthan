"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Alert from "@/components/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";

/**
 * Home component for the ManthanAI application.
 * Handles API initialization and renders the main interface.
 *
 * @return {JSX.Element} The rendered Home component
 */
export default function Home() {
  // State to manage the input text in the textarea
  const [input, setInput] = useState("");

  // State to manage initialization status
  const [isInitializing, setIsInitializing] = useState(true);

  // State to manage initialization errors
  const [initError, setInitError] = useState("");

  /**
   * Handles the submission of user input.
   * Logs the input to console and clears the input field.
   */
  const handleSubmit = () => {
    console.log("User input:", input);
    setInput("");
    // TODO: Integrate API call to /stream endpoint
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

  /**
   * Checks the health of the backend API with a timeout.
   * Sets the initialization state based on the response.
   */
  const checkHealth = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2 * 60 * 1000); // 2 minutes timeout

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/health`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        setIsInitializing(false);
        setInitError("");
      } else {
        throw new Error("Health check failed");
      }
    } catch (error) {
      setIsInitializing(false);
      if (error instanceof Error && error.name === "AbortError") {
        setInitError("Connection timed out. Please try again in a bit.");
      } else {
        setInitError("Failed to connect. Please try again in a bit.");
      }
      console.error("Health check error:", error);
    }
  };

  // Effect to check API health on component mount
  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header section */}
      <Header />

      {/* Main content section */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Initialization Alert */}
        {isInitializing && (
          <Alert
            variant="loader"
            title="Getting Things Ready..."
            description="The system is waking up from inactivity. This might take up to a minute."
          />
        )}

        {/* Error Alert */}
        {initError && (
          <Alert
            variant="error"
            title="Oops! Something Went Wrong"
            description={initError}
          />
        )}

        {/* Main Content - Hidden While Initializing */}
        {!isInitializing && !initError && (
          <>
            {/* Introduction section */}
            <section id="intro" className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                What would you like to research?
              </h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
                Ask questions, analyze data, explore topics, and more.
              </p>
            </section>

            {/* Chat input section */}
            <section id="chat-input" className="w-full max-w-2xl mb-8">
              <div className="relative">
                <Textarea
                  placeholder="Ask ManthanAI a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent min-h-24"
                  aria-label="Research question input"
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2"
                  onClick={handleSubmit}
                  disabled={input.trim().length === 0}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </section>

            {/* Suggested topics section */}
            <section id="suggestions" className="w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-3">Suggested Topics</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "Langchain vs LlamaIndex",
                  "Summarize",
                  "Who is Leonen M",
                ].map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="text-muted-foreground cursor-pointer hover:bg-accent transition-colors"
                  >
                    {topic} <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </section>
          </>
        )}
        {/* <div className="w-full max-w-2xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed est enim,
          fermentum in finibus et, placerat sit amet nisi. Proin id nunc
          pharetra diam faucibus blandit. Aenean leo sapien, ullamcorper
          consequat dolor id, molestie varius quam. In suscipit purus at purus
          efficitur tincidunt. Nam sodales venenatis pulvinar. Fusce non augue
          interdum arcu volutpat venenatis. Nullam semper rhoncus nisl. Quisque
          maximus porttitor ipsum, convallis imperdiet leo. Fusce tristique,
          ligula ut aliquet suscipit, nulla nunc elementum risus, tincidunt
          rutrum nulla felis et urna. Vivamus facilisis, tortor a bibendum
          pellentesque, mauris lacus varius libero, vitae finibus lacus diam at
          metus. Sed semper est at velit laoreet rhoncus. Nullam id sapien vel
          magna euismod placerat. Fusce mattis non erat ac hendrerit. Cras non
          condimentum risus, at feugiat ligula. Suspendisse semper pretium ante.
          Suspendisse ornare porta magna. Mauris vel congue odio. Pellentesque
          purus dolor, ultrices in mauris facilisis, pharetra tempus nisl.
          Aenean elementum lobortis libero non sagittis. Aenean molestie
          convallis lacus sit amet lobortis. Integer viverra ligula quis mi
          ultrices iaculis. Maecenas quis eros semper erat luctus rhoncus ut
          eget felis. Etiam non consectetur justo. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Quisque in tortor ac metus finibus
          condimentum. Mauris semper nisi quam, nec tempus sem vehicula sed.
          Aenean rhoncus vitae justo et consectetur. Nunc id turpis massa. Duis
          quis arcu accumsan tellus egestas malesuada id consequat massa. Mauris
          non arcu ut metus egestas porta. Sed vel leo nunc. Lorem ipsum dolor
          sit amet, consectetur adipiscing elit. Sed pulvinar sit amet lectus
          vel aliquet. Vivamus vel ligula in metus placerat vestibulum nec
          aliquam lorem. Vivamus commodo luctus hendrerit. Fusce facilisis sit
          amet elit eu sagittis. Etiam aliquet eget orci sed semper. Nam non
          tellus sodales, malesuada mauris ut, blandit neque. Pellentesque
          consectetur urna turpis, sed aliquet sapien dignissim ultrices. Donec
          blandit nunc a tincidunt egestas. Maecenas interdum finibus viverra.
          Aliquam vestibulum rutrum tortor, volutpat malesuada nunc finibus ac.
          In iaculis egestas purus sit amet porttitor. In eros turpis, lobortis
          quis mollis in, cursus in leo. Quisque eget tellus pellentesque ipsum
          ornare vehicula. Donec a sapien sagittis, varius sem sit amet,
          sagittis ante. Mauris feugiat nisi sed sapien accumsan, sed malesuada
          lorem ullamcorper. Quisque ut suscipit arcu, at finibus quam. Vivamus
          blandit urna ante, et lobortis libero accumsan a. Duis ultricies massa
          quis eros malesuada, tristique aliquet urna rhoncus. Nunc neque diam,
          convallis sed nisi id, porta lacinia sapien. Nulla at lorem nec nulla
          laoreet commodo ac at ex. Morbi sit amet neque eget odio scelerisque
          egestas. Pellentesque sed posuere risus, tempor sodales magna. Quisque
          nec mattis eros. Praesent nec libero ut enim eleifend tincidunt.
        </div> */}
      </main>
      {/* Footer section */}
      {/* <footer className="w-full bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center px-4 py-4 text-sm">
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
            className="flex items-center hover:text-muted-foreground"
          >
            <GitHubLogoIcon className="h-5 w-5 mr-1" />
            <span className="sr-only sm:not-sr-only">GitHub</span>
          </Link>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
}
