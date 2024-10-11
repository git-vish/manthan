from pydantic import BaseModel, Field

from src.config import settings


class HealthCheckResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., description="Service health status.")


class ResearchRequest(BaseModel):
    """Research request schema."""

    topic: str = Field(
        ...,
        description="Research topic.",
        examples=["Langchain vs LlamaIndex"],
    )
    n_queries: int = Field(
        default=settings.QUERY_COUNT,
        ge=2,
        le=5,
        description="Number of search queries to generate.",
    )


class ResearchResponse(BaseModel):
    """Research response schema."""

    topic: str = Field(..., description="Research topic.")
    report: str = Field(
        ...,
        description="Generated research report in markdown format.",
    )
