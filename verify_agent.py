
try:
    print("Importing backend.agent...")
    import backend.agent
    print("Successfully imported backend.agent")
except Exception as e:
    print(f"Failed to import backend.agent: {e}")
    import traceback
    traceback.print_exc()
