from typing import Literal

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq


def get_llm(
    provider: Literal["groq", "google"], *, model: str, **config
) -> BaseChatModel:
    """Returns a LangChain chat model instance based on the given provider and model.
    The returned instance is configured with the given keyword arguments.

    Args:
        provider (Literal["groq", "google"]): The provider to use.
        model (str): The model to use.
        config: Additional configuration parameters for the model.

    Returns:
        BaseChatModel: The LangChain chat model instance.

    Raises:
        ValueError: If the provider is not recognized.
    """
    match provider:
        case "google":
            llm = ChatGoogleGenerativeAI(model=model, **config)
        case "groq":
            llm = ChatGroq(model=model, **config)
        case _:
            raise ValueError(f"Unknown LLM provider: {provider}")
    return llm
