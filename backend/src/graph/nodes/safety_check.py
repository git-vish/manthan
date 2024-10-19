import logging
from typing import Any

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from src.graph.nodes.base import BaseNode, NodeError
from src.graph.states import ResearchGraphState

logger = logging.getLogger(__name__)


class TopicSafetyCheck(BaseModel):
    """Model for structured output containing topic safety check results."""

    is_safe: bool = Field(
        description="Whether the content is safe or not.",
    )
    violated_category: str | None = Field(
        description="The violated safety category.",
    )


# Safety categories to check for, https://huggingface.co/meta-llama/Llama-Guard-3-8B#hazard-taxonomy-and-policy
SAFETY_CATEGORIES = """
- Sexual Content
- Defamation
- Specialized Advice
- Privacy
- Intellectual Property
- Indiscriminate Weapons
- Hate
- Suicide & Self-Harm
- Elections
- Violent Crimes
- Non-Violent Crimes
- Sex-Related Crimes
- Child Sexual Exploitation
- Code Interpreter Abuse
"""

_SYSTEM_MESSAGE = f"""You are an expert content safety evaluator skilled in identifying safety violations across predefined categories.

The categories for evaluation are:

<UNSAFE CONTENT CATEGORIES>
{SAFETY_CATEGORIES}
</UNSAFE CONTENT CATEGORIES>

Your task is to assess content safety and report the most appropriate violated category, if any."""  # noqa: E501

_USER_MESSAGE = "Evaluate the topic: '{topic}' for safety violations."


class TopicSafetyCheckNode(BaseNode):
    """Node responsible for checking the content safety of a topic."""

    def __init__(self, llm: BaseChatModel):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", _SYSTEM_MESSAGE),
                ("user", _USER_MESSAGE),
            ],
        )
        self._chain = prompt | llm.with_structured_output(TopicSafetyCheck)

    async def _arun(self, state: ResearchGraphState) -> dict[str, Any]:
        topic = state["topic"]

        logger.info(
            f"[TopicSafetyCheckNode] Checking content safety for topic: '{topic}'."
        )

        try:
            topic_safety_check = await self._chain.ainvoke({"topic": topic})
        except Exception as e:
            logger.error(
                f"[TopicSafetyCheckNode] Error during content safety check: {e}"
            )
            raise NodeError(
                "Unable to perform content safety check. Please try again."
            ) from e

        return topic_safety_check.model_dump()
