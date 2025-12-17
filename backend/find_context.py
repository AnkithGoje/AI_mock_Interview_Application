
try:
    from livekit.agents import llm
    print(f"llm members: {dir(llm)}")
    
    if hasattr(llm, 'FunctionContext'):
        print("Found FunctionContext in llm")
    
    import inspect
    print(f"llm.function_tool is {llm.function_tool}")
    
except ImportError as e:
    print(f"ImportError: {e}")
