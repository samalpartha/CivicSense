
import httpx
import time
from typing import Dict, Any, List
from config import settings
from logger import logger

class NewsClient:
    """
    Client for fetching real-time news from NewsData.io.
    Implements caching to respect API limits (Free Tier).
    """
    
    BASE_URL = "https://newsdata.io/api/1/news"
    CACHE_TTL = 900  # 15 minutes (in seconds)

    def __init__(self):
        self.api_key = settings.NEWSDATA_API_KEY
        self.cache: Dict[str, Any] = {
            "data": [],
            "timestamp": 0
        }
    
    async def get_latest_news(self, query: str = "safety OR emergency OR traffic OR transit", country: str = "us") -> List[Dict[str, Any]]:
        """
        Fetch latest news matching safety/civic keywords.
        Returns cached data if within TTL.
        """
        if not self.api_key:
            logger.warning("NewsData API Key not configured. Returning empty list.")
            return []

        current_time = time.time()
        
        # Check Cache
        if (current_time - self.cache["timestamp"]) < self.CACHE_TTL and self.cache["data"]:
            logger.info("Returning cached news data.")
            return self.cache["data"]

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
                    return self.cache["data"] # Return stale data if rate limited

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
                    self.cache = {
                        "data": simplified_articles,
                        "timestamp": current_time
                    }
                    
                    logger.info(f"Fetched {len(simplified_articles)} articles.")
                    return simplified_articles
                else:
                    logger.error(f"NewsData API Error: {data}")
                    return []

        except Exception as e:
            logger.error(f"Failed to fetch news: {e}")
            return self.cache["data"] # Fallback to cache on error

# Singleton instance
news_client = NewsClient()
