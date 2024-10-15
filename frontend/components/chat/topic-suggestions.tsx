import { ArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

/**
 * TopicSuggestions component displays a list of suggested topics.
 *
 * @return {JSX.Element} The rendered TopicSuggestions component.
 */
export default function TopicSuggestions(): JSX.Element {
  return (
    <section id="suggestions">
      <h2 className="text-xl font-semibold mb-3">Suggested Topics</h2>
      <div className="flex flex-wrap gap-2">
        {siteConfig.topicSuggestions.map((topic) => (
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
  );
}
