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

_USER_MESSAGE = """Generate {query_count} strategic search queries for use in web-search that form an objective opinion from the topic: {topic}
Avoid redundancy between queries"""  # noqa: E501


class QueryGeneratorNode(BaseNode):
    """Node responsible for generating search queries based on a research topic."""

    def __init__(self, llm: BaseChatModel):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", _SYSTEM_MESSAGE),
                ("user", _USER_MESSAGE),
            ],
        )
        self._chain = prompt | llm.with_structured_output(SearchQueries)

    async def _arun(self, state: ResearchGraphState) -> dict[str, list[str]]:
        topic = state["topic"]
        query_count = state["query_count"]

        logger.info(
            f"[QueryGeneratorNode] Generating {query_count} "
            f"queries for topic: '{topic}'."
        )

        try:
            queries = await self._chain.ainvoke(
                {"topic": topic, "query_count": query_count}
            )
        except Exception as e:
            logger.error(f"[QueryGeneratorNode] Error during query generation: {e}")
            raise NodeError("Unable to generate queries. Please try again.") from e

        return queries.model_dump()
