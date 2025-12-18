# pip install \
#   "livekit-agents[deepgram,openai,cartesia,silero,turn-detector]~=1.0" \
#   "livekit-plugins-noise-cancellation~=0.2" \
#   "python-dotenv"

import json
import asyncio
from typing import Annotated
from dotenv import load_dotenv

from livekit import agents, rtc
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

# --- HELPER CLASSES & FUNCTIONS (SHADOW GRADER) ---

class InterviewState:
    def __init__(self):
        self.question_grades = []  # List of {question, answer, score, feedback, status}
        self.processed_indices = set()

async def grade_interaction(question: str, answer: str):
    """
    Shadow Grader: Grades a single Q&A pair using the powerful 70B model.
    """
    try:
        # UPDATED MODEL: llama-3.1-70b is decommissioned
        grader_llm = groq.LLM(model="llama-3.3-70b-versatile")
        
        system_prompt = """
        You are a Real-Time Interview Grader. Evaluate the Candidate's answer to the Interviewer's question.
        
        Output JSON only:
        {
            "status": "PASS" | "FAIL" | "NEUTRAL",
            "score": (0-10),
            "feedback": "1-sentence constructive feedback."
        }
        """
        
        user_prompt = f"QUESTION: {question}\nCANDIDATE ANSWER: {answer}"
        
        # Robust Context Construction
        chat_ctx = llm.ChatContext()
        # Create messages with list-wrapped content
        sys_msg = llm.ChatMessage(role="system", content=[system_prompt])
        usr_msg = llm.ChatMessage(role="user", content=[user_prompt])
        
        # Try method 1: .messages attribute (standard)
        if hasattr(chat_ctx, "messages") and isinstance(chat_ctx.messages, list):
            chat_ctx.messages.append(sys_msg)
            chat_ctx.messages.append(usr_msg)
        # Try method 2: .items attribute (observed in logs)
        elif hasattr(chat_ctx, "items") and isinstance(chat_ctx.items, list):
            chat_ctx.items.append(sys_msg)
            chat_ctx.items.append(usr_msg)
        # Try method 3: append method (builder)
        elif hasattr(chat_ctx, "append"):
             chat_ctx.append(text=system_prompt, role="system")
             chat_ctx.append(text=user_prompt, role="user")
        # Try method 4: It behaves like a list itself
        elif isinstance(chat_ctx, list):
            chat_ctx.append(sys_msg)
            chat_ctx.append(usr_msg)
        else:
            print("WARNING: Could not figure out how to add messages to ChatContext. Trying manual list assignment.")
            try:
                chat_ctx.messages = [sys_msg, usr_msg]
            except:
                pass
        
        # FIX: Do not await the stream creation
        stream = grader_llm.chat(chat_ctx=chat_ctx)
        result_text = ""
        async for chunk in stream:
            content = ""
            # Case 1: Standard .choices[0].delta.content
            if hasattr(chunk, "choices") and chunk.choices:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                   content = delta.content
            # Case 2: User suggested .delta (could be string or object)
            elif hasattr(chunk, "delta"):
                if isinstance(chunk.delta, str):
                    content = chunk.delta
                elif hasattr(chunk.delta, "content"):
                     content = chunk.delta.content
            # Case 3: Direct .content
            elif hasattr(chunk, "content") and isinstance(chunk.content, str):
                 content = chunk.content
            
            if content:
                print(f"DEBUG: Chunk content: {content}", end="")
                result_text += content
                
        # Clean and Parse
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        if not result_text.strip():
             return None

        data = json.loads(result_text)
        
        # Add context
        data["question"] = question
        data["answer"] = answer
        
        print(f"Shadow Grader Result: {data}")
        return data

    except Exception as e:
        print(f"Shadow Grading Failed: {e}")
        return None

