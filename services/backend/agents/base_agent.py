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

    async def call_gemini_stream(
        self,
        prompt: str,
        system_instruction: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ):
        """
        Call Gemini API with prompt and stream response.
        Returns an async generator of text chunks.
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

            # Run synchronous Gemini API call with stream=True
            # Note: We can't easily wrap the iterator in to_thread, so we iterate synchronously
            # OR better: use the async version of the library if available, but for now we'll
            # wrap the *creation* of the stream, then iterate.
            # Actually, Google's Python SDK `generate_content` is synchronous blocking I/O unless using `generate_content_async`.
            # Let's check availability... assuming standard SDK, `generate_content_async` is preferred.
            
            # If start_chat used... but we are using generate_content.
            # Newer `google-generativeai` has `generate_content_async`.
            
            response = await model.generate_content_async(
                prompt, 
                generation_config=generation_config,
                stream=True
            )
            
            async for chunk in response:
                try:
                    if chunk.text:
                        yield chunk.text
                except Exception:
                    # If chunk.text fails (e.g. safety block), log and skip or yield empty string
                    # Often "ValueError: The `text` field is only valid for..."
                    logger.warning(f"{self.agent_name}: Chunk blocked or empty. Safety ratings: {chunk.prompt_feedback}")
                    continue

        except Exception as e:
            logger.error(f"{self.agent_name} Gemini API stream failed: {e}")
            # Don't crash the stream, just log
            yield ""

    @abstractmethod
    async def execute(self, *args, **kwargs) -> Dict[str, Any]:
        """
        Execute agent's primary function.
        Must be implemented by subclasses.
        """
        pass
