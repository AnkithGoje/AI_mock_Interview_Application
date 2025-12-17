
from livekit.agents import llm
print(f"llm.ChatContext dir: {dir(llm.ChatContext)}")
try:
    c = llm.ChatContext()
    print(f"ChatContext instance dir: {dir(c)}")
    print(f"ChatContext messages type: {type(c.messages)}")
    c.messages.append(llm.ChatMessage(role=llm.ChatRole.SYSTEM, content="test"))
    print("Successfully appended message")
except Exception as e:
    print(f"Error: {e}")
