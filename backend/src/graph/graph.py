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
from src.graph.states import GraphState, ResearchGraphState


class Graph:
    """
    The main graph for generating queries, conducting research, and writing reports.
    """

    def __init__(self):
        self._groq = get_llm(
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

    def _build_research_graph(self) -> CompiledStateGraph:
        """Builds up the research subgraph for conducting web searches and
        generating research summaries based on search queries.

        Returns:
            CompiledStateGraph: The research subgraph.
        """
        builder = StateGraph(ResearchGraphState)

        builder.add_node(NODE_SEARCH_WEB, WebSearchNode())
        builder.add_node(
            NODE_GENERATE_RESEARCH_SUMMARY, ResearchSummaryNode(llm=self._google)
        )

        builder.add_edge(START, NODE_SEARCH_WEB)
        builder.add_edge(NODE_SEARCH_WEB, NODE_GENERATE_RESEARCH_SUMMARY)
        builder.add_edge(NODE_GENERATE_RESEARCH_SUMMARY, END)

        return builder.compile()

    @staticmethod
    def _initiate_research(state: GraphState) -> list[Send]:
        """Initiates the research process by sending research tasks for each query.

        Args:
            state (GraphState): The current state of the graph containing the queries.

        Returns:
            list[Send]: A list of Send objects for conducting research tasks.
        """
        queries: list[str] = state["queries"]
        return [Send(NODE_CONDUCT_RESEARCH, {"query": query}) for query in queries]

    def _build_graph(self) -> CompiledStateGraph:
        """Builds up the main graph for generating queries, conducting research,
        and writing reports.

        Returns:
            CompiledStateGraph: The main graph.
        """
        builder = StateGraph(GraphState)

        builder.add_node(NODE_GENERATE_QUERIES, QueryGeneratorNode(llm=self._groq))
        builder.add_node(NODE_CONDUCT_RESEARCH, self._build_research_graph())
        builder.add_node(NODE_WRITE_REPORT, ReportWriterNode(llm=self._groq_stream))

        builder.add_edge(START, NODE_GENERATE_QUERIES)
        builder.add_conditional_edges(
            NODE_GENERATE_QUERIES, self._initiate_research, [NODE_CONDUCT_RESEARCH]
        )
        builder.add_edge(NODE_CONDUCT_RESEARCH, NODE_WRITE_REPORT)
        builder.add_edge(NODE_WRITE_REPORT, END)

        return builder.compile()

    async def invoke(self, topic: str, n_queries: int) -> str:
        """Conducts research based on the given topic and return a report.

        Args:
            topic (str): The topic to conduct research on.
            n_queries (int): The number of queries to generate.

        Returns:
            str: The research report.
        """
        results = await self._graph.ainvoke(
            input={"topic": topic, "n_queries": n_queries}
        )

        return results["report"]

    async def stream(self, topic: str, n_queries: int) -> AsyncGenerator[dict, None]:
        """Streams graph events and research report as generated.

        Args:
            topic (str): The topic to conduct research on.
            n_queries (int): The number of queries to generate.

        Yields:
            dict: A dictionary containing the event and data for the stream.

        Example:
            {
                "event": "progress",
                "data": {"content": "Generating search queries"}
            }
        """
        progress_map = {
            NODE_GENERATE_QUERIES: "Generating search queries",
            NODE_SEARCH_WEB: "Searching web",
            NODE_GENERATE_RESEARCH_SUMMARY: "Analyzing web search results",
        }

        async for event in self._graph.astream_events(
            input={"topic": topic, "n_queries": n_queries}, version="v2"
        ):
            kind = event["event"]
            name = event["name"]

            match kind:
                case "on_chain_start":
                    if message := progress_map.get(name):
                        yield {"event": "progress", "data": {"content": message}}

                case "on_chat_model_stream":
                    if event["metadata"]["langgraph_node"] == NODE_WRITE_REPORT:
                        data = {"content": event["data"]["chunk"].content}
                        yield {"event": "stream", "data": data}

        yield {"event": "progress", "data": {"content": "END"}}


graph = Graph()
