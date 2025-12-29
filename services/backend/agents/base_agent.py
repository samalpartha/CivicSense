"""
Base agent class with common functionality.
"""

import asyncio
import google.generativeai as genai
from typing import Dict, Any
from abc import ABC, abstractmethod

from config import settings
from logger import logger
from exceptions import GeminiAPIError


class BaseAgent(ABC):
    """
    Abstract base class for all AI agents.
    Provides common Gemini API interaction.
    """

    def __init__(self, agent_name: str):
        """
        Initialize base agent.

        Args:
            agent_name: Name of the agent for logging
        """
        self.agent_name = agent_name
        self.model = None
        self._init_model()
        logger.info(f"{agent_name} initialized")

    def _init_model(self):
        """Initialize Gemini model."""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini for {self.agent_name}: {e}")
            raise GeminiAPIError(f"Model initialization failed: {e}")

    async def call_gemini(
        self,
        prompt: str,
        system_instruction: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """
        Call Gemini API with prompt.

        Args:
            prompt: User prompt
            system_instruction: System instruction for model behavior
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum response tokens

        Returns:
            Generated text response
        """
        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )

            if system_instruction:
                model = genai.GenerativeModel(
                    settings.GEMINI_MODEL, system_instruction=system_instruction
                )
            else:
                model = self.model

            # Run synchronous Gemini API call in thread pool
            response = await asyncio.to_thread(
                model.generate_content, prompt, generation_config=generation_config
            )

            return response.text

        except Exception as e:
            logger.error(f"{self.agent_name} Gemini API call failed: {e}")
            raise GeminiAPIError(f"API call failed: {e}")

    @abstractmethod
    async def execute(self, *args, **kwargs) -> Dict[str, Any]:
        """
        Execute agent's primary function.
        Must be implemented by subclasses.
        """
        pass
