"""Test WebSocket client"""

import asyncio
import websockets
import json


async def test():
    uri = "ws://localhost:8081/ws/chat"
    print(f"Connecting to {uri}...")

    try:
        async with websockets.connect(uri) as ws:
            print("✅ Connected!")

            # Wait for welcome message
            msg = await asyncio.wait_for(ws.recv(), timeout=5)
            print(f"📨 Welcome: {json.loads(msg)['message']}")

            # Send a test query
            query = {
                "type": "query",
                "message": "Hello, can you hear me?",
                "context": {"user_type": "general"},
            }
            await ws.send(json.dumps(query))
            print(f"\n📤 Sent: '{query['message']}'")

            # Wait for responses
            print("\n⏳ Waiting for responses...")
            for i in range(10):  # Wait for up to 10 messages
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=15)
                    data = json.loads(msg)

                    if data["type"] == "status":
                        print(f"   Status: {data['message']}")
                    elif data["type"] == "response":
                        print(f"\n✅ GOT RESPONSE!")
                        print(f"   Answer: {data['message'][:200]}...")
                        break
                    elif data["type"] == "error":
                        print(f"\n❌ ERROR: {data['message']}")
                        break
                except asyncio.TimeoutError:
                    print("   Timeout waiting for response")
                    break

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(test())
