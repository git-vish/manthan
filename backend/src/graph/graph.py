from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Send

from src.graph.llms import Google, Groq
from src.graph.nodes import (
    QueryGeneratorNode,
    ReportWriterNode,
    ResearchSummaryNode,
    WebSearchNode,
)
from src.graph.states import GraphState, ResearchGraphState

# Constants
NODE_GENERATE_QUERIES: str = "generate_queries"
NODE_CONDUCT_RESEARCH: str = "conduct_research"
NODE_SEARCH_WEB: str = "search_web"
NODE_GENERATE_RESEARCH_SUMMARY: str = "generate_research_summary"
NODE_WRITE_REPORT: str = "write_report"


def _setup_research_graph() -> StateGraph:
    """Sets up the research subgraph for conducting web searches and
    generating research summaries based on search queries.

    Returns:
        StateGraph: The research subgraph.
    """
    builder = StateGraph(ResearchGraphState)

    builder.add_node(NODE_SEARCH_WEB, WebSearchNode())
    builder.add_node(NODE_GENERATE_RESEARCH_SUMMARY, ResearchSummaryNode(llm=Google))

    builder.add_edge(START, NODE_SEARCH_WEB)
    builder.add_edge(NODE_SEARCH_WEB, NODE_GENERATE_RESEARCH_SUMMARY)
    builder.add_edge(NODE_GENERATE_RESEARCH_SUMMARY, END)

    return builder


def _initiate_research(state: GraphState) -> list[Send]:
    """Initiates the research process by sending research tasks for each query.

    Args:
        state (GraphState): The current state of the graph containing the queries.

    Returns:
        list[Send]: A list of Send objects for conducting research tasks.
    """
    queries: list[str] = state["queries"]
    return [Send(NODE_CONDUCT_RESEARCH, {"query": query}) for query in queries]


def _setup_graph() -> StateGraph:
    """Sets up the main graph for generating queries, conducting research,
    and writing reports.

    Returns:
        StateGraph: The main graph.
    """
    builder = StateGraph(GraphState)

    builder.add_node(NODE_GENERATE_QUERIES, QueryGeneratorNode(llm=Groq))
    builder.add_node(NODE_CONDUCT_RESEARCH, _setup_research_graph().compile())
    builder.add_node(NODE_WRITE_REPORT, ReportWriterNode(llm=Google))

    builder.add_edge(START, NODE_GENERATE_QUERIES)
    builder.add_conditional_edges(
        NODE_GENERATE_QUERIES, _initiate_research, [NODE_CONDUCT_RESEARCH]
    )
    builder.add_edge(NODE_CONDUCT_RESEARCH, NODE_WRITE_REPORT)
    builder.add_edge(NODE_WRITE_REPORT, END)

    return builder


graph: CompiledStateGraph = _setup_graph().compile()
