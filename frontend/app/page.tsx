import { Header, Footer } from "@/components/layout";
import { Chat } from "@/components/chat";

/**
 * Home component for the ManthanAI application.
 *
 * @returns {JSX.Element} The rendered Home component
 */
export default function Home(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center mb-4">
        <Chat />
      </main>

      <Footer />
    </div>
  );
}