async def monitor_chat(agent: Agent, state: InterviewState):
    """
    Background Task: Watches the chat history and dispatches Shadow Grader tasks
    whenever a new Q&A pair is confirmed.
    """
    print("Shadow Grader Monitor Started...")
    try:
        while True:
            await asyncio.sleep(2) # Check every 2 seconds
            
            # Helper to get messages safely
            messages = []
            if hasattr(agent.chat_ctx, "messages"):
                messages = agent.chat_ctx.messages
            elif hasattr(agent.chat_ctx, "items"):
                val = agent.chat_ctx.items
                if callable(val):
                    messages = val()
                else:
                    messages = val
            
            # Ensure it is a list
            if not isinstance(messages, list):
                 try:
                     messages = list(messages)
                 except:
                     pass

            # We need at least 2 messages to have a Q&A pair
            if len(messages) < 2:
                continue
                
            # Iterate backwards to find completed User turns
            for i in range(len(messages) - 2, -1, -1):
                try:
                    if i in state.processed_indices:
                        continue
                        
                    msg = messages[i]
                    next_msg = messages[i+1]
                    
                    # Robust Role Check (String fallback)
                    msg_role = getattr(msg, "role", "unknown")
                    next_role = getattr(next_msg, "role", "unknown")
                    
                    # Convert to string to avoid Enum/KeyError madness
                    is_user = str(msg_role).lower() == "user"
                    is_assistant = str(next_role).lower() == "assistant" or str(next_role).lower() == "system"
                    
                    if is_user and is_assistant:
                        # Found a new completed turn
                        state.processed_indices.add(i)
                        
                        # Get the Question (The Assistant message BEFORE this User message)
                        question_text = "Intro/Context"
                        if i > 0:
                            prev_msg = messages[i-1]
                            prev_role = getattr(prev_msg, "role", "unknown")
                            if str(prev_role).lower() == "assistant" or str(prev_role).lower() == "system":
                                question_text = getattr(prev_msg, "content", "") or "No content"
                        
                        answer_text = getattr(msg, "content", "") or "No content"
                        
                        if question_text and answer_text:
                            print(f"\n[SHADOW GRADER] Sending Data to Llama-70b:")
                            print(f"   Question: {str(question_text)[:50]}...")
                            print(f"   Answer:   {str(answer_text)[:50]}...")
                            print("-" * 50)
                            
                            # Run grading in background
                            asyncio.create_task(_run_and_save_grade(state, question_text, answer_text))
                except Exception as inner_e:
                    print(f"Error processing message index {i}: {inner_e}")
                    continue
    except asyncio.CancelledError:
        print("Shadow Monitor stopped.")
    except Exception as e:
        print(f"Shadow Monitor Crashed: {e}")

async def _run_and_save_grade(state, q, a):
    grade = await grade_interaction(q, a)
    if grade:
        state.question_grades.append(grade)

# --- SHADOW GRADER LOGIC END ---

