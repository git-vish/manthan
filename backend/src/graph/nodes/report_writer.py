from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from src.graph.nodes.base import BaseNode
from src.graph.states import ResearchGraphState

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
1. Title (# header, max 60 characters)
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
   - Format: [n] Source details
   - One source per line
   - Deduplicate any repeated sources

Formatting:
- Use proper markdown throughout
- Follow APA style guidelines
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

        report = await self._chain.ainvoke({"topic": topic, "research": research})

        return {"report": report.content}
