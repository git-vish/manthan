import { siteConfig } from "@/config/site";

/**
 * ChatBanner component displays the header and subheader for the chat section.
 *
 * @return {JSX.Element} The rendered ChatBanner component
 */
export default function ChatBanner(): JSX.Element {
  return (
    <section id="intro" className="mb-8 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        {siteConfig.chatBanner.header}
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
        {siteConfig.chatBanner.subheader}
      </p>
    </section>
  );
}
