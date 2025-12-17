
try:
    from livekit.agents import llm
    
    if hasattr(llm, 'ToolContext'):
        print("llm.ToolContext exists.")
    else:
        print("llm.ToolContext DOES NOT exist.")
        
    if hasattr(llm, 'ai_callable'):
        print("llm.ai_callable exists.")
    else:
        print("llm.ai_callable DOES NOT exist.")
        
    # Check if we can use function_tool as a decorator directly
    from livekit.agents.llm import function_tool
    print(f"function_tool type: {type(function_tool)}")
    
except ImportError as e:
    print(f"ImportError: {e}")
