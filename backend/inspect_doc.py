
try:
    from livekit.agents.llm import function_tool
    print(function_tool.__doc__)
except ImportError:
    pass
