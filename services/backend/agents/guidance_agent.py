"""
Guidance Agent - Generates clear, actionable responses.
"""

from typing import Dict, List

from agents.base_agent import BaseAgent
from logger import logger


class GuidanceAgent(BaseAgent):
    """
    Generates human-friendly guidance based on query analysis and knowledge base.
    Implements RAG pattern for grounded responses.
    """

    def __init__(self):
        super().__init__("GuidanceAgent")
        self.system_instruction = """You are 'CivicSense', a verified municipal safety assistant for Hartford, CT.

CURRENT CRITICAL SITUATION (LIVE):
1. Flash Flood Warning in "Zone A" (Riverfront/Lowlands). Evacuation mandatory.
2. Major Accident on I-91 Northbound (Exit 24). Traffic standstill. 
3. Conflict: I-91 traffic is blocking the primary Zone A evacuation route.

Your Role:
- Guide citizens to safety based on their role (Parent, Senior, etc.).
- If asked as "Civic Manager", assist in decision making (e.g., overriding traffic signals).
- Be calm, authoritative, and concise.
- ALWAYS reference the specific locations (Zone A, I-91) when relevant.
- Do NOT make up fake phone numbers; use standard placeholders like 'Call 911' or 'Contact 311'.

Guidelines:
- Use simple, non-technical language
- Provide specific action steps (e.g. "Do not use I-91", "Evacuate to High School Gym")
- Never speculate or provide legal advice
- Adapt tone for the user type
- If information is uncertain, say so clearly."""

    async def generate(
        self,
        query: str,
        category: str,
        impact: Dict,
        knowledge: List[Dict],
        context: Dict = None,
    ) -> Dict:
        """
        Generate guidance response using RAG pattern.

        Args:
            query: User's question
            category: Query category
            impact: Impact assessment results
            knowledge: Relevant documents from vector search
            context: Optional user context

        Returns:
            Generated guidance with answer and metadata
        """
        try:
            # Build context from knowledge base
            knowledge_context = self._build_knowledge_context(knowledge)

            # Determine user type for tone adaptation
            user_type = context.get("user_type", "general") if context else "general"

            # Build comprehensive prompt
            active_alerts = context.get("active_alerts", []) if context else []

            prompt = self._build_prompt(
                query=query,
                category=category,
                impact=impact,
                knowledge_context=knowledge_context,
                user_type=user_type,
                active_alerts=active_alerts,
            )

            # Generate response
            response = await self.call_gemini(
                prompt=prompt,
                system_instruction=self.system_instruction,
                temperature=0.7,
                max_tokens=512,
            )

            logger.info(
                f"Guidance generated for {category} query ({len(response)} chars)"
            )

            return {
                "answer": response.strip(),
                "knowledge_used": len(knowledge) > 0,
                "sources_count": len(knowledge),
            }

        except Exception as e:
            logger.error(f"Guidance generation failed: {e}")
            # Fallback response based on category and severity
            fallback_answer = self._generate_fallback_response(
                query, category, impact, user_type
            )
            return {
                "answer": fallback_answer,
                "knowledge_used": False,
                "sources_count": 0,
            }

    async def generate_stream(
        self,
        query: str,
        category: str,
        impact: Dict,
        knowledge: List[Dict],
        context: Dict = None,
    ):
        """
        Generate guidance response stream.
        Yields text chunks.
        """
        try:
            # Build context from knowledge base
            knowledge_context = self._build_knowledge_context(knowledge)

            # Determine user type
            user_type = context.get("user_type", "general") if context else "general"
            active_alerts = context.get("active_alerts", []) if context else []

            # Build prompt
            prompt = self._build_prompt(
                query=query,
                category=category,
                impact=impact,
                knowledge_context=knowledge_context,
                user_type=user_type,
                active_alerts=active_alerts,
            )

            # Generate stream
            async for chunk in self.call_gemini_stream(
                prompt=prompt,
                system_instruction=self.system_instruction,
                temperature=0.7,
                max_tokens=512,
            ):
                yield chunk

        except Exception as e:
            logger.error(f"Guidance stream failed: {e}")
            # Fallback (non-streamed)
            fallback = self._generate_fallback_response(
                query, category, impact, user_type
            )
            yield fallback

    def _build_knowledge_context(self, knowledge: List[Dict]) -> str:
        """Build context string from knowledge base documents."""
        if not knowledge:
            return "No specific guidance documents found."

        context_parts = []
        for i, doc in enumerate(knowledge, 1):
            title = doc.get("title", "Document")
            content = doc.get("content", "")
            context_parts.append(f"[Source {i}: {title}]\n{content}\n")

        return "\n".join(context_parts)

    def _build_prompt(
        self,
        query: str,
        category: str,
        impact: Dict,
        knowledge_context: str,
        user_type: str,
        active_alerts: List[Dict] = None,
    ) -> str:
        """Build comprehensive prompt for guidance generation."""

        severity = impact.get("severity", "info")
        affected_groups = impact.get("affected_groups", [])
        time_sensitive = impact.get("time_sensitive", False)

        prompt = f"""Generate guidance for this civic query:

Query: "{query}"
Category: {category}
Severity: {severity}
Time Sensitive: {time_sensitive}
User Type: {user_type}
Affected Groups: {", ".join(affected_groups) if affected_groups else "general public"}

Knowledge Base Context:
{knowledge_context}

Based on this information, provide clear, actionable guidance that directly answers the user's question.
"""

        # Inject active alerts into the prompt if available
        if active_alerts:
            prompt += "\n\nACTIVE DASHBOARD ALERTS (Visible to User):\n"
            for alert in active_alerts:
                prompt += f"- [{alert.get('severity', 'info').upper()}] {alert.get('title')}: {alert.get('impact')} (Category: {alert.get('category')})\n"
            prompt += "\nReference these alerts if relevant to the query to prove you are aware of the real-time situation."

        # Add tone guidance based on user type
        if user_type == "senior":
            prompt += "\nUse especially clear language and avoid technical jargon."
        elif user_type == "parent":
            prompt += (
                "\nFocus on safety and clarity for decision-making about children."
            )
        elif user_type == "student":
            prompt += "\nUse concise, straightforward language."

        return prompt

    def _generate_fallback_response(
        self, query: str, category: str, impact: Dict, user_type: str
    ) -> str:
        """Generate a rule-based fallback response when AI is unavailable."""
        severity = impact.get("severity", "info")

        responses = {
            "emergency": {
                "critical": f"⚠️ **CRITICAL ALERT**: This appears to be an emergency situation. For immediate assistance, call 911 or your local emergency services. Stay calm, follow official instructions, and prioritize your safety.",
                "high": f"🚨 **URGENT**: Your question relates to an emergency situation. If you're in immediate danger, call 911. Otherwise, monitor official channels and follow guidance from local authorities.",
                "medium": f"⚠️ This appears to be an emergency-related query. Please monitor official emergency channels and follow guidance from local authorities. If urgent, contact emergency services.",
                "low": f"Thank you for your query about emergency services. For non-urgent questions, contact your local emergency management office or check official city websites.",
            },
            "infrastructure": {
                "critical": f"⚡ **SERVICE DISRUPTION**: There may be a critical infrastructure issue. Check with your utility provider immediately. Follow safety guidelines for the affected service.",
                "high": f"🔧 **INFRASTRUCTURE ALERT**: Your query relates to a service disruption. Contact your utility provider or check their website for updates and estimated restoration times.",
                "medium": f"Your question is about infrastructure services. Check your service provider's website or app for current status updates and outage information.",
                "low": f"For infrastructure and utility questions, visit your service provider's website or contact their customer service line.",
            },
            "transit": {
                "critical": f"🚇 **TRANSIT EMERGENCY**: There may be a critical transit situation. Avoid the affected area, seek alternate routes, and monitor official transit authority updates.",
                "high": f"🚌 **TRANSIT ALERT**: Significant transit disruptions reported. Check your transit authority's app or website for real-time updates and alternative routes.",
                "medium": f"Transit services may be affected. Check your local transit authority's real-time tracking app or website for current schedules and delays.",
                "low": f"For transit information, visit your local transit authority's website or use their mobile app for schedules and updates.",
            },
            "education": {
                "critical": f"🏫 **SCHOOL ALERT**: This is an urgent education-related matter. Contact your school district immediately or check their emergency notification system.",
                "high": f"📚 **EDUCATION UPDATE**: Significant education-related changes. Check your school district's website, app, or emergency notification system for details.",
                "medium": f"For education-related questions, check your school district's website or contact them directly for accurate information about schedules and policies.",
                "low": f"Visit your school district's website or contact your school's administration for routine education questions.",
            },
            "general": {
                "critical": f"⚠️ Your question appears urgent. For immediate civic assistance, contact your city's non-emergency line (311 in many cities) or visit your city's official website.",
                "high": f"📞 For civic services assistance, contact your city's helpline (often 311) or visit your city's official website for resources and contact information.",
                "medium": f"For civic services questions, visit your city or county's official website or call their information line for assistance.",
                "low": f"Thank you for your civic services question. Visit your local government's website or call their information line for assistance.",
            },
        }

        # Get appropriate response
        category_responses = responses.get(category, responses["general"])
        response = category_responses.get(severity, category_responses["low"])

        # Add user-type specific guidance
        if user_type == "senior":
            response += "\n\n💡 **For Seniors**: If you need additional assistance, contact your local senior services center or ask a family member to help."
        elif user_type == "parent":
            response += "\n\n👨‍👩‍👧 **For Parents**: Keep children informed in age-appropriate ways and have a family emergency plan ready."

        response += "\n\n🤖 *Note: This is a fallback response. Our AI service is temporarily unavailable due to high demand.*"

        return response

    async def execute(
        self,
        query: str,
        category: str,
        impact: Dict,
        knowledge: List[Dict],
        context: Dict = None,
    ) -> Dict:
        """Execute method for base class compatibility."""
        return await self.generate(query, category, impact, knowledge, context)
