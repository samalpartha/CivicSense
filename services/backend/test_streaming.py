import asyncio
import websockets
import json
import sys

async def test_chat():
    uri = "ws://127.0.0.1:8081/ws/chat"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri, extra_headers={"Origin": "http://127.0.0.1:8080"}) as websocket:
            # 1. Wait for system headers
            print("Connected!")
            
            # 2. Send Query
            query = {
                "type": "query",
                "message": "Is it safe here?",
                "context": {
                    "user_type": "general", 
                    "location": "Schenectady, NY (12345)",
                    "zip_code": "12345",
                    "city": "Schenectady",
                    "active_alerts": [] 
                }
            }
            print(f"Sending: {query}")
            await websocket.send(json.dumps(query))
            
            # 3. Listen for stream
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                print(f"Received: {data['type']}")
                
                if data['type'] == 'error':
                    print(f"ERROR: {data['message']}")
                    break
                    
                if data['type'] == 'response_token':
                    sys.stdout.write(data.get('token', ''))
                    sys.stdout.flush()
                
                if data['type'] == 'response_end':
                    print("\n[Stream Complete]")
                    break
                    
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat())
