#!/usr/bin/env python3
"""
Quick test script for CivicSense backend.
Tests configuration, imports, and basic functionality.
"""
import sys
import asyncio
from typing import Dict


def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    
    try:
        import config
        import logger
        import exceptions
        import kafka_consumer
        import query_handler
        import vector_search
        from agents import base_agent, triage_agent, impact_agent, guidance_agent, monitoring_agent
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False


def test_configuration():
    """Test configuration loading."""
    print("\nTesting configuration...")
    
    try:
        from config import settings
        
        required_vars = [
            'KAFKA_BOOTSTRAP_SERVERS',
            'KAFKA_API_KEY', 
            'KAFKA_API_SECRET',
            'MONGO_URI',
            'GEMINI_API_KEY'
        ]
        
        missing = []
        for var in required_vars:
            if not getattr(settings, var, None):
                missing.append(var)
        
        if missing:
            print(f"✗ Missing required environment variables: {', '.join(missing)}")
            print("  Please create .env file from .env.example")
            return False
        
        print("✓ Configuration loaded successfully")
        print(f"  - Kafka: {settings.KAFKA_BOOTSTRAP_SERVERS}")
        print(f"  - MongoDB: {settings.MONGO_DATABASE}")
        print(f"  - Log Level: {settings.LOG_LEVEL}")
        return True
        
    except Exception as e:
        print(f"✗ Configuration test failed: {e}")
        return False


async def test_agents():
    """Test agent initialization."""
    print("\nTesting agents...")
    
    try:
        from agents.triage_agent import TriageAgent
        from agents.impact_agent import ImpactAgent
        from agents.guidance_agent import GuidanceAgent
        from agents.monitoring_agent import MonitoringAgent
        
        # Initialize agents (don't call them - requires API keys)
        triage = TriageAgent()
        impact = ImpactAgent()
        guidance = GuidanceAgent()
        monitoring = MonitoringAgent()
        
        print("✓ All agents initialized successfully")
        print(f"  - Triage: {triage.agent_name}")
        print(f"  - Impact: {impact.agent_name}")
        print(f"  - Guidance: {guidance.agent_name}")
        print(f"  - Monitoring: {monitoring.agent_name}")
        
        return True
        
    except Exception as e:
        print(f"✗ Agent initialization failed: {e}")
        return False


def test_exceptions():
    """Test custom exceptions."""
    print("\nTesting exceptions...")
    
    try:
        from exceptions import (
            CivicSenseException,
            KafkaProducerError,
            KafkaConsumerError,
            MongoDBError,
            GeminiAPIError,
            AgentExecutionError
        )
        
        # Test exception hierarchy
        assert issubclass(KafkaProducerError, CivicSenseException)
        assert issubclass(AgentExecutionError, CivicSenseException)
        
        print("✓ Exception classes defined correctly")
        return True
        
    except Exception as e:
        print(f"✗ Exception test failed: {e}")
        return False


def test_logger():
    """Test logging configuration."""
    print("\nTesting logger...")
    
    try:
        from logger import logger
        
        logger.debug("Debug message")
        logger.info("Info message")
        logger.warning("Warning message")
        
        print("✓ Logger configured successfully")
        return True
        
    except Exception as e:
        print(f"✗ Logger test failed: {e}")
        return False


def print_summary(results: Dict[str, bool]):
    """Print test summary."""
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {test_name}")
    
    print("="*50)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Check configuration and dependencies.")
        return 1


async def main():
    """Run all tests."""
    print("CivicSense Backend Test Suite")
    print("="*50)
    
    results = {
        "Imports": test_imports(),
        "Configuration": test_configuration(),
        "Exceptions": test_exceptions(),
        "Logger": test_logger(),
        "Agents": await test_agents()
    }
    
    return print_summary(results)


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

