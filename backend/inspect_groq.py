
try:
    from livekit.plugins import groq
    print(f"groq.LLM constructor:")
    print(groq.LLM.__init__.__doc__)
    
    from livekit.agents import llm
    print(f"\nllm.LLM constructor:")
    print(llm.LLM.__init__.__doc__)

except ImportError as e:
    print(f"ImportError: {e}")
