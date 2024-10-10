import logging
from contextlib import asynccontextmanager

from asgi_correlation_id import CorrelationIdMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import ResearchRequest, ResearchResponse
from src.config import configure_logging, settings
from src.graph import research_graph

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    app.state.graph = research_graph
    yield


app = FastAPI(
    title=settings.APP_TITLE, description=settings.APP_DESCRIPTION, lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/invoke", response_model=ResearchResponse)
async def invoke(user_input: ResearchRequest):
    """Conduct research based on the given topic and return a report."""
    state = {"topic": user_input.topic, "n_queries": 3}
    graph = app.state.graph

    results = await graph.ainvoke(state)

    return ResearchResponse(topic=user_input.topic, report=results["report"])
