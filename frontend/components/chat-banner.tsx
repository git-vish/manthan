import { siteConfig } from "@/config/site";

/**
 * ChatBanner component displays the header and subheader for the chat section.
 *
 * @return {JSX.Element} The rendered ChatBanner component
 */
export default function ChatBanner(): JSX.Element {
  return (
    <section id="intro" className="mb-8 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        {siteConfig.chatBanner.header}
      </h1>
      <p className="text-md sm:text-lg max-w-2xl mx-auto text-muted-foreground">
        {siteConfig.chatBanner.subheader}
      </p>
    </section>
  );
}
