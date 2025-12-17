
from livekit.agents import Agent
print(f"Agent instructions property: {getattr(Agent, 'instructions', 'Not found')}")
try:
    a = Agent(instructions="init")
    print(f"Initial: {a.instructions}")
    a.instructions = "updated"
    print(f"Updated: {a.instructions}")
except Exception as e:
    print(f"Error updating instructions: {e}")
