import logging
from collections.abc import AsyncGenerator

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Send

from src.config import settings
from src.graph.constants import (
    NODE_CONDUCT_RESEARCH,
    NODE_GENERATE_QUERIES,
    NODE_GENERATE_RESEARCH_SUMMARY,
    NODE_SEARCH_WEB,
    NODE_WRITE_REPORT,
)
from src.graph.llms import get_llm
from src.graph.nodes import (
    QueryGeneratorNode,
    ReportWriterNode,
    ResearchSummaryNode,
    WebSearchNode,
)
from src.graph.nodes.base import NodeError
from src.graph.states import ResearchGraphState, ResearchSubGraphState

logger = logging.getLogger(__name__)


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
        generating research summaries based on search queries.

        Returns:
            CompiledStateGraph: The research subgraph.
        """
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
    def _initiate_research(state: ResearchGraphState) -> list[Send]:
        """Initiates the research process by sending research tasks for each query.

        Args:
            state (ResearchGraphState): The current state of the graph.

        Returns:
            list[Send]: A list of Send objects for conducting research tasks.
        """
        queries: list[str] = state["queries"]
        logger.info(f"[ResearchGraph] Initiating research with {len(queries)} queries.")
        return [Send(NODE_CONDUCT_RESEARCH, {"query": query}) for query in queries]

    def _build_graph(self) -> CompiledStateGraph:
        """Builds up the main graph for generating queries, conducting research,
        and writing reports.

        Returns:
            CompiledStateGraph: The main graph.
        """
        logger.info("[ResearchGraph] Building main graph.")
        builder = StateGraph(ResearchGraphState)

        builder.add_node(NODE_GENERATE_QUERIES, QueryGeneratorNode(llm=self._groq_tool))
        builder.add_node(NODE_CONDUCT_RESEARCH, self._build_research_subgraph())
        builder.add_node(NODE_WRITE_REPORT, ReportWriterNode(llm=self._groq_stream))

        builder.add_edge(START, NODE_GENERATE_QUERIES)
        builder.add_conditional_edges(
            NODE_GENERATE_QUERIES, self._initiate_research, [NODE_CONDUCT_RESEARCH]
        )
        builder.add_edge(NODE_CONDUCT_RESEARCH, NODE_WRITE_REPORT)
        builder.add_edge(NODE_WRITE_REPORT, END)

        return builder.compile()

    async def ainvoke(self, topic: str, n_queries: int) -> str:
        """Asynchronously conducts research on the given topic and returns a report.

        Args:
            topic (str): The topic to conduct research on.
            n_queries (int): The number of queries to generate.

        Returns:
            str: The research report.
        """
        logger.info(
            f"[ResearchGraph] Invoking research for topic: "
            f"'{topic}' with {n_queries} queries."
        )
        results = await self._graph.ainvoke(
            input={"topic": topic, "n_queries": n_queries}
        )
        logger.info("[ResearchGraph] Research completed.")
        return results["report"]

    async def astream(self, topic: str, n_queries: int) -> AsyncGenerator[dict, None]:
        """Asynchronously streams research progress and the final report.

        Args:
            topic (str): The topic to conduct research on.
            n_queries (int): The number of queries to generate.

        Yields:
            dict: A dictionary containing the event and data for the stream.
        """
        logger.info(
            f"[ResearchGraph] Streaming research progress for topic: "
            f"'{topic}' with {n_queries} queries."
        )
        progress_map = {
            NODE_GENERATE_QUERIES: "Generating search queries",
            NODE_SEARCH_WEB: "Searching the web",
            NODE_GENERATE_RESEARCH_SUMMARY: "Summarizing findings",
            NODE_WRITE_REPORT: "Writing report",
        }

        is_streaming_report = False

        try:
            async for event in self._graph.astream_events(
                input={"topic": topic, "n_queries": n_queries}, version="v2"
            ):
                kind = event["event"]
                name = event["name"]

                match kind:
                    case "on_chain_start":
                        if message := progress_map.get(name):
                            data = {"content": message}
                            yield {"event": "progress", "data": data}

                    case "on_chat_model_stream":
                        if event["metadata"]["langgraph_node"] == NODE_WRITE_REPORT:
                            data = {"content": event["data"]["chunk"].content}
                            yield {"event": "stream", "data": data}
                            if not is_streaming_report:
                                is_streaming_report = True
                                logger.info("[ResearchGraph] Report streaming started.")

                    case "on_chain_end":
                        # Subgraph also streams LangGraph chain end events,
                        # to filter them out, we check if the metadata is empty
                        if name == "LangGraph" and not event["metadata"]:
                            logger.info("[ResearchGraph] Report streaming completed.")
                            data = {
                                "queries": event["data"]["output"]["queries"],
                                "runId": event["run_id"],
                            }
                            yield {"event": "end", "data": data}
                            logger.info(
                                f"[ResearchGraph] Research completed with runId: "
                                f"{data['runId']}'."
                            )
        except Exception as e:
            logger.error(f"[ResearchGraph] Error during research streaming: {str(e)}")
            data = {
                "content": str(e)
                if isinstance(e, NodeError)
                else "Unable to complete research. Please try again."
            }
            yield {"event": "error", "data": data}
