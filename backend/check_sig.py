
import inspect
from livekit.agents import llm

try:
    sig = inspect.signature(llm.function_tool)
    print(f"Signature of function_tool: {sig}")
except Exception as e:
    print(f"Could not get signature: {e}")

try:
    print(f"Doc of function_tool: {llm.function_tool.__doc__}")
except:
    pass
