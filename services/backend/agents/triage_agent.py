"""
Triage Agent - Classifies incoming queries by category and urgency.
"""

import json
from typing import Dict

from agents.base_agent import BaseAgent
from logger import logger


class TriageAgent(BaseAgent):
    """
    Classifies queries and assesses impact in a single pass.
    Combines categorization, urgency, and impact assessment.
    """

    def __init__(self):
        super().__init__("TriageAgent")
        self.system_instruction = """You are a civic query analyst.
Analyze the user query to determine:
1. Category: emergency, infrastructure, education, transit, or general.
2. Urgency: critical, high, medium, low.
3. Impact Severity: critical, high, moderate, low, info.
4. Affected Areas: List of specific locations mentioned or implied.
5. Affected Groups: public, seniors, parents, students, etc.

Respond ONLY with valid JSON in this format:
{
  "category": "category_name",
  "urgency": "urgency_level",
  "severity": "severity_level",
  "affected_areas": ["area1", "area2"],
  "affected_groups": ["group1"],
  "confidence": 0.95,
  "reasoning": "brief explanation"
}"""

    async def classify(self, query: str, context: Dict = None) -> Dict:
        """
        Analyze a user query for category and impact.
        """
        try:
            context_str = ""
            if context:
                context_str = f"\n\nContext: {json.dumps(context, indent=2)}"

            prompt = f"""Analyze this civic query:

Query: "{query}"{context_str}

Provide analysis as JSON."""

            response = await self.call_gemini(
                prompt=prompt,
                system_instruction=self.system_instruction,
                temperature=0.3,
            )

            # Parse JSON response
            result = self._parse_response(response)
            logger.info(
                f"Query analysis: category={result['category']}, urgency={result['urgency']}, areas={result.get('affected_areas')}"
            )

            return result

        except Exception as e:
            logger.error(f"Triage classification failed: {e}")
            # Return safe default
            return {
                "category": "general",
                "urgency": "medium",
                "confidence": 0.5,
                "reasoning": "Classification failed, using default",
            }

    def _parse_response(self, response: str) -> Dict:
        """Parse and validate JSON response."""
        try:
            # Clean response (remove markdown code blocks if present)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()

            result = json.loads(response)

            # Validate required fields
            required_fields = ["category", "urgency", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")

            return result

        except Exception as e:
            logger.error(f"Failed to parse triage response: {e}")
            return {
                "category": "general",
                "urgency": "medium",
                "confidence": 0.5,
                "reasoning": "Parse error",
            }

    async def execute(self, query: str, context: Dict = None) -> Dict:
        """Execute method for base class compatibility."""
        return await self.classify(query, context)
