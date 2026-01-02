
import httpx
import time
from typing import Dict, Any, List
from config import settings
from logger import logger
from redis_client import redis_client
import json

class NewsClient:
    """
    Client for fetching real-time news from NewsData.io.
    Implements caching to respect API limits (Free Tier).
    """
    
    BASE_URL = "https://newsdata.io/api/1/news"
    CACHE_TTL = 900  # 15 minutes (in seconds)

    def __init__(self):
        self.api_key = settings.NEWSDATA_API_KEY
    
    async def get_latest_news(self, query: str = "safety OR emergency OR traffic OR transit", country: str = "us") -> List[Dict[str, Any]]:
        """
        Fetch latest news matching safety/civic keywords.
        Returns cached data if within TTL.
        """
        if not self.api_key:
            logger.warning("NewsData API Key not configured. Returning empty list.")
            return []

        redis_key = f"news:{hash(query)}:{country}"
        
        # Check Redis Cache
        try:
            cached_data = await redis_client.get(redis_key)
            if cached_data:
                logger.info("Returning cached news data (Redis).")
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Redis get failed: {e}")

        # Fetch Live Data
        try:
            params = {
                "apikey": self.api_key,
                "q": query,
                "country": country,
                "language": "en",
                "category": "top,environment,health,business" 
            }
            
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching news from NewsData.io... Query: {query}")
                response = await client.get(self.BASE_URL, params=params, timeout=10.0)
                
                if response.status_code == 401:
                    logger.error("NewsData API Key Invalid.")
                    return []
                
                if response.status_code == 429:
                    logger.warning("NewsData Rate Limit Exceeded.")
                    # If we have staled data in redis, we could return it, but simple get passed expired already.
                    # In a robust system, we might double-cache (stale vs fresh).
                    return [] 

                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "success":
                    articles = data.get("results", [])
                    # Transform to simplified format
                    simplified_articles = [
                        {
                            "id": article.get("article_id", str(hash(article.get("title")))),
                            "title": article.get("title"),
                            "source": article.get("source_id"),
                            "pubDate": article.get("pubDate"),
                            "link": article.get("link"),
                            "image_url": article.get("image_url"),
                            "description": article.get("description")
                        }
                        for article in articles
                    ]
                    
                    # Update Cache
                    # Update Cache (Redis)
                    try:
                        await redis_client.set(redis_key, json.dumps(simplified_articles), expire=self.CACHE_TTL)
                    except Exception as e:
                        logger.warning(f"Redis set failed: {e}")
                    
                    logger.info(f"Fetched {len(simplified_articles)} articles.")
                    return simplified_articles
                else:
                    logger.error(f"NewsData API Error: {data}")
                    return []

        except Exception as e:
            logger.error(f"Failed to fetch news: {e}")
            return []

# Singleton instance
news_client = NewsClient()
