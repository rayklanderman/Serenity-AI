"""
SerenityAI Backend Server - Hybrid Approach
FastAPI server that demonstrates JacLang concepts while using Groq for LLM

This approach:
- Uses design patterns inspired by JacLang OSP Graph concepts
- Uses Groq API directly for reliable LLM responses
- Exposes REST endpoints matching walker names
"""

import os
import json
import re
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Note: JacLang files (main.jac, models.jac, walkers.jac, agents.jac) 
# define the OSP graph structure and agent concepts
# This server implements those patterns using Python/FastAPI

load_dotenv()

# Initialize Groq client
try:
    from groq import Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    print(f"✅ Groq initialized with key: {GROQ_API_KEY[:20]}..." if GROQ_API_KEY else "❌ No Groq API key")
except ImportError:
    client = None
    print("❌ Groq package not installed")

MODEL = "llama-3.3-70b-versatile"

app = FastAPI(
    title="SerenityAI API",
    description="Mental Wellness Companion - Hybrid JacLang + FastAPI Backend",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# REQUEST MODELS (match Walker has fields)
# =====================================================

class MoodLogRequest(BaseModel):
    user_id: str = ""
    mood_text: str = ""
    emoji: str = ""

class TrendRequest(BaseModel):
    user_id: str = ""
    days: int = 7

class SuggestionRequest(BaseModel):
    user_id: str = ""
    current_mood: str = "neutral"
    stress_level: int = 5

class JournalRequest(BaseModel):
    user_id: str = ""
    content: str = ""
    mood_before: int = 5

class MindCoachRequest(BaseModel):
    user_id: str = ""
    current_mood: str = "neutral"
    current_hour: int = 12  # 0-23 hour
    last_break_minutes: int = 60
    is_working: bool = True

# =====================================================
# IN-MEMORY GRAPH (simulates OSP Graph)
# =====================================================

# This simulates the OSP graph storage
user_graphs: dict = {}

def get_user_graph(user_id: str) -> dict:
    """Get or create user's emotion graph."""
    if user_id not in user_graphs:
        user_graphs[user_id] = {
            "emotions": [],
            "suggestions": [],
            "journal_entries": []
        }
    return user_graphs[user_id]

# =====================================================
# byLLM AGENT FUNCTIONS (Groq implementation)
# =====================================================

def empathy_response(emotion: str, intensity: int, context: str) -> str:
    """Generate warm supportive response - Generative Agent."""
    if not client:
        return f"I understand you're feeling {emotion}. Take a deep breath and remember this moment will pass."
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a compassionate mental wellness companion."},
                {"role": "user", "content": f"Generate a warm, empathetic response for someone feeling {emotion} at intensity {intensity}/10. Context: {context}. Be supportive and suggest one helpful coping strategy. Keep response under 100 words."}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq error: {e}")
        return f"I hear you. Feeling {emotion} is valid. Consider taking a few deep breaths."

def classify_mood(text: str) -> dict:
    """Analyze text and classify emotion - Analytical Agent."""
    if not client:
        return {"emotion": "neutral", "intensity": 5, "triggers": [], "sentiment": "neutral"}
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You analyze emotions. Respond with ONLY valid JSON."},
                {"role": "user", "content": f"""Analyze this text and return JSON:
{{"emotion": "happy/sad/anxious/calm/angry/neutral", "intensity": 1-10, "triggers": ["list"], "sentiment": "positive/negative/neutral"}}

Text: {text}"""}
            ],
            temperature=0.3,
            max_tokens=200
        )
        content = response.choices[0].message.content
        # Parse JSON from response
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
        return {"emotion": "neutral", "intensity": 5, "triggers": [], "sentiment": "neutral"}
    except Exception as e:
        print(f"Groq error: {e}")
        return {"emotion": "neutral", "intensity": 5, "triggers": [], "sentiment": "neutral"}

def detect_patterns(mood_history: list) -> dict:
    """Detect patterns in mood history - Analytical Agent."""
    if not client or not mood_history:
        return {
            "recurring_emotions": ["neutral"],
            "trigger_correlations": {},
            "weekly_trend": "stable",
            "recommendations": ["Log moods daily", "Try breathing exercises", "Journal before bed"]
        }
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You analyze mood patterns. Respond with ONLY valid JSON."},
                {"role": "user", "content": f"""Analyze mood history and return JSON:
{{"recurring_emotions": ["list"], "trigger_correlations": {{}}, "weekly_trend": "improving/declining/stable", "recommendations": ["tip1", "tip2", "tip3"]}}

History: {json.dumps(mood_history[:10])}"""}
            ],
            temperature=0.3,
            max_tokens=300
        )
        content = response.choices[0].message.content
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print(f"Groq error: {e}")
    
    return {
        "recurring_emotions": ["neutral"],
        "trigger_correlations": {},
        "weekly_trend": "stable",
        "recommendations": ["Practice gratitude", "Take short walks", "Stay hydrated"]
    }

