
from livekit.agents import AgentSession, ChatContext, ChatMessage
print(f"ChatContext append available: {hasattr(ChatContext, 'append')}")
print(f"ChatContext messages property: {hasattr(ChatContext, 'messages')}")
