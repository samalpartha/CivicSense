"""
Impact Agent - Assesses severity and affected areas.
"""
import json
from typing import Dict, List

from agents.base_agent import BaseAgent
from logger import logger


class ImpactAgent(BaseAgent):
    """
    Determines the severity and scope of civic events.
    Identifies affected population segments and geographic areas.
    """
    
    def __init__(self):
        super().__init__("ImpactAgent")
        self.system_instruction = """You are an impact assessment specialist.
Analyze civic queries to determine:
- Severity level (critical, high, moderate, low, info)
- Affected population groups
- Geographic areas impacted
- Time sensitivity

Respond ONLY with valid JSON in this format:
{
  "severity": "severity_level",
  "affected_groups": ["group1", "group2"],
  "affected_areas": ["area1", "area2"],
  "time_sensitive": true/false,
  "estimated_impact": "brief description"
}"""
    
    async def assess(
        self,
        query: str,
        category: str,
        context: Dict = None
    ) -> Dict:
        """
        Assess impact of a civic event or query.
        
        Args:
            query: User's question
            category: Category from triage
            context: Optional context
            
        Returns:
            Impact assessment with severity and affected areas
        """
        try:
            context_str = ""
            if context:
                context_str = f"\n\nContext: {json.dumps(context, indent=2)}"
            
            prompt = f"""Assess the impact of this civic query:

Category: {category}
Query: "{query}"{context_str}

Provide impact assessment as JSON."""
            
            response = await self.call_gemini(
                prompt=prompt,
                system_instruction=self.system_instruction,
                temperature=0.4
            )
            
            result = self._parse_response(response)
            logger.info(f"Impact assessed: severity={result['severity']}, areas={len(result.get('affected_areas', []))}")
            
            return result
            
        except Exception as e:
            logger.error(f"Impact assessment failed: {e}")
            return {
                "severity": "info",
                "affected_groups": ["general public"],
                "affected_areas": [],
                "time_sensitive": False,
                "estimated_impact": "Unable to assess impact"
            }
    
    def _parse_response(self, response: str) -> Dict:
        """Parse and validate JSON response."""
        try:
            # Clean response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            result = json.loads(response)
            
            # Ensure lists are present
            if "affected_groups" not in result:
                result["affected_groups"] = []
            if "affected_areas" not in result:
                result["affected_areas"] = []
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to parse impact response: {e}")
            return {
                "severity": "info",
                "affected_groups": [],
                "affected_areas": [],
                "time_sensitive": False,
                "estimated_impact": "Parse error"
            }
    
    async def execute(self, query: str, category: str, context: Dict = None) -> Dict:
        """Execute method for base class compatibility."""
        return await self.assess(query, category, context)

