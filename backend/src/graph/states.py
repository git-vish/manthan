import operator
from typing import Annotated, TypedDict


class GraphState(TypedDict):
    """Represents the state for the main graph."""

    topic: str
    n_queries: int
    queries: list[str]
    research_summaries: Annotated[list[str], operator.add]
    report: str


class ResearchGraphState(TypedDict):
    """Represents the state for the research subgraph."""

    query: str
    search_docs: list[str]
    research_summaries: list[str]


# Type alias for convenience
AnyGraphState = GraphState | ResearchGraphState
