import logging
from collections.abc import AsyncGenerator
from typing import Any, Literal

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Send

from src.config import settings
from src.graph.constants import (
    NODE_CONDUCT_RESEARCH,
    NODE_GENERATE_QUERIES,
    NODE_GENERATE_RESEARCH_SUMMARY,
    NODE_SAFETY_CHECK,
    NODE_SEARCH_WEB,
    NODE_WRITE_REPORT,
)
from src.graph.llms import get_llm
from src.graph.nodes import (
    QueryGeneratorNode,
    ReportWriterNode,
    ResearchSummaryNode,
    TopicSafetyCheckNode,
    WebSearchNode,
)
from src.graph.nodes.base import NodeError
from src.graph.states import ResearchGraphState, ResearchSubGraphState

logger = logging.getLogger(__name__)

_PROGRESS_MAP = {
    NODE_SAFETY_CHECK: "Performing topic safety check",
    NODE_GENERATE_QUERIES: "Generating search queries",
    NODE_SEARCH_WEB: "Searching the web",
    NODE_GENERATE_RESEARCH_SUMMARY: "Summarizing findings",
    NODE_WRITE_REPORT: "Writing report",
}


class ResearchGraph:
    """
    The graph for generating queries, conducting research, and writing reports.
    """

    def __init__(self):
        """Initializes the research graph with language models."""
        logger.info("[ResearchGraph] Initializing ResearchGraph.")
        self._groq_tool = get_llm(
            provider="groq",
            model=settings.GROQ_LLAMA_70B,
            temperature=settings.GROQ_LLAMA_70B_TEMPERATURE,
        )

        self._groq_stream = get_llm(
            provider="groq",
            model=settings.GROQ_LLAMA_70B,
            temperature=settings.GROQ_LLAMA_70B_TEMPERATURE,
            streaming=True,
        )

        self._google = get_llm(
            provider="google",
            model=settings.GOOGLE_FLASH,
            temperature=settings.GOOGLE_FLASH_TEMPERATURE,
        )

        self._graph = self._build_graph()

    def _build_research_subgraph(self) -> CompiledStateGraph:
        """Builds up the research subgraph for conducting web searches and
        generating research summaries based on search queries."""
        logger.info("[ResearchGraph] Building research subgraph.")
        builder = StateGraph(ResearchSubGraphState)

        builder.add_node(NODE_SEARCH_WEB, WebSearchNode())
        builder.add_node(
            NODE_GENERATE_RESEARCH_SUMMARY, ResearchSummaryNode(llm=self._google)
        )

        builder.add_edge(START, NODE_SEARCH_WEB)
        builder.add_edge(NODE_SEARCH_WEB, NODE_GENERATE_RESEARCH_SUMMARY)
        builder.add_edge(NODE_GENERATE_RESEARCH_SUMMARY, END)

        return builder.compile()

    @staticmethod
    def _route_safety_check(
        state: ResearchGraphState,
    ) -> Literal[NODE_GENERATE_QUERIES, END]:
        """Routes based on the topic safety check."""
        return NODE_GENERATE_QUERIES if state["is_safe"] else END

    @staticmethod
    def _initiate_research(state: ResearchGraphState) -> list[Send]:
        """Initiates the research process with generated queries."""
        queries: list[str] = state["queries"]
        logger.info(f"[ResearchGraph] Initiating research with {len(queries)} queries.")
        return [Send(NODE_CONDUCT_RESEARCH, {"query": query}) for query in queries]

    def _build_graph(self) -> CompiledStateGraph:
        """Builds the main research graph."""
        logger.info("[ResearchGraph] Building main graph.")
        builder = StateGraph(ResearchGraphState)

        builder.add_node(NODE_SAFETY_CHECK, TopicSafetyCheckNode(llm=self._groq_tool))
        builder.add_node(NODE_GENERATE_QUERIES, QueryGeneratorNode(llm=self._groq_tool))
        builder.add_node(NODE_CONDUCT_RESEARCH, self._build_research_subgraph())
        builder.add_node(NODE_WRITE_REPORT, ReportWriterNode(llm=self._groq_stream))

        builder.add_edge(START, NODE_SAFETY_CHECK)
        builder.add_conditional_edges(
            NODE_SAFETY_CHECK, self._route_safety_check, [NODE_GENERATE_QUERIES, END]
        )
        builder.add_conditional_edges(
            NODE_GENERATE_QUERIES, self._initiate_research, [NODE_CONDUCT_RESEARCH]
        )
        builder.add_edge(NODE_CONDUCT_RESEARCH, NODE_WRITE_REPORT)
        builder.add_edge(NODE_WRITE_REPORT, END)

        return builder.compile()

    @staticmethod
    def _handle_event(event: dict[str, Any]) -> dict[str, Any] | None:
        """Handles chain start, graph end, and stream events."""
        kind = event["event"]
        name = event["name"]

        match kind:
            # progress updates
            case "on_chain_start":
                if message := _PROGRESS_MAP.get(name):
                    return {"event": "progress", "data": {"content": message}}

            # end of graph
            case "on_chain_end":
                # Subgraph also streams LangGraph chain end events,
                # to filter them out, we check if the metadata is empty
                if name != "LangGraph" or event["metadata"]:
                    return

                output = event["data"]["output"]

                # Safety error
                if not output["is_safe"]:
                    logger.info(
                        f"[ResearchGraph] '{output['topic']}' is unsafe: "
                        f"{output['violated_category']}"
                    )
                    return {
                        "event": "error",
                        "data": {
                            "content": f"Topic is flagged as unsafe: "
                            f"{output['violated_category']}"
                        },
                    }

                # End event
                logger.info(
                    f"[ResearchGraph] Research completed for topic: "
                    f"'{output['topic']}'."
                )
                return {
                    "event": "end",
                    "data": {
                        "queries": output["queries"],
                        "run_id": event["run_id"],
                    },
                }

            # report stream
            case "on_chat_model_stream":
                if event["metadata"]["langgraph_node"] == NODE_WRITE_REPORT:
                    return {
                        "event": "stream",
                        "data": {"content": event["data"]["chunk"].content},
                    }

    async def astream(self, topic: str, query_count: int) -> AsyncGenerator[dict, None]:
        """Asynchronously streams research progress and the final report.

        Args:
            topic (str): The topic to conduct research on.
            query_count (int): The number of queries to generate.

        Yields:
            dict: A dictionary containing the event and data for the stream.
        """
        logger.info(
            f"[ResearchGraph] Starting research for topic:"
            f" '{topic}' with {query_count} queries."
        )
        try:
            async for event in self._graph.astream_events(
                input={"topic": topic, "query_count": query_count}, version="v2"
            ):
                if e := self._handle_event(event):
                    yield e
        except Exception as e:
            logger.error(f"[ResearchGraph] Error during research streaming: {str(e)}")

            yield {
                "event": "error",
                "data": {
                    "content": str(e)
                    if isinstance(e, NodeError)
                    else "Unable to complete research. Please try again."
                },
            }
