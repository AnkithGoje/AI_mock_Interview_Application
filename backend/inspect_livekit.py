
try:
    from livekit.agents import llm
    print(f"llm type: {type(llm)}")
    print(f"llm dir: {dir(llm)}")
    
    try:
        from livekit.agents.llm import function_tool
        print(f"function_tool type: {type(function_tool)}")
        print(f"function_tool dir: {dir(function_tool)}")
    except ImportError as e:
        print(f"ImportError: {e}")
    except Exception as e:
        print(f"Error importing function_tool: {e}")

except ImportError as e:
    print(f"ImportError: {e}")
