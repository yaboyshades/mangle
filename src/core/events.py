"""
Event system for the Mangle agent mode.
"""

from dataclasses import dataclass
from typing import Any, Dict, Optional
from datetime import datetime
import uuid


@dataclass
class BaseEvent:
    """Base event class for the agent system."""
    id: str
    timestamp: datetime
    event_type: str
    data: Dict[str, Any]
    source: Optional[str] = None


def create_event(event_type: str, data: Dict[str, Any], source: Optional[str] = None) -> BaseEvent:
    """Create a new event with generated ID and timestamp."""
    return BaseEvent(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(),
        event_type=event_type,
        data=data,
        source=source
    )