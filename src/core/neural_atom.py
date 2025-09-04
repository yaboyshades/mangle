"""
Neural Atom base implementation for the Mangle agent system.
"""

from typing import Any, Dict
from .plugin_interface import NeuralAtom, NeuralAtomMetadata


class NeuralAtom(NeuralAtom):
    """Base implementation of neural atoms with common functionality."""
    
    def __init__(self, metadata: NeuralAtomMetadata):
        super().__init__(metadata)
        self.state = {}
        self.performance_metrics = {
            "execution_count": 0,
            "average_execution_time": 0.0,
            "success_rate": 1.0
        }
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the neural atom with performance tracking."""
        import time
        start_time = time.time()
        
        try:
            result = await self._execute_implementation(parameters)
            self.performance_metrics["execution_count"] += 1
            
            # Update average execution time
            execution_time = time.time() - start_time
            count = self.performance_metrics["execution_count"]
            current_avg = self.performance_metrics["average_execution_time"]
            self.performance_metrics["average_execution_time"] = (
                (current_avg * (count - 1) + execution_time) / count
            )
            
            return result
            
        except Exception as e:
            # Update success rate
            count = self.performance_metrics["execution_count"] + 1
            current_success = self.performance_metrics["success_rate"]
            self.performance_metrics["success_rate"] = (
                (current_success * (count - 1)) / count
            )
            self.performance_metrics["execution_count"] = count
            
            return {
                "error": str(e),
                "success": False
            }
    
    async def _execute_implementation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Override this method in subclasses."""
        raise NotImplementedError("Subclasses must implement _execute_implementation")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for this neural atom."""
        return {
            "metadata": {
                "name": self.metadata.name,
                "version": self.metadata.version,
                "capabilities": self.metadata.capabilities
            },
            "performance": self.performance_metrics
        }