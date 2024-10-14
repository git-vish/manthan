import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface SearchQueriesProps {
  queries: string[];
}

export default function SearchQueries({ queries }: SearchQueriesProps) {
  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline text-md">
          Search Queries
        </AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc ml-5">
            {queries.map((query, index) => (
              <li key={index} className="text-md">
                {query}
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
