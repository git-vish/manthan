from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from src.config import settings

Groq = ChatGroq(
    model=settings.GROQ_MODEL,
    temperature=settings.GROQ_TEMPERATURE,
)

Google = ChatGoogleGenerativeAI(
    model=settings.GOOGLE_MODEL,
    temperature=settings.GOOGLE_TEMPERATURE,
)
