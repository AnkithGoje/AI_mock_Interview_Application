# pip install \
#   "livekit-agents[deepgram,openai,cartesia,silero,turn-detector]~=1.0" \
#   "livekit-plugins-noise-cancellation~=0.2" \
#   "python-dotenv"

import json
from typing import Annotated
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, RunContext, llm
from livekit.plugins import (
    groq,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

class Assistant(Agent):
    def __init__(self, user_context: str = "") -> None:
        years_exp = "unknown" # Fallback if parsing fails inside context string
        # Simple extraction for prompt customization if needed, but context string is better

        super().__init__(
        instructions=f"""
You are an AI-powered Mock Interview Voice Agent. You behave exactly like a real senior technical hiring manager.

{user_context}

========================
CRITICAL INSTRUCTION:
========================
When the user says "I am done" or asks for an evaluation/feedback, you MUST:
1.  Stop asking questions.
2.  Call the tool `submit_evaluation` with your honest assessment.
3.  After calling the tool, say a brief polite closing message like: "I've sent your full report to your screen. Best of luck!"
4.  **Do NOT** read the score, decision, or specific feedback items out loud. The user will read them on the screen.

========================
INTERVIEW RULES
========================
1. **Natural Voice Behavior**: Short sentences, natural pauses.
2. **Deep Technical Probing**: Ask "Why?", "What trade-offs?", "Edge cases?".
3. **No Teaching**: Do not explain answers or tutor.
4. **Context Awareness**: tailor your questions to the candidate's experience level ({years_exp} years) and the specific competencies listed above.
5. **No Explanations**: After the candidate answers, DO NOT validate the answer or explain the concept. Move immediately to the next question.
6. **Efficiency**: Keep your responses short. Focus on the interview loop: Ask -> Listen -> Ask.

========================
INTERVIEW FLOW
========================
1. **Greeting**: Welcome the candidate. Wait for their response.
2. **Introduction**: AFTER the candidate responds to the greeting, ask them to introduce themselves.
3. **Project Deep Dive**: MANDATORY. After the introduction, ask: "Go through a project on which you have worked recently?". Probing follow-ups are allowed.
4. **Technical Loop**: Ask 3-4 questions based on their project or competencies. (Ask one by one.)
5. **Behavioral**: 3-4 culture-fit question.
6. **Closing/Evaluation**: Call `submit_evaluation` when finished.
""")

    @llm.function_tool(
        description="Submit the final evaluation report for the candidate. Call this ONLY when the interview is explicitly finished or the user asks for feedback."
    )
    async def submit_evaluation(
        self,
        ctx: RunContext,
        score: Annotated[
            int, "The score out of 10 for the candidate's performance."
        ],
        decision: Annotated[
            str, "The hiring decision: 'Hire', 'No Hire', or 'Strong Hire'."
        ],
        strengths: Annotated[
            list[str], "A list of 2-3 key strengths demonstrated by the candidate."
        ],
        improvements: Annotated[
            list[str], "A list of 2-3 areas for improvement."
        ],
        preparation_steps: Annotated[
            list[str], "A list of recommended preparation steps for future interviews."
        ],
    ):
        # Create packet
        evaluation_data = {
            "type": "BIO_EVALUATION",
            "score": score,
            "decision": decision,
            "strengths": strengths,
            "improvements": improvements,
            "preparation_steps": preparation_steps,
        }
        
        # Publish to room
        print(f"Submitting evaluation: {evaluation_data}")
        await ctx.room.local_participant.publish_data(
            json.dumps(evaluation_data),
            reliable=True,
            topic="evaluation"
        )
        
        return "Evaluation submitted successfully. You can now close the conversation politely."


async def entrypoint(ctx: agents.JobContext):


    session = AgentSession(
        stt=deepgram.STT(model="nova-2"),
        llm=groq.LLM(
            model="llama-3.3-70b-versatile",
        ),
        tts=deepgram.TTS(model="aura-2-odysseus-en"),
        # Tune VAD for better responsiveness
        vad=silero.VAD.load(
            min_speech_duration=0.1,
            min_silence_duration=0.5,
        ),
        # Use simple EOU turn detection for robustness if Multilingual is lagging
        # or stick to Multilingual but with params. 
        # Switching to standard EOU Model for cleaner interrupts.
        turn_detection=MultilingualModel(),
    )

    
    # Start the session first (connects to room)
    await session.start(
        room=ctx.room,
        agent=Assistant(), # Start with default instructions
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(), 
        ), 
    )

    print(f"Waiting for participant...")
    participant = await ctx.wait_for_participant()
    
    # Parse encoded metadata
    metadata = {}
    if participant.metadata:
        try:
            metadata = json.loads(participant.metadata)
        except json.JSONDecodeError:
            print(f"Failed to parse metadata: {participant.metadata}")

    # Extract details
    job_title = metadata.get("jobTitle", "Software Engineer")
    years_exp = metadata.get("yearsExperience", "0")
    competencies = metadata.get("competencies", [])
    
    # Customize prompt
    competencies_text = ", ".join(competencies) if competencies else "General Technical Skills"
    
    user_context = f"""
        YOU ARE INTERVIEWING: {participant.name or 'Candidate'}
        TARGET ROLE: {job_title}
        YEARS OF EXPERIENCE: {years_exp}
        CORE COMPETENCIES TO COVER: {competencies_text}
    """

    print(f"Updating agent with context: {user_context}")
    
    # Update the agent with specific instructions
    session.update_agent(Assistant(user_context=user_context))


    await session.generate_reply(
        instructions="Greet the user by name and welcome them to the interview. Do not ask any questions yet."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))