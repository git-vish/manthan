from typing import Literal

from dotenv import load_dotenv
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Settings for the application."""

    # *** App settings ***
    APP_TITLE: str = "ManthanAI - Research Agent"
    APP_DESCRIPTION: str = (
        "ManthanAI is an LLM-based autonomous agent designed to "
        "perform comprehensive online research on any given topic."
    )
    APP_VERSION: str = "0.1.0"
    APP_API_KEY: str
    # Comma-separated list of origins that are allowed to make requests to the API.
    APP_ALLOWED_ORIGINS: str = "http://localhost:3000"
    APP_QUERY_COUNT: int = 2

    # *** LLM settings ***
    # Groq
    GROQ_API_KEY: str
    GROQ_LLAMA_70B: str = "llama-3.1-70b-versatile"
    GROQ_LLAMA_70B_TEMPERATURE: float = 0.5

    # Gemini
    GOOGLE_API_KEY: str
    GOOGLE_FLASH: str = "gemini-1.5-flash"
    GOOGLE_FLASH_TEMPERATURE: float = 0.2

    # *** Tools settings ***
    # Tavily
    TAVILY_API_KEY: str
    TAVILY_SEARCH_DEPTH: Literal["basic", "advanced"] = "basic"
    TAVILY_EXCLUDE_DOMAINS: list[str] = ["youtube.com"]

    # *** LangSmith settings ***
    LANGCHAIN_API_KEY: str
    LANGCHAIN_ENDPOINT: str
    LANGCHAIN_PROJECT: str
    LANGCHAIN_TRACING_V2: Literal["true"]
    LANGCHAIN_FEEDBACK_KEY: str = "research-feedback"

    @property
    def allowed_origins(self) -> list[str]:
        """Returns a list of allowed origins.

        Returns:
            list[str]: A list of allowed origins.
        """
        return [origin.strip() for origin in self.APP_ALLOWED_ORIGINS.split(",")]


def get_settings() -> Settings:
    """
    Returns an instance of `Settings`.

    Returns:
        Settings: A settings instance.
    """
    load_dotenv()
    return Settings()


settings = get_settings()
