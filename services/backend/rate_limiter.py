from fastapi import HTTPException, Request, status
from redis_client import redis_client
from logger import logger

class RateLimiter:
    def __init__(self, times: int = 10, seconds: int = 60):
        self.times = times
        self.seconds = seconds

    async def __call__(self, request: Request):
        if not redis_client.client:
            return  # Fail open if Redis is down

        client_ip = request.client.host
        # Use a key specific to the rate limit configuration
        key = f"ratelimit:{client_ip}:{self.times}:{self.seconds}"

        try:
            # Increment the counter
            current_count = await redis_client.client.incr(key)
            
            # If this is the first request, set the expiration
            if current_count == 1:
                await redis_client.client.expire(key, self.seconds)
            
            if current_count > self.times:
                logger.warning(f"Rate limit exceeded for {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # Fail open logic: proceed if Redis fails