def generate_prompt(current_mood: str, recent_triggers: list) -> str:
    """Generate journaling prompt - Generative Agent."""
    if not client:
        return f"What made you feel {current_mood} today? Reflect on one positive moment."
    
    try:
        triggers_text = ', '.join(recent_triggers[:5]) if recent_triggers else 'general life events'
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a gentle journaling guide."},
                {"role": "user", "content": f"Create a thoughtful journaling prompt for someone feeling {current_mood} dealing with: {triggers_text}. Be introspective but gentle. 2-3 sentences only."}
            ],
            temperature=0.8,
            max_tokens=100
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq error: {e}")
        return "What small moment brought you peace today?"

def create_breathing_exercise(stress_level: int) -> dict:
    """Create breathing exercise - Generative Agent."""
    if not client:
        return {
            "name": "4-7-8 Relaxation",
            "steps": ["Inhale for 4 seconds", "Hold for 7 seconds", "Exhale for 8 seconds"],
            "duration_seconds": 120,
            "benefits": "Activates parasympathetic nervous system"
        }
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Create breathing exercises. Respond with ONLY valid JSON."},
                {"role": "user", "content": f"""Create a breathing exercise for stress level {stress_level}/10. Return JSON:
{{"name": "string", "steps": ["step1", "step2", "step3"], "duration_seconds": number, "benefits": "string"}}"""}
            ],
            temperature=0.5,
            max_tokens=200
        )
        content = response.choices[0].message.content
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
    except Exception as e:
        print(f"Groq error: {e}")
    
    return {
        "name": "Box Breathing",
        "steps": ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"],
        "duration_seconds": 120,
        "benefits": "Reduces stress and anxiety"
    }

def mind_coach(current_mood: str, current_hour: int, last_break_minutes: int, is_working: bool) -> dict:
    """Mind Coach - Productivity coaching agent that considers mental state."""
    # Time-based context
    time_context = "morning" if current_hour < 12 else "afternoon" if current_hour < 17 else "evening"
    
    # Default tips based on time and state
    base_tips = []
    
    # Hydration reminder
    if is_working and last_break_minutes > 45:
        base_tips.append({
            "type": "hydration",
            "icon": "💧",
            "title": "Stay Hydrated",
            "message": "You've been working for a while. Take a moment to drink some water!"
        })
    
    # Break reminder
    if is_working and last_break_minutes > 60:
        base_tips.append({
            "type": "break",
            "icon": "⏰",
            "title": "Time for a Break",
            "message": "Consider a 5-minute stretch. Short breaks boost productivity!"
        })
    
    # Time-based tips
    if current_hour >= 21:
        base_tips.append({
            "type": "sleep",
            "icon": "😴",
            "title": "Wind Down Time",
            "message": "It's getting late. Consider winding down for better sleep quality."
        })
    elif current_hour >= 14 and current_hour < 16:
        base_tips.append({
            "type": "energy",
            "icon": "☕",
            "title": "Afternoon Slump",
            "message": "Afternoon energy dip is normal. A short walk or light snack can help!"
        })
    
    if not client:
        return {
            "productivity_tips": base_tips if base_tips else [{
                "type": "general",
                "icon": "✨",
                "title": "Stay Focused",
                "message": "You're doing great! Keep up the good work."
            }],
            "mental_check": f"Feeling {current_mood} is okay. Take things at your own pace.",
            "time_greeting": f"Good {time_context}!"
        }
    
    try:
        # Get personalized coaching from LLM
        mood_context = "positive" if current_mood in ["happy", "calm"] else "challenging" if current_mood in ["anxious", "sad", "angry"] else "neutral"
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": """You are a supportive mind coach. Be brief, warm, and practical. 
Consider the person's mental state before giving productivity advice. 
If they're stressed, prioritize wellbeing over productivity."""},
                {"role": "user", "content": f"""It's {time_context}. User is feeling {current_mood} ({"positive" if mood_context == "positive" else "needs support"}).
{"They're working and" if is_working else ""} Last break was {last_break_minutes} minutes ago.

Give ONE brief, supportive coaching tip (under 50 words) that:
- Acknowledges their current mood
- Suggests something helpful (break/hydration/sleep/task management)
- Is mindful of their mental state"""}
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        coach_message = response.choices[0].message.content
        
        return {
            "productivity_tips": base_tips + [{
                "type": "coach",
                "icon": "🎯",
                "title": "Your Mind Coach",
                "message": coach_message
            }],
            "mental_check": f"I see you're feeling {current_mood}. " + ("That's wonderful!" if mood_context == "positive" else "I'm here to support you."),
            "time_greeting": f"Good {time_context}!"
        }
        
    except Exception as e:
        print(f"Mind coach error: {e}")
        return {
            "productivity_tips": base_tips,
            "mental_check": f"Feeling {current_mood} is valid. Take things one step at a time.",
            "time_greeting": f"Good {time_context}!"
        }

# =====================================================
# WALKER ENDPOINTS (match Jac walker names)
# =====================================================

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "SerenityAI Backend", "version": "1.0.0"}

@app.post("/walker/HealthCheck")
async def walker_health_check():
    """HealthCheck walker."""
    return {
        "result": {},
        "reports": [{"status": "healthy", "service": "SerenityAI Backend", "version": "1.0.0"}]
    }

