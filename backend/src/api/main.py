import json
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from asgi_correlation_id import CorrelationIdMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

from src.api.schemas import HealthCheckResponse, ResearchRequest, ResearchResponse
from src.config import configure_logging, settings
from src.graph import research_graph

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # set up
    configure_logging()
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)


@app.get("/health", response_model=HealthCheckResponse)
async def health():
    """Endpoint to check the health status of the application."""
    return HealthCheckResponse(status="ok")


@app.post("/invoke", response_model=ResearchResponse)
async def invoke(request: ResearchRequest):
    """Endpoint to conduct research based on the given topic and return the report."""
    report = await research_graph.invoke(
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
    async for event in research_graph.stream(
        topic=request.topic, n_queries=request.n_queries
    ):
        yield f"event: {event["event"]}\ndata: {json.dumps(event["data"])}\n\n"


@app.post("/stream", response_class=StreamingResponse)
async def stream(request: ResearchRequest):
    """Endpoint to conduct research based on the given topic and stream the report."""
    return StreamingResponse(_handle_stream(request), media_type="text/event-stream")
