
import sys

try:
    import livekit.agents
    print(f"livekit.agents version: {getattr(livekit.agents, '__version__', 'unknown')}")
except ImportError:
    print("livekit.agents not installed")

try:
    from livekit.agents import llm
    print(f"Type of llm: {type(llm)}")
    print(f"Dir of llm: {dir(llm)}")
    
    try:
        from livekit.agents.llm import function_tool
        print(f"Imported function_tool successfully.")
        print(f"Type of function_tool: {type(function_tool)}")
        
        if hasattr(function_tool, 'FunctionContext'):
            print("function_tool.FunctionContext exists.")
        else:
            print("function_tool.FunctionContext DOES NOT exist.")
            print(f"Dir of function_tool: {dir(function_tool)}")
            
    except ImportError as e:
        print(f"Could not import function_tool: {e}")

    try:
        from livekit.agents.llm import FunctionContext
        print("FunctionContext is directly available in llm")
    except ImportError:
        print("FunctionContext is NOT directly available in llm")

except ImportError as e:
    print(f"Could not import livekit.agents.llm: {e}")
except Exception as e:
    print(f"Exception: {e}")