@app.post("/walker/MoodLogger")
async def walker_mood_logger(request: MoodLogRequest):
    """MoodLogger walker - logs mood and returns AI response."""
    try:
        # Classify mood (Analytical Agent)
        analysis = classify_mood(request.mood_text)
        
        # Get emotion details
        colors = {
            "happy": "#FFD700", "sad": "#4169E1", "anxious": "#FF6347",
            "calm": "#98FB98", "angry": "#DC143C", "neutral": "#808080"
        }
        emotion_name = analysis.get("emotion", "neutral")
        emotion_color = colors.get(emotion_name, "#808080")
        intensity = analysis.get("intensity", 5)
        
        # Create emotion node in graph (OSP concept)
        graph = get_user_graph(request.user_id)
        emotion_node = {
            "name": emotion_name,
            "intensity": intensity,
            "timestamp": datetime.now().isoformat(),
            "color": emotion_color,
            "note": request.mood_text
        }
        graph["emotions"].append(emotion_node)
        
        # Generate response (Generative Agent)
        response = empathy_response(emotion_name, intensity, request.mood_text)
        
        return {
            "result": {},
            "reports": [{
                "analysis": analysis,
                "response": response,
                "emotion": {"name": emotion_name, "intensity": intensity, "color": emotion_color}
            }]
        }
    except Exception as e:
        print(f"MoodLogger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/walker/TrendAnalyzer")
async def walker_trend_analyzer(request: TrendRequest):
    """TrendAnalyzer walker - analyzes mood patterns."""
    try:
        # Get mood history from graph (OSP traversal)
        graph = get_user_graph(request.user_id)
        mood_history = [{"emotion": e["name"], "intensity": e["intensity"], "timestamp": e["timestamp"]} 
                       for e in graph["emotions"]]
        
        # Detect patterns (Analytical Agent)
        patterns = detect_patterns(mood_history)
        
        return {
            "result": {},
            "reports": [{"patterns": patterns}]
        }
    except Exception as e:
        print(f"TrendAnalyzer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/walker/SuggestionGenerator")
async def walker_suggestion_generator(request: SuggestionRequest):
    """SuggestionGenerator walker - generates personalized suggestions."""
    try:
        # Get recent triggers (OSP traversal)
        graph = get_user_graph(request.user_id)
        recent_triggers = []
        for e in graph["emotions"][-5:]:
            # Would traverse trigger edges in real OSP
            pass
        
        # Generate prompt (Generative Agent)
        prompt = generate_prompt(request.current_mood, recent_triggers)
        
        # Create exercise if stressed (Generative Agent)
        exercise = None
        if request.stress_level > 5:
            exercise = create_breathing_exercise(request.stress_level)
        
        # Store suggestion in graph
        graph["suggestions"].append({
            "content": prompt,
            "type": "journal_prompt",
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "result": {},
            "reports": [{"prompt": prompt, "exercise": exercise}]
        }
    except Exception as e:
        print(f"SuggestionGenerator error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/walker/JournalSaver")
async def walker_journal_saver(request: JournalRequest):
    """JournalSaver walker - saves journal entry with AI insight."""
    try:
        # Analyze journal (Analytical Agent)
        analysis = classify_mood(request.content)
        mood_after = analysis.get("intensity", 5)
        
        # Generate insight (Generative Agent)
        response = empathy_response(
            analysis.get("emotion", "neutral"),
            mood_after,
            f"After journaling: {request.content[:100]}"
        )
        
        # Store in graph (OSP concept)
        graph = get_user_graph(request.user_id)
        journal_node = {
            "content": request.content,
            "timestamp": datetime.now().isoformat(),
            "mood_before": request.mood_before,
            "mood_after": mood_after,
            "ai_insight": response
        }
        graph["journal_entries"].append(journal_node)
        
        return {
            "result": {},
            "reports": [{
                "entry_id": str(len(graph["journal_entries"])),
                "mood_change": mood_after - request.mood_before,
                "response": response
            }]
        }
    except Exception as e:
        print(f"JournalSaver error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# List walkers (for compatibility)
@app.get("/walkers")
async def list_walkers():
    return {"walkers": ["HealthCheck", "MoodLogger", "TrendAnalyzer", "SuggestionGenerator", "JournalSaver", "MindCoach"]}

@app.post("/walker/MindCoach")
async def walker_mind_coach(request: MindCoachRequest):
    """MindCoach walker - productivity coaching with mental state awareness."""
    try:
        result = mind_coach(
            current_mood=request.current_mood,
            current_hour=request.current_hour,
            last_break_minutes=request.last_break_minutes,
            is_working=request.is_working
        )
        
        return {
            "result": {},
            "reports": [result]
        }
    except Exception as e:
        print(f"MindCoach error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting SerenityAI Hybrid Backend")
    print("   Jac files: main.jac, models.jac, walkers.jac, agents.jac")
    print("   LLM: Groq llama-3.3-70b-versatile")
    print("   Server: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
 
 