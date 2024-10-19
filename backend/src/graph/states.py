import operator
from typing import Annotated, TypedDict


class ResearchGraphState(TypedDict):
    """Represents the state for the research graph."""

    topic: str  # Research topic
    is_safe: bool  # Whether the topic is safe
    violated_category: str  # Category violated by the topic, if any
    query_count: int  # Number of queries to generate
    queries: list[str]  # List of search queries
    summaries: Annotated[list[str], operator.add]  # Research summaries
    report: str  # Final research report


class ResearchSubGraphState(TypedDict):
    """Represents the state for the research subgraph."""

    query: str  # Search query
    search_docs: list[str]  # Search results
    summaries: list[str]  # Research summaries


# Type alias for convenience
AnyGraphState = ResearchGraphState | ResearchSubGraphState
