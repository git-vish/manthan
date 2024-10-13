"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { BorderBeam } from "./ui/border-beam";
// import TopicSuggestions from "./topic-suggestions";
import { Send } from "lucide-react";
import ReportMarkdown from "./report-markdown";
import ProgressUpdates from "./progress-updates";

const content = `# Unveiling the Wisdom of Sri M: A Spiritual Journey of Self-Discovery and Social Reform

**Abstract:** This report examines the life and work of Sri M, a prominent Indian spiritual leader.  Drawing on various sources, including his autobiographies, published works, and information about his foundation, the report explores his teachings, his commitment to social reform, and the impact of his work on individuals and society.  It also touches upon the wider context of his recognition through awards like the Padma Awards.

**Introduction:** Sri M is a significant figure in contemporary Indian spirituality.  His teachings and actions demonstrate a profound commitment to fostering spiritual growth and social development.  This report synthesizes information from multiple sources to provide a comprehensive overview of his life, work, and legacy.

**Early Life and Spiritual Journey:** Sri M's early life, as detailed in his autobiographies [1, 3], reveals a journey marked by profound experiences.  A pivotal encounter with his guru at a young age [1] ignited a lifelong quest for self-realization.  This journey, detailed in works like "Apprenticed to a Himalayan Master" [2], underscores the importance of discipline and dedication in the path to spiritual understanding.  The accounts highlight the transformative nature of his experiences and the influence of his guru on his development.  This formative period laid the foundation for his later teachings and actions.

**Teachings and Philosophy:** Sri M's teachings transcend religious boundaries, emphasizing the inherent goodness within each individual [2].  His philosophy centers on self-realization and the journey towards spiritual enlightenment [2].  This emphasis is consistent across his various writings, including works on meditation ("On Meditation: Finding Infinite Bliss and Power Within" [1]), the Upanishads ("Wisdom of the Rishis" [1], "The Upanishads" [1]), and broader aspects of Hinduism ("Jewel in the Lotus" [1]).  He also emphasizes that yoga is accessible to all seekers, regardless of religious affiliation ("Yoga Also for the Godless" [1]).  His exploration of the concept of the void in "Shunya" [1] further deepens the understanding of his philosophical approach.  The core message consistently highlights the importance of self-discovery and the transcendence of dogma.  His work on the Upanishads offers contemporary interpretations and insights into these ancient texts, emphasizing their enduring relevance.  His writings draw on personal anecdotes and stories to illustrate these concepts, making them relatable and accessible to a wide audience.

**Social Impact and Initiatives:** Sri M's commitment to social reform is evident in the work of the Satsang Foundation [3].  The Foundation's multifaceted initiatives, including educational institutions, a hospital, and a yoga research center [3], reflect a practical application of his spiritual principles.  The "Walk of Hope" [1], a 7,500-kilometer pilgrimage across India [1], further exemplifies his dedication to interfaith harmony and the restoration of spiritual values.  These initiatives demonstrate a practical approach to spiritual growth, extending beyond individual transformation to encompass wider societal impact.  The website of the Satsang Foundation [3] provides further details on the Foundation's programs and initiatives, offering insight into the scale and scope of Sri M's work.

**Recognition and Awards:**  Sri M's contributions have been recognized through various accolades.  While this report does not specifically detail the nature of these recognitions, it is noteworthy that the Government of India has recognized outstanding contributions in various fields through the Padma Awards [4].  The 2024 Padma Awards, for example, showcased a diverse range of achievements, including those in art, social work, public affairs, and scientific advancements [4].  While the report does not detail Sri M's specific recognition, it underscores the wider context of his work and the acknowledgment of his contributions.

**Conclusion:** Sri M's life and work represent a profound commitment to spiritual growth and social reform.  His teachings, which transcend religious boundaries, emphasize the inherent goodness within each individual and the importance of self-discovery.  The Satsang Foundation's initiatives, along with his personal journey and published works, demonstrate a practical application of spiritual principles to address societal needs.  The recognition he has received underscores his significant impact on individuals and society.  Further research into specific recognitions and the detailed impact of his work would provide a deeper understanding of his legacy.

## Sources

- [1] https://satsang-foundation.org/books-by-sri-m/
- [2] https://books.google.com/books/about/Apprenticed_to_a_Himalayan_Master.html?id=vrB7EAAAQBAJ
- [3] https://satsang-foundation.org/the-founder-sri-m/
- [4] https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1999790
`;

export default function ChatSection() {
  // State to manage the research topic
  const [topic, setTopic] = useState("");

  /**
   * Handles the submission of research topic.
   * Logs the topic to console and clears the field.
   */
  const handleSubmit = () => {
    console.log("Research topic:", topic);
    setTopic("");
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

  return (
    <div className="w-full max-w-2xl px-2 mb-8">
      {/* Chat input section */}
      <section id="chat-input" className="mb-8">
        <div className="relative rounded-md">
          <BorderBeam size={120} borderWidth={2} />
          <Textarea
            placeholder="Ask ManthanAI a question..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-md pr-12 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-accent min-h-24"
            aria-label="Research question input"
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSubmit}
            disabled={topic.trim().length === 0}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Suggested topics section */}
      {/* <TopicSuggestions /> */}

      {/* Stream section */}
      {/* Progress updates */}
      <ProgressUpdates progressMessage="Generating report" />

      {/* Research report */}
      <ReportMarkdown content={content} />
    </div>
  );
}
