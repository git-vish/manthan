import logging

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate

from src.graph.nodes.base import BaseNode, NodeError
from src.graph.states import ResearchSubGraphState

logger = logging.getLogger(__name__)

_SYSTEM_MESSAGE = """You are an expert research analyst specializing in synthesizing information from search results into clear, structured reports. 
Your role is to analyze search documents thoroughly and create concise, informative reports that capture key insights.

Your strengths include:
- Extracting relevant information from multiple sources
- Synthesizing complex technical content into clear explanations
- Structuring information logically and consistently
- Properly attributing information to sources

Each source document is provided in format:
<Document href="[source URL]">
[document content]
</Document>

Use the href URLs when citing sources in your report."""  # noqa: E501

_USER_MESSAGE = """Generate a comprehensive search report based on the provided query and search documents.

Structure your report as follows:

## Query Analysis
Analyze: {query}

## Key Findings
Create a concise summary (300-400 words) that:
- Synthesizes main insights from the search results
- Highlights significant patterns or contradictions
- References sources using [n] notation, linking to the document URLs
- Focuses on novel or surprising discoveries

## Sources
List all referenced sources with:
- Full URLs from the Document href attributes
- No duplicate entries
- One source per line


Format the entire report in markdown with appropriate headers and spacing.

Search documents to analyze:
{search_docs}"""  # noqa: E501


class ResearchSummaryNode(BaseNode):
    """
    Node responsible for generating a research summary based on query and search docs.
    """

    def __init__(self, llm: BaseChatModel):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", _SYSTEM_MESSAGE),
                ("user", _USER_MESSAGE),
            ],
        )
        self._chain = prompt | llm

    async def _arun(self, state: ResearchSubGraphState) -> dict[str, list[str]]:
        query = state["query"]
        search_docs = "\n-----\n".join(state["search_docs"])

        logger.info(
            f"[ResearchSummaryNode] Generating research summary for query: "
            f"'{query}' with {len(state['search_docs'])} documents."
        )

        try:
            research_summary = await self._chain.ainvoke(
                {"query": query, "search_docs": search_docs}
            )
        except Exception as e:
            logger.error(
                f"[ResearchSummaryNode] Error during research summary generation: {e}"
            )
            raise NodeError("Unable to summarize findings. Please try again") from e

        return {"summaries": [research_summary.content]}
