import logging

from langchain_community.tools import TavilySearchResults

from src.config import settings
from src.graph.nodes.base import BaseNode, NodeError
from src.graph.states import ResearchSubGraphState

logger = logging.getLogger(__name__)


class WebSearchNode(BaseNode):
    """Node responsible for performing a web search using TAVILY."""

    def __init__(self):
        self._search = TavilySearchResults(
            search_depth=settings.TAVILY_SEARCH_DEPTH,
            exclude_domains=settings.TAVILY_EXCLUDE_DOMAINS,
        )

    async def _arun(self, state: ResearchSubGraphState) -> dict[str, list[str]]:
        query = state["query"]

        logger.info(f"[WebSearchNode] Performing web search for query: '{query}'.")

        try:
            search_results = await self._search.ainvoke(input=query)
            search_docs = [
                f'<Document href="{result["url"]}"/>\n{result["content"]}\n</Document>'
                for result in search_results
            ]
        except Exception as e:
            logger.error(f"[WebSearchNode] Error during web search: {e}")
            raise NodeError("Unable to perform web search. Please try again.") from e

        return {"search_docs": search_docs}
