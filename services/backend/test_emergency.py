"""Test emergency query"""

import asyncio
import websockets
import json


async def test():
    uri = "ws://localhost:8081/ws/chat"

    async with websockets.connect(uri) as ws:
        # Wait for welcome
        await ws.recv()

        # Test emergency query
        queries = [
            "Is it safe to go outside during the fire?",
            "Are the trains running today?",
            "Is school closed tomorrow?",
        ]

        for query in queries:
            print(f"\n{'='*60}")
            print(f"❓ QUERY: {query}")
            print(f"{'='*60}")

            await ws.send(
                json.dumps(
                    {
                        "type": "query",
                        "message": query,
                        "context": {"user_type": "general"},
                    }
                )
            )

            # Get responses
            for _ in range(5):
                msg = json.loads(await ws.recv())
                if msg["type"] == "response":
                    print(f"\n✅ RESPONSE:\n{msg['message']}\n")
                    print(f"📊 Category: {msg.get('category', 'N/A')}")
                    print(f"⚠️  Severity: {msg.get('severity', 'N/A')}")
                    break


if __name__ == "__main__":
    asyncio.run(test())
