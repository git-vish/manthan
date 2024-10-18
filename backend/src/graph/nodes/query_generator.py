import logging

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from src.graph.nodes.base import BaseNode, NodeError
from src.graph.states import ResearchGraphState

logger = logging.getLogger(__name__)


class SearchQueries(BaseModel):
    """Model for structured output containing search queries."""

    queries: list[str] = Field(description="List of search queries")


_SYSTEM_MESSAGE = """You are an expert research strategist skilled in decomposing complex topics into comprehensive search queries.

Your expertise includes:
- Breaking down topics into key aspects (technical, social, historical, practical)
- Recognizing important subtopics that may be overlooked
- Formulating precise, search-engine optimized queries"""  # noqa: E501

_USER_MESSAGE = """Generate {n_queries} strategic search queries for use in web-search that form an objective opinion from the topic: {topic}
Avoid redundancy between queries"""  # noqa: E501


class QueryGeneratorNode(BaseNode):
    """Node responsible for generating search queries based on a research topic."""

    def __init__(self, llm: BaseChatModel):
        """Initializes the query generator node.

        Args:
            llm: The language model to use for query generation
        """
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", _SYSTEM_MESSAGE),
                ("user", _USER_MESSAGE),
            ],
        )
        self._chain = prompt | llm.with_structured_output(SearchQueries)

    async def _arun(self, state: ResearchGraphState) -> dict[str, list[str]]:
        topic = state["topic"]
        n_queries = state["n_queries"]

        logger.info(
            f"[QueryGeneratorNode] Generating {n_queries} queries for topic: '{topic}'."
        )

        try:
            queries = await self._chain.ainvoke(
                {"topic": topic, "n_queries": n_queries}
            )
        except Exception as e:
            logger.error(f"[QueryGeneratorNode] Error during query generation: {e}")
            raise NodeError("Unable to generate queries. Please try again.") from e

        return {"queries": queries.queries}
