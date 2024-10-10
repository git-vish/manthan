from dotenv import load_dotenv
from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Settings for the application."""

    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_TEMPERATURE: float = 0.5

    GOOGLE_API_KEY: str
    GOOGLE_MODEL: str = "gemini-1.5-flash"
    GOOGLE_TEMPERATURE: float = 0.2

    TAVILY_API_KEY: str
    TAVILY_EXCLUDE_DOMAINS: list[str] = ["youtube.com"]

    APP_TITLE: str = "ManthanAI - Research Agent"
    APP_DESCRIPTION: str = (
        "ManthanAI is an LLM-based autonomous agent designed to "
        "perform comprehensive online research on any given topic."
    )


def get_settings() -> AppSettings:
    """
    Returns an instance of `AppSettings`.

    Returns:
        AppSettings: A settings instance.
    """
    load_dotenv()
    return AppSettings()


settings: AppSettings = get_settings()
