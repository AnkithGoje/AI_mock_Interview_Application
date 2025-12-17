
from livekit.agents import AgentSession
print(f"AgentSession dir: {dir(AgentSession)}")
try:
    s = AgentSession()
    print(f"Instance attrs: {dir(s)}")
except:
    pass
