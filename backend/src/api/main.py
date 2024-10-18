import json
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from asgi_correlation_id import CorrelationIdMiddleware
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exception_handlers import http_exception_handler
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
    """Lifespan context manager to set up and clean up resources."""
    logger.info("[lifespan] Setting up application resources.")
    configure_logging()
    app.state.research_graph = ResearchGraph()
    app.state.langsmith = LangsmithClient()
    yield
    logger.info("[lifespan] Cleaning up application resources.")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    RateLimitMiddleware,
    paths=settings.rate_limit_paths,
    delta=settings.APP_RATE_LIMIT_DELTA,
    limit=settings.APP_RATE_LIMIT,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
print(app.middleware)


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):
    """Handle HTTP exceptions.
    Called when an HTTPException is raised.
    It logs the exception and returns the HTTP exception.

    Args:
        request (Request): The request.
        exc (HTTPException): The HTTP exception.

    Returns:
        HTTPException: The HTTP exception.
    """
    logger.error(f"HTTPException: {exc.status_code}, {exc.detail}")
    return await http_exception_handler(request, exc)


@app.get("/health", response_model=HealthCheckResponse)
async def health():
    """Endpoint to check the health status of the application."""
    logger.info("[/health] Health check request received.")
    return HealthCheckResponse(status="ok")


@app.post("/invoke", response_model=ResearchResponse, include_in_schema=False)
async def invoke(
    request: ResearchRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to conduct research based on the given topic and return the report."""
    logger.info(
        f"[/invoke] Research request received for topic: '{request.topic}' "
        f"with {request.n_queries} queries."
    )
    research_graph: ResearchGraph = app.state.research_graph
    try:
        report = await research_graph.ainvoke(
            topic=request.topic, n_queries=request.n_queries
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to complete research. Please try again",
        ) from e

    logger.info(f"[/invoke] Research completed for topic: '{request.topic}'.")
    return ResearchResponse(topic=request.topic, report=report)


async def _handle_stream(request: ResearchRequest) -> AsyncGenerator[str, None]:
    """Handles streaming events from the research graph.

    Args:
        request (ResearchRequest): The research request.

    Yields:
        str: Server-Sent Events formatted string.
    """
    logger.info(
        f"[_handle_stream] Streaming research events for topic: " f"'{request.topic}'."
    )
    research_graph: ResearchGraph = app.state.research_graph
    async for event in research_graph.astream(
        topic=request.topic, n_queries=request.n_queries
    ):
        yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"


@app.post("/stream", response_class=StreamingResponse)
async def stream(
    request: ResearchRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to conduct research based on the given topic and stream the report."""
    logger.info(f"[/stream] Streaming research for topic: '{request.topic}'.")
    return StreamingResponse(_handle_stream(request), media_type="text/event-stream")


@app.post("/feedback", response_model=FeedbackResponse)
async def feedback(
    request: FeedbackRequest, api_key: Annotated[str, Depends(get_api_key)]
):
    """Endpoint to provide feedback on the research report."""
    logger.info(
        f"[/feedback] Feedback request received for run ID: " f"'{request.run_id}'."
    )
    langsmith: LangsmithClient = app.state.langsmith

    try:
        feedback = await langsmith.create_feedback(
            key=settings.LANGCHAIN_FEEDBACK_KEY, **request.model_dump()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to submit feedback. Please try again",
        ) from e
    logger.info(f"[/feedback] Feedback submitted with ID: '{feedback.id}'.")
    return FeedbackResponse(feedback_id=feedback.id, **request.model_dump())
