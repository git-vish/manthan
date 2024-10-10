from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    """Request model for the research API."""

    topic: str = Field(
        description="The topic for the research.",
        examples=["Langchain vs LlamaIndex"],
    )


class ResearchResponse(ResearchRequest):
    """Response model for the research API."""

    report: str = Field(
        description="The report containing the research results in markdown.",
        examples=["# This is the report for your research query."],
    )
