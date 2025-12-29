"""Quick test script to debug query handler"""

import asyncio
from query_handler import QueryHandler


async def test():
    try:
        print("=== Testing Query Handler ===")
        handler = QueryHandler()
        print("✅ Handler initialized\n")

        print("Testing query: 'Is it safe to go outside?'")
        result = await handler.process_query("Is it safe to go outside?")

        print("\n✅ SUCCESS!")
        print(f"Category: {result['category']}")
        print(f"Severity: {result['severity']}")
        print(f"Answer: {result['answer'][:150]}...")

    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}")
        print(f"Message: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test())
