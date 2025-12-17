
from livekit import agents
# Try standard locations
try:
    from livekit.agents import turn_detection
    print("Found livekit.agents.turn_detection")
except:
    print("No turn_detection module")

# Check if MultilingualModel is available directly
print(f"Attr check: {getattr(agents, 'MultilingualModel', 'Not found')}")
