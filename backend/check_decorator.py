
try:
    from livekit.agents import llm
    print(f"llm.function_tool type: {type(llm.function_tool)}")
    try:
        @llm.function_tool(desc="test")
        def test_func():
            pass
        print("llm.function_tool accepts desc arg.")
    except Exception as e:
        print(f"llm.function_tool failed with desc arg: {e}")

    try:
        @llm.ai_callable(desc="test")
        def test_func_2():
            pass
        print("llm.ai_callable worked.")
    except Exception as e:
        print(f"llm.ai_callable failed: {e}")

except ImportError:
    print("Could not import livekit.agents.llm")
