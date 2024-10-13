export const siteConfig = {
  name: "ManthanAI",
  author: "Vishwajeet Ghatage",
  title: "ManthanAI - Research Assistant",
  description:
    "ManthanAI is a LLM-based autonomous agent designed to perform comprehensive online research on any given topic.",
  alerts: {
    init: {
      title: "Getting Things Ready...",
      description: "Waking up from inactivity. This may take up to a minute.",
    },
    error: {
      title: "Oops! Something Went Wrong",
    },
    abortError: "Connection timed out. Please try again.",
    generalError: "Failed to connect. Please try again.",
    streamError: "Unable to process your request. Please try again.",
  },
  chatBanner: {
    header: "What topic would you like to explore?",
    subheader: "Research. Compile. Illuminate.",
  },
  hoverCard:
    'Inspired by the Sanskrit term "Manthan" (मंथन), which refers to the ancient practice of churning the ocean to extract valuable insights. ManthanAI churns through the digital ocean of data to deliver in-depth research outcomes.',
  links: {
    github: "https://github.com/git-vish/manthan",
    website: "https://vishwajeet.xyz",
  },
  topicSuggestions: ["Langchain vs LlamaIndex", "Summarize", "Who is Leonen M"],
  topicPlaceholder: "Research Topic ...",
};

export type SiteConfig = typeof siteConfig;
