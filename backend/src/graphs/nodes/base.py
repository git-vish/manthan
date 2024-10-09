from abc import ABC, abstractmethod
from typing import Any


class BaseNode(ABC):
    """
    Abstract base class for graph nodes, defining the interface for
    asynchronous execution.

    Each derived node class must implement the asynchronous `arun` method.
    """

    @abstractmethod
    async def arun(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Asynchronous execution method.

        Args:
            state: A dictionary containing the current state of the graph.

        Returns:
            A dictionary with the updated state after this node's execution.
        """
        pass