async def generate_evaluation(ctx: agents.JobContext, chat_history: list[agents.ChatMessage], interview_type: str, job_title: str, state: InterviewState = None):
    """
    Independent function to generate the evaluation report from the chat history.
    """
    print(f"Starting post-interview analysis...")
    print(f"Using accumulated Shadow Grades: {len(state.question_grades) if state else 0}")

    # 1. Use Shadow Grades to build a very specific prompt
    shadow_summary = ""
    if state and state.question_grades:
        shadow_summary = "DETAILED QUESTION-BY-QUESTION ANALYSIS (Use this to calculate final score):\n"
        for idx, g in enumerate(state.question_grades):
            shadow_summary += f"{idx+1}. Q: {g['question']}\n   Grade: {g['score']}/10 ({g['status']})\n   Feedback: {g['feedback']}\n\n"
    
    # 2. Transcript
    transcript = ""
    for msg in chat_history:
        # ROBUST ROLE CHECK: convert to string, avoid Enum
        role_str = str(getattr(msg, "role", "unknown")).lower()
        role = "Interviewer" if (role_str == "assistant" or role_str == "system") else "Candidate"
        
        content = getattr(msg, "content", "")
        if content:
            transcript += f"{role}: {content}\n"

    # 3. Construct 70B Grading Prompt
    system_prompt = f"""
    You are an expert Interview Grader. You are grading a {job_title} candidate.
    
    {shadow_summary}
    
    TRANSCRIPT SUMMARY:
    {transcript[:2000]}... (truncated for efficiency)
    
    TASK:
    Generate the FINAL JSON Report based heavily on the Per-Question Analysis above.
    
    GRADING RULES:
    1. Be GENUINE and HONEST. Do not inflate scores.
    2. If the user does not answer questions, provides very short responses ("I don't know"), or is off-topic, assign LOW SCORES (0-3).
    3. If the transcript is empty or contains only greetings, assign 0 for all scores and "No Hire".
    4. 'technical_score': Evaluate purely on technical accuracy and depth. Non-answers = 0.
    5. 'problem_solving_score': Evaluate analytical approach. No attempt = 0.
    
    Return valid JSON:
    {{
        "score": (integer 0-10, average of question scores),
        "technical_score": (integer 0-10, specific to technical accuracy),
        "problem_solving_score": (integer 0-10, specific to analytical thinking),
        "decision": ("Hire" | "No Hire" | "Strong Hire"),
        "strengths": ["list", "of", "3", "strengths"],
        "improvements": ["list", "of", "3", "improvements"],
        "preparation_steps": ["step1", "step2"],
        "question_breakdown": [
            {{ "question": "...", "status": "PASS/FAIL", "score": N, "feedback": "..." }}
        ]
    }}
    
    IMPORTANT: The "question_breakdown" array MUST be populated from the Shadow Grades provided.
    """

    print("Sending final compilation request to Llama-70B...")
    # UPDATED MODEL: llama-3.1-70b is decommissioned
    grader_llm = groq.LLM(model="llama-3.3-70b-versatile")
    
    # Robust Context Construction
    chat_ctx = llm.ChatContext()
    sys_msg = llm.ChatMessage(role="system", content=[system_prompt])
    usr_msg = llm.ChatMessage(role="user", content=["Generate Final Report JSON."])
    
    if hasattr(chat_ctx, "messages") and isinstance(chat_ctx.messages, list):
        chat_ctx.messages.append(sys_msg)
        chat_ctx.messages.append(usr_msg)
    elif hasattr(chat_ctx, "items") and isinstance(chat_ctx.items, list):
         chat_ctx.items.append(sys_msg)
         chat_ctx.items.append(usr_msg)
    elif hasattr(chat_ctx, "append"):
         chat_ctx.append(text=system_prompt, role="system")
         chat_ctx.append(text="Generate Final Report JSON.", role="user")
    elif isinstance(chat_ctx, list):
        chat_ctx.append(sys_msg)
        chat_ctx.append(usr_msg)
    else:
        print("WARNING: Could not figure out how to add messages to ChatContext. Trying manual list assignment.")
        try:
            chat_ctx.messages = [sys_msg, usr_msg]
        except:
            pass

    try:
        # FIX: Do not await the stream creation
        stream = grader_llm.chat(chat_ctx=chat_ctx)
        result_text = ""
        async for chunk in stream:
            content = ""
            # Case 1: Standard .choices[0].delta.content
            if hasattr(chunk, "choices") and chunk.choices:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                   content = delta.content
            # Case 2: User suggested .delta (could be string or object)
            elif hasattr(chunk, "delta"):
                if isinstance(chunk.delta, str):
                    content = chunk.delta
                elif hasattr(chunk.delta, "content"):
                     content = chunk.delta.content
            # Case 3: Direct .content
            elif hasattr(chunk, "content") and isinstance(chunk.content, str):
                 content = chunk.content
            
            if content:
                result_text += content
        
        print(f"Raw 70B Output: {result_text[:100]}...")
        
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        evaluation_data = json.loads(result_text)
        evaluation_data["type"] = "BIO_EVALUATION"
        return evaluation_data

    except Exception as e:
        print(f"Final Grading Failed: {e}")
        return {
            "type": "BIO_EVALUATION",
            "score": int(sum(g['score'] for g in state.question_grades)/len(state.question_grades)) if state and state.question_grades else 0,
            "technical_score": 0,
            "problem_solving_score": 0,
            "decision": "Pending Review",
            "strengths": ["Review Transcript"],
            "improvements": ["Check Audio"],
            "preparation_steps": ["Retry"],
            "question_breakdown": state.question_grades if state else []
        }

