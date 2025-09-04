#!/usr/bin/env python3
"""
Agent Mode Snippet Optimization Demo
====================================

This script demonstrates the token efficiency improvements achieved by the 
Agent Mode snippet optimization system.
"""

import asyncio
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.core.copilot_agent_mode import create_copilot_agent


async def demo_token_optimization():
    """Demonstrate the token optimization capabilities."""
    print("🚀 Agent Mode Snippet Optimization Demo")
    print("=" * 50)
    print()
    
    # Create the agent
    print("🤖 Initializing Agent Mode...")
    agent = await create_copilot_agent()
    print("✅ Agent ready for optimization!")
    print()
    
    # Demo scenarios
    scenarios = [
        {
            "name": "Function Creation",
            "user_intent": "create a function that processes data",
            "context": "I need to create a function that handles list processing with error handling",
            "estimated_tokens": 150
        },
        {
            "name": "Data Visualization", 
            "user_intent": "plot data with matplotlib and numpy",
            "context": "need to create a matplotlib chart showing numpy array data visualization",
            "estimated_tokens": 120
        },
        {
            "name": "Class Definition",
            "user_intent": "create a class with inheritance and methods",
            "context": "building an object-oriented class solution with inheritance and polymorphism",
            "estimated_tokens": 180
        },
        {
            "name": "Algorithm Implementation",
            "user_intent": "implement a sorting algorithm with benchmarking", 
            "context": "need an efficient algorithm for data sorting with performance benchmarking and optimization",
            "estimated_tokens": 200
        }
    ]
    
    total_traditional_tokens = 0
    total_optimized_tokens = 0
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"📋 Scenario {i}: {scenario['name']}")
        print(f"   User Request: \"{scenario['user_intent']}\"")
        print(f"   Context: {scenario['context']}")
        print(f"   Traditional Token Cost: {scenario['estimated_tokens']}")
        
        # Get agent optimization
        request = {
            "type": "code_generation",
            "user_intent": scenario["user_intent"],
            "context": scenario["context"],
            "estimated_tokens": scenario["estimated_tokens"]
        }
        
        response = await agent.process_request(request)
        
        if response.get("strategy") == "snippet_optimized":
            optimized_cost = 8  # Snippet trigger + minimal context
            savings = scenario["estimated_tokens"] - optimized_cost
            efficiency = (savings / scenario["estimated_tokens"]) * 100
            
            print(f"   🎯 Agent Recommendation: Use snippet '{response['recommended_snippet']}'")
            print(f"   💰 Optimized Token Cost: {optimized_cost}")
            print(f"   📈 Token Savings: {savings} ({efficiency:.1f}% reduction)")
            print(f"   🔥 Strategy: Snippet-first generation")
            
            total_optimized_tokens += optimized_cost
        else:
            print(f"   📝 Strategy: Standard generation")
            print(f"   💰 Token Cost: {scenario['estimated_tokens']} (no optimization)")
            total_optimized_tokens += scenario["estimated_tokens"]
        
        total_traditional_tokens += scenario["estimated_tokens"]
        print()
    
    # Summary statistics
    print("📊 OPTIMIZATION SUMMARY")
    print("=" * 50)
    print(f"Traditional Approach:     {total_traditional_tokens:,} tokens")
    print(f"Agent-Optimized Approach: {total_optimized_tokens:,} tokens")
    print(f"Total Savings:            {total_traditional_tokens - total_optimized_tokens:,} tokens")
    print(f"Efficiency Improvement:   {((total_traditional_tokens - total_optimized_tokens) / total_traditional_tokens) * 100:.1f}%")
    print()
    
    if total_optimized_tokens < total_traditional_tokens * 0.2:
        print("🏆 EXCELLENT! Achieved 80%+ token reduction target!")
    elif total_optimized_tokens < total_traditional_tokens * 0.5:
        print("🎯 GOOD! Significant token reduction achieved!")
    else:
        print("📈 Moderate optimization - room for improvement")
    
    print()
    print("🔧 Available Snippet Triggers:")
    print("   • main- (main function)")
    print("   • class- (class definition)")
    print("   • def- (function definition)")
    print("   • for- (for loops)")
    print("   • try- (error handling)")
    print("   • str- (string operations)")
    print("   • list- (list operations)")
    print("   • np- (numpy operations)")
    print("   • plt- (matplotlib plotting)")
    print("   • algo- (algorithms)")
    print()
    
    print("🎯 Usage Tips:")
    print("   1. Type snippet triggers ending with '-' for instant suggestions")
    print("   2. Use Ctrl+Shift+Alt+S to analyze current context")
    print("   3. Agent automatically suggests optimal snippets during coding")
    print("   4. Configure optimization settings in VS Code preferences")
    print()
    
    # Cleanup
    await agent.cleanup()
    print("✅ Demo completed successfully!")


def main():
    """Run the demonstration."""
    try:
        asyncio.run(demo_token_optimization())
    except KeyboardInterrupt:
        print("\n🛑 Demo interrupted by user")
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        return 1
    return 0


if __name__ == "__main__":
    exit(main())