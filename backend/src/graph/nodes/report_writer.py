import logging

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from src.graph.nodes.base import BaseNode
from src.graph.states import ResearchGraphState

logger = logging.getLogger(__name__)

_SYSTEM_MESSAGE = """You are an expert writer synthesizing comprehensive research reports.

Your expertise includes:
- Creating engaging, well-structured research report 
- Synthesizing multiple research memos into cohesive narratives
- Writing in academic style following APA format
- Maintaining factual accuracy with proper source attribution

You will receive a collection of research memos on subtopics/search queries about: {topic}

Each memo:
- Contains analysis of a specific subtopic/search query
- Includes findings from a specific subtopic/search query
- Includes source citations in [n] format
- Follows markdown formatting
- Enclosed in <MEMO [n]></MEMO [n]>"""  # noqa: E501

_USER_MESSAGE = """Write a detailed research report following these guidelines:

Structure:
1. Title (# header, max 50 characters)
   - Create an engaging, descriptive title reflecting the topic

2. Introduction (## header, ~100 words)
   - Present the topic's context and significance
   - Preview key findings and report structure
   - Capture reader interest

3. <Main Body>
   - Synthesize insights from all research memos
   - Minimum 1,200 words, utilizing all relevant information
   - Include specific facts, figures, and data points
   - Maintain logical flow between sections
   - Use proper citations [n] when referencing sources
   - Focus on concrete findings, avoid generic conclusions
   - Organize content by themes/patterns across memos

4. Conclusion (## header, ~100 words)
   - Summarize and Highlight key insights
   - End with impactful closing thoughts

5. Sources (## header)
   - List all unique sources in order of citation using [n] notation
   - Extract the domain from each URL:
        - Remove https:// and www. from the beginning
        - Keep only the main domain and top-level domain (e.g., google.com)
   - Format each source as: [n] [EXTRACTED_DOMAIN](FULL_URL)
   - List only one source per line
   - Remove any duplicate sources

    Correct format examples:
        ## Sources
        [1] [google.com](https://www.google.com)
        [2] [wikipedia.org](https://en.wikipedia.org/wiki/Example)
        [3] [github.com](https://github.com/example/repo)

    Incorrect formats (do not use):
        [1] Google https://www.google.com/
        [1] https://www.google.com/
        [1] [www.google.com](https://www.google.com)

Formatting:
- Follow APA style guidelines
- Use proper markdown throughout
- UNDERLINES (e.g., "----", "====") BELOW HEADERS OR SUBHEADERS ARE NOT PERMITTED
- Create clear section transitions
- Use appropriate subsection headers (###) as needed

Research memos to analyze:
{research}

RETURN ONLY THE COMPLETE REPORT WITH NO ADDITIONAL COMMENTARY."""  # noqa: E501


class ReportWriterNode(BaseNode):
    """Node responsible for generating complete research reports."""

    def __init__(self, llm: BaseChatModel):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", _SYSTEM_MESSAGE),
                ("user", _USER_MESSAGE),
            ],
        )
        self._chain = prompt | llm

    async def _arun(self, state: ResearchGraphState) -> dict[str, str]:
        topic = state["topic"]
        research_summaries = state["research_summaries"]

        research = "\n-----\n".join(
            [
                f"<MEMO [{idx}]>\n{memo}\n</MEMO [{idx}]>"
                for idx, memo in enumerate(research_summaries)
            ]
        )
        logger.info(
            f"[ReportWriterNode] Generating report for topic: '{topic}' with "
            f"{len(research_summaries)} summaries."
        )

        report = await self._chain.ainvoke({"topic": topic, "research": research})

        return {"report": report.content}