# --- ASSISTANT AGENT ---

class Assistant(Agent):
    def __init__(self, user_context: str = "", interview_type: str = "technical") -> None:
        years_exp = "unknown"
        
        prompts = {
            "technical": f"""
You are an AI-powered Mock Interview Voice Agent. You behave exactly like a real senior technical hiring manager.

{user_context}

========================
INTERVIEW RULES
========================
1. **Natural Voice Behavior**: Short sentences, natural pauses.
2. **Deep Technical Probing**: Ask "Why?", "What trade-offs?", "Edge cases?".
3. **No Teaching**: Do not explain answers or tutor.
4. **Context Awareness**: tailor your questions to the candidate's experience level ({years_exp} years).
5. **No Explanations**: Move immediately to the next question.
6. **Efficiency**: Keep your responses short.

========================
INTERVIEW FLOW
========================
1. **Greeting**: Welcome the candidate. Wait for their response.
2. **Introduction**: Ask them to introduce themselves.
3. **Project Deep Dive**: Ask: "Go through a project on which you have worked recently?".
4. **Technical Loop**: Ask 3-4 questions based on their project or competencies.
5. **Behavioral**: Ask 1-2 culture-fit questions.
6. **Closing**: When the user is done, say a polite goodbye and stop asking questions.
""",
            "hr": f"""
You are an AI-powered HR Interviewer.

{user_context}

========================
INTERVIEW RULES
========================
1. **Professional & Friendly**: Warm tone.
2. **Focus on Fit**: No technical code questions.
3. **Efficiency**: Keep responses concise.

========================
INTERVIEW FLOW
========================
1. **Greeting**: Welcome the candidate.
2. **Introduction**: Intro.
3. **Motivation**: Why this role?
4. **Logistics**: Notice period, location, salary.
5. **Strengths/Weaknesses**: Key strengths/weakness.
6. **Closing**: When the user is done, say a polite goodbye and stop asking questions.
""",
            "behavioral": f"""
You are an AI-powered Senior Manager conducting a Behavioral Interview.

{user_context}

========================
INTERVIEW RULES
========================
1. **STAR Method**: Look for Situation, Task, Action, Result.
2. **Focus on Soft Skills**: Leadership, conflict, teamwork.
3. **Efficiency**: Keep responses concise.

========================
INTERVIEW FLOW
========================
1. **Greeting**: Welcome.
2. **Introduction**: Intro.
3. **Scenario 1**: Conflict/Challenge.
4. **Scenario 2**: Leadership/Initiative.
5. **Scenario 3**: Failure/learning.
6. **Closing**: When the user is done, say a polite goodbye and stop asking questions.
"""
        }

        selected_instructions = prompts.get(interview_type.lower(), prompts["technical"])
        super().__init__(instructions=selected_instructions)


# --- MAIN ENTRYPOINT ---

