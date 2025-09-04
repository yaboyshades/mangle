"""
Base interface for neural atoms and plugins in the Mangle agent system.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from dataclasses import dataclass


@dataclass
class NeuralAtomMetadata:
    """Metadata for neural atoms."""
    name: str
    description: str
    version: str
    author: str
    capabilities: List[str]


class NeuralAtom(ABC):
    """Base class for neural atoms."""
    
    def __init__(self, metadata: NeuralAtomMetadata):
        self.metadata = metadata
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the neural atom operation."""
        pass


class PluginInterface(ABC):
    """Base interface for agent mode plugins."""
    
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the plugin."""
        pass
    
    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming requests."""
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """Clean up plugin resources."""
        pass