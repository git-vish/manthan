from typing import Literal

from dotenv import load_dotenv
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Settings for the application."""

    APP_TITLE: str = "ManthanAI - Research Agent"
    APP_DESCRIPTION: str = (
        "ManthanAI is an LLM-based autonomous agent designed to "
        "perform comprehensive online research on any given topic."
    )
    APP_VERSION: str = "0.1.0"

    QUERY_COUNT: int = 2

    GROQ_API_KEY: str
    GROQ_LLAMA_70B: str = "llama-3.1-70b-versatile"
    GROQ_LLAMA_70B_TEMPERATURE: float = 0.5

    GOOGLE_API_KEY: str
    GOOGLE_FLASH: str = "gemini-1.5-flash"
    GOOGLE_FLASH_TEMPERATURE: float = 0.2

    TAVILY_API_KEY: str
    TAVILY_SEARCH_DEPTH: Literal["basic", "advanced"] = "basic"
    TAVILY_EXCLUDE_DOMAINS: list[str] = ["youtube.com"]


def get_settings() -> AppSettings:
    """
    Returns an instance of `AppSettings`.

    Returns:
        AppSettings: A settings instance.
    """
    load_dotenv()
    return AppSettings()


settings = get_settings()
