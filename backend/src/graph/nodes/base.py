from abc import ABC, abstractmethod
from typing import Any

from src.graph.states import AnyGraphState


class BaseNode(ABC):
    """Abstract base class for graph nodes, defining the interface for
    asynchronous execution.

    Each derived node class must implement the asynchronous `_arun` method.
    """

    @abstractmethod
    async def _arun(self, state: AnyGraphState) -> dict[str, Any]:
        """Asynchronous node execution method.

        Args:
            state: The current state of the graph.

        Returns:
            A dictionary with the updated state after this node's execution.
        """
        pass

    async def __call__(self, state: AnyGraphState) -> dict[str, Any]:
        """Makes the instance callable, invoking the `_arun` method."""
        return await self._arun(state)
