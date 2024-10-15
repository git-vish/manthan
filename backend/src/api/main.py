import json
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from asgi_correlation_id import CorrelationIdMiddleware
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langsmith import AsyncClient as LangsmithClient
from starlette.responses import StreamingResponse

from src.api.auth import get_api_key
from src.api.middlewares import RateLimitMiddleware
from src.api.schemas import (
    FeedbackRequest,
    FeedbackResponse,
    HealthCheckResponse,
    ResearchRequest,
    ResearchResponse,
)
from src.config import configure_logging, settings
from src.graph import ResearchGraph

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # set up
    configure_logging()
    app.state.research_graph = ResearchGraph()
    app.state.langsmith = LangsmithClient()
    yield
    # clean up


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    RateLimitMiddleware,
    paths=settings.rate_limit_paths,
    delta=settings.APP_RATE_LIMIT_DELTA,
    limit=settings.APP_RATE_LIMIT,
)


@app.get("/health", response_model=HealthCheckResponse)
async def health():
    """Endpoint to check the health status of the application."""
    return HealthCheckResponse(status="ok")


@app.post("/invoke", response_model=ResearchResponse, include_in_schema=False)
async def invoke(
    request: ResearchRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to conduct research based on the given topic and return the report."""
    research_graph: ResearchGraph = app.state.research_graph
    report = await research_graph.ainvoke(
        topic=request.topic, n_queries=request.n_queries
    )
    return ResearchResponse(topic=request.topic, report=report)


async def _handle_stream(request: ResearchRequest) -> AsyncGenerator[str, None]:
    """Handles streaming events from the research graph.

    Args:
        request (ResearchRequest): The research request.

    Yields:
        str: Server-Sent Events formatted string.
    """
    research_graph: ResearchGraph = app.state.research_graph
    async for event in research_graph.astream(
        topic=request.topic, n_queries=request.n_queries
    ):
        yield f"event: {event["event"]}\ndata: {json.dumps(event["data"])}\n\n"


@app.post("/stream", response_class=StreamingResponse)
async def stream(
    request: ResearchRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to conduct research based on the given topic and stream the report."""
    return StreamingResponse(_handle_stream(request), media_type="text/event-stream")


@app.post("/feedback", response_model=FeedbackResponse)
async def feedback(
    request: FeedbackRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to provide feedback on the research report."""
    langsmith: LangsmithClient = app.state.langsmith
    feedback = await langsmith.create_feedback(
        key=settings.LANGCHAIN_FEEDBACK_KEY, **request.model_dump()
    )
    return FeedbackResponse(feedback_id=feedback.id, **request.model_dump())