async def entrypoint(ctx: agents.JobContext):
    try:
        print("Entrypoint started. Initializing...")
        
        # Initialize Job-Specific State
        state = InterviewState()

        session = AgentSession(
            stt=deepgram.STT(model="nova-2"),
            llm=groq.LLM(
                model="llama-3.1-8b-instant",
            ),
            tts=deepgram.TTS(model="aura-2-odysseus-en"),
            vad=silero.VAD.load(
                min_speech_duration=0.1,
                min_silence_duration=0.5,
            ),
            turn_detection=MultilingualModel(),
        )

        # Custom Agent Instance
        assistant = Assistant()

        # Start the session first (connects to room)
        await session.start(
            room=ctx.room,
            agent=assistant, # Use our instance
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(), 
            ), 
        )

        print(f"Waiting for participant...")
        try:
            participant = await ctx.wait_for_participant()
        except Exception as e:
             print(f"Wait for participant failed: {e}")
             return

        # Parse encoded metadata
        metadata = {}
        for _ in range(10): 
            if participant.metadata:
                try:
                    temp_meta = json.loads(participant.metadata)
                    if temp_meta.get("interviewType"):
                        metadata = temp_meta
                        print(f"DEBUG: Found valid metadata: {metadata}")
                        break
                except json.JSONDecodeError:
                    pass
            await asyncio.sleep(0.5)
        
        if not metadata and participant.metadata:
            try:
                 metadata = json.loads(participant.metadata)
            except:
                 pass

        # Extract details
        job_title = metadata.get("jobTitle", "Software Engineer")
        years_exp = metadata.get("yearsExperience", "0")
        competencies = metadata.get("competencies", [])
        interview_type = metadata.get("interviewType", "technical")
        
        competencies_text = ", ".join(competencies) if competencies else "General Technical Skills"
        
        user_context = f"""
            YOU ARE INTERVIEWING: {participant.name or 'Candidate'}
            TARGET ROLE: {job_title}
            YEARS OF EXPERIENCE: {years_exp}
            CORE COMPETENCIES TO COVER: {competencies_text}
            INTERVIEW TYPE: {interview_type.upper()}
        """

        print(f"Updating agent with context: {user_context} | Type: {interview_type}")
        
        # Update the agent with specific instructions and interview type
        # We must create a NEW instance or update the existing one? 
        # Easier to create new with context, but we need to keep reference consistent?
        # Actually session.update_agent takes a new instance.
        # But for chat_ctx, does it persist? 
        # Typically chat context is tied to the SESSION/Job, not just the agent object.
        # Let's try accessing chat_ctx from the assistant object we just created.
        
        assistant = Assistant(user_context=user_context, interview_type=interview_type)
        session.update_agent(assistant)
        print("Agent logic updated.")
        
        # Start Background Monitor - PASS THE AGENT, NOT THE SESSION
        asyncio.create_task(monitor_chat(assistant, state))
        print("Shadow Grader background task started.")

        # Handle incoming data from frontend
        @ctx.room.on("data_received")
        def on_data_received(data: rtc.DataPacket):
            
            async def _handle_packet(packet_data):
                try:
                    payload = packet_data.data.decode("utf-8")
                    print(f"DEBUG: Agent received data packet: {payload}")
                    
                    if payload == "generate_report":
                        print("DEBUG: Starting Report Generation Sequence...")
                        
                        # Inspect context safely
                        chat_history = []
                        if hasattr(assistant.chat_ctx, "messages"):
                            chat_history = assistant.chat_ctx.messages
                        elif hasattr(assistant.chat_ctx, "items"):
                             val = assistant.chat_ctx.items
                             if callable(val):
                                 chat_history = val()
                             else:
                                 chat_history = val
                        else:
                             print("WARNING: Could not find chat history items.")
                        
                        print(f"DEBUG: Extracted {len(chat_history)} messages for context.")
                        
                        evaluation_json = await generate_evaluation(
                            ctx, 
                            chat_history, 
                            interview_type=interview_type, 
                            job_title=job_title,
                            state=state
                        )
                        
                        print(f"DEBUG: Evaluation Generated. Keys: {list(evaluation_json.keys())}")
                        
                        json_str = json.dumps(evaluation_json)
                        print(f"DEBUG: Publishing JSON payload ({len(json_str)} chars)...")
                        
                        await ctx.room.local_participant.publish_data(
                            json_str,
                            reliable=True,
                            topic="evaluation"
                        )
                        print("DEBUG: Data Published successfully.")
                        
                except Exception as e:
                    print(f"CRITICAL: Failed to process incoming data: {e}")
                    import traceback
                    traceback.print_exc()

            # Dispatch background task
            asyncio.create_task(_handle_packet(data))

        print("Generating welcome greeting...")
        await session.generate_reply(
            instructions="Greet the user by name and welcome them to the interview. Speak the greeting verbally. Do NOT call any tools or functions."
        )
        print("Greeting generated.")
        
    except Exception as full_crash:
        print(f"CRITICAL AGENT CRASH: {full_crash}")
        import traceback
        traceback.print_exc() 

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))