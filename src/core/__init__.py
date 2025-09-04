"""
Mangle Agent Mode - Core Module

This module provides the core functionality for the Agent Mode with snippet optimization.
"""

from .copilot_agent_mode import (
    CopilotAgentPlugin,
    SnippetIntelligenceAtom,
    SnippetSuggestion,
    SnippetOptimizationResult,
    create_copilot_agent,
    PYTHON_SNIPPET_PATTERNS,
    SNIPPET_TOKEN_REDUCTION,
    MAX_SNIPPET_SUGGESTIONS,
    SNIPPET_CONFIDENCE_THRESHOLD
)

from .neural_atom import NeuralAtom, NeuralAtomMetadata
from .plugin_interface import PluginInterface
from .events import BaseEvent, create_event

__version__ = "1.0.0"
__author__ = "Mangle Agent System"

__all__ = [
    "CopilotAgentPlugin",
    "SnippetIntelligenceAtom", 
    "SnippetSuggestion",
    "SnippetOptimizationResult",
    "create_copilot_agent",
    "NeuralAtom",
    "NeuralAtomMetadata",
    "PluginInterface",
    "BaseEvent",
    "create_event",
    "PYTHON_SNIPPET_PATTERNS",
    "SNIPPET_TOKEN_REDUCTION",
    "MAX_SNIPPET_SUGGESTIONS",
    "SNIPPET_CONFIDENCE_THRESHOLD"
]