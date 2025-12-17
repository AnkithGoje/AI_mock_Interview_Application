
try:
    from livekit.agents import turn_detector
    print("Found livekit.agents.turn_detector")
    print(dir(turn_detector))
except ImportError as e:
    print(f"ImportError: {e}")

try:
    import livekit.agents.turn_detector
    print("Imported livekit.agents.turn_detector directly")
except ImportError as e:
    print(f"Direct import failed: {e}")

from livekit import agents
print(f"agents dir: {dir(agents)}")
