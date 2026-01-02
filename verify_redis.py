import asyncio
from services.backend.redis_client import redis_client
import sys
import os

# Add services/backend to path to allow imports
sys.path.append(os.path.join(os.getcwd(), 'services/backend'))

async def main():
    print("Attempting to connect to Redis...")
    # Force localhost settings just in case env is different, though env should load
    os.environ["REDIS_HOST"] = "localhost"
    os.environ["REDIS_PORT"] = "6379"
    
    await redis_client.connect()
    
    if redis_client.client:
        print("✅ Connection Successful!")
        await redis_client.set("verify_key", "Redis is working locally!")
        val = await redis_client.get("verify_key")
        print(f"✅ Read/Write Check: {val}")
        await redis_client.delete("verify_key")
        await redis_client.close()
    else:
        print("❌ Connection Failed.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
