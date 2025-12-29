"""List available Gemini models"""

import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

print("=== Available Gemini Models ===\n")
for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(f"✅ {model.name}")
        print(f"   Display Name: {model.display_name}")
        print(f"   Supported: {', '.join(model.supported_generation_methods)}")
        print()
