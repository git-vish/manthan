import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportMarkdownProps {
  content: string;
}

/**
 * ReportMarkdown component displays the research report in Markdown format.
 *
 * @param {ReportMarkdownProps} props - The component props
 * @return {JSX.Element} The rendered ReportMarkdown component
 */
export default function ReportMarkdown({
  content,
}: ReportMarkdownProps): JSX.Element {
  return (
    <section id="report" className="break-words mb-6">
      <Markdown
        className="prose max-w-none dark:prose-invert prose-a:no-underline prose-a:hover:text-blue-500"
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </Markdown>
    </section>
  );
}
