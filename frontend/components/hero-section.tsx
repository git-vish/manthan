import { siteConfig } from "@/config/site";

/**
 * HeroSection component for the ManthanAI application.
 * Displays the main heading and description in a centered layout.
 *
 * @return {JSX.Element} The rendered HeroSection component
 */
export default function HeroSection(): JSX.Element {
  return (
    <section
      id="hero"
      className="flex-grow container mx-auto mb-8 px-4 py-12 flex flex-col items-center justify-center text-center"
    >
      <h1 className="text-4xl sm:text-5xl font-bold mb-6">
        {siteConfig.chatBanner.subheader}
      </h1>
      <p className="text-xl max-w-2xl">{siteConfig.description}</p>
    </section>
  );
}
