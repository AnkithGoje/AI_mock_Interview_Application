
import inspect
from livekit.plugins import groq

try:
    sig = inspect.signature(groq.LLM)
    print(f"Signature of groq.LLM: {sig}")
except Exception as e:
    print(f"Could not get signature: {e}")
