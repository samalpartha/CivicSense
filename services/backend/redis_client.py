import os
import redis.asyncio as redis
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger("uvicorn")

class RedisClient:
    def __init__(self):
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_password = os.getenv("REDIS_PASSWORD", None)
        self.redis_ssl = os.getenv("REDIS_SSL", "False").lower() in ("true", "1", "t")
        self.client: redis.Redis | None = None

    async def connect(self):
        """Initializes the Redis connection."""
        try:
            self.client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                password=self.redis_password,
                ssl=self.redis_ssl,
                decode_responses=True
            )
            await self.client.ping()
            logger.info(f"Connected to Redis at {self.redis_host}:{self.redis_port}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None

    async def close(self):
        """Closes the Redis connection."""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")

    async def get(self, key: str):
        """Retrieves a value from Redis."""
        if not self.client:
            logger.warning("Redis client is not initialized")
            return None
        return await self.client.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        """Sets a value in Redis with an optional expiration time."""
        if not self.client:
            logger.warning("Redis client is not initialized")
            return None
        return await self.client.set(key, value, ex=expire)

    async def delete(self, key: str):
        """Deletes a key from Redis."""
        if not self.client:
            logger.warning("Redis client is not initialized")
            return None
        return await self.client.delete(key)

# Global instance
redis_client = RedisClient()
