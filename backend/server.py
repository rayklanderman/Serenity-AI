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

# =====================================================
# MULTI-PROVIDER LLM SUPPORT (Groq + Qwen)
# =====================================================

# Primary: Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None
try:
    from groq import Groq
    if GROQ_API_KEY:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print(f"✅ Groq initialized: {GROQ_API_KEY[:20]}...")
    else:
        print("⚠️ No GROQ_API_KEY - Groq disabled")
except ImportError:
    print("⚠️ Groq package not installed")

# Fallback: Qwen via DashScope (OpenAI-compatible)
QWEN_API_KEY = os.getenv("QWEN_API_KEY")
qwen_client = None
try:
    from openai import OpenAI
    if QWEN_API_KEY:
        qwen_client = OpenAI(
            api_key=QWEN_API_KEY,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        print(f"✅ Qwen initialized via DashScope")
    else:
        print("⚠️ No QWEN_API_KEY - Qwen disabled")
except ImportError:
    print("⚠️ OpenAI package not installed (needed for Qwen)")

# Model names
GROQ_MODEL = "llama-3.3-70b-versatile"
QWEN_MODEL = "qwen-plus"  # Good balance of quality and speed

# Unified LLM call function with fallback
async def call_llm(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    """Call LLM with automatic fallback from Groq to Qwen."""
    
    # Try Groq first (faster)
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"⚠️ Groq failed: {e}, trying Qwen...")
    
    # Fallback to Qwen
    if qwen_client:
        try:
            response = qwen_client.chat.completions.create(
                model=QWEN_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Qwen also failed: {e}")
    
    # Both failed - return error message
    return "I'm having trouble connecting right now. Please try again in a moment."

# Legacy compatibility
client = groq_client
MODEL = GROQ_MODEL

app = FastAPI(
    title="SerenityAI API",
    description="Mental Wellness Companion - Hybrid JacLang + FastAPI Backend",
    version="1.0.0"
)

# CORS for frontend - explicitly allow production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://serenity-ai.vercel.app",
        "https://serenity-ai-gules.vercel.app",
        "https://serenityai.qzz.io",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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
    """Generate dynamic, mood-specific mindfulness prompts - Generative Agent.
    
    Key principle: Different moods need different approaches:
    - Happy: Maintain, amplify, share gratitude
    - Calm: Deepen peace, extend to other areas
    - Anxious: Ground, breathe, perspective
    - Sad: Validate, gentle hope, small steps
    - Angry: Release safely, understand, redirect
    - Neutral: Explore, discover, energize
    """
    
    # Mood-specific strategies
    mood_strategies = {
        "happy": {
            "goal": "maintain and share your joy",
            "approach": "gratitude amplification",
            "tone": "celebratory and warm",
            "example_prompts": [
                "What specific moment sparked this happiness? How can you create more of these?",
                "Who would you love to share this good mood with today?",
                "What simple thing could you do right now to extend this feeling?"
            ]
        },
        "calm": {
            "goal": "deepen your inner peace",
            "approach": "mindful presence",
            "tone": "gentle and contemplative",
            "example_prompts": [
                "Let this calm wash over you. What does your body feel like in this peaceful state?",
                "Is there an area of your life where this calmness could bring clarity?",
                "What sound, sight, or sensation is anchoring you in this moment?"
            ]
        },
        "anxious": {
            "goal": "ground yourself and find perspective",
            "approach": "grounding and gentle reassurance",
            "tone": "soothing and practical",
            "example_prompts": [
                "Name 5 things you can see right now. Let's come back to this moment together.",
                "What's one small thing within your control right now? Focus just on that.",
                "This feeling will pass. What has helped you through anxious moments before?"
            ]
        },
        "sad": {
            "goal": "honor your feelings while finding gentle light",
            "approach": "validation with gentle hope",
            "tone": "compassionate and understanding",
            "example_prompts": [
                "It's okay to feel this way. What would you say to a friend feeling the same?",
                "Even on hard days, there are tiny moments of okay. Can you find one today?",
                "Your feelings matter. What does your heart need most right now?"
            ]
        },
        "angry": {
            "goal": "release safely and understand the source",
            "approach": "acknowledgment and healthy release",
            "tone": "validating but calming",
            "example_prompts": [
                "Your anger is valid. What boundary was crossed? What do you need?",
                "Imagine putting this anger into a balloon and watching it float away. How does that feel?",
                "Underneath anger often lies hurt. What might be beneath the surface?"
            ]
        },
        "neutral": {
            "goal": "explore what brings you alive",
            "approach": "gentle curiosity",
            "tone": "inviting and curious",
            "example_prompts": [
                "In this neutral space, what would bring a spark of excitement to your day?",
                "What's something you've been curious about but haven't explored yet?",
                "If you could do anything right now with no obligations, what would you choose?"
            ]
        }
    }
    
    strategy = mood_strategies.get(current_mood.lower(), mood_strategies["neutral"])
    
    if not client:
        import random
        return random.choice(strategy["example_prompts"])
    
    try:
        triggers_text = ', '.join(recent_triggers[:5]) if recent_triggers else 'general life events'
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": f"""You are a warm, insightful mindfulness guide. Your approach for someone feeling {current_mood}:
                
GOAL: {strategy['goal']}
APPROACH: {strategy['approach']}  
TONE: {strategy['tone']}

Create a unique, heartfelt mindfulness prompt that:
1. Acknowledges their current emotional state with empathy
2. Offers a specific, actionable reflection or practice
3. Feels personal, never generic or repetitive
4. Is 2-3 sentences, conversational and warm

NEVER use clichés like "take a deep breath" or "this too shall pass" unless truly fitting.
Make each prompt feel like it was written just for them."""},
                {"role": "user", "content": f"Create a mindfulness prompt for someone feeling {current_mood}, dealing with: {triggers_text}"}
            ],
            temperature=0.9,  # Higher for more variety
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"LLM error: {e}")
        import random
        return random.choice(strategy["example_prompts"])

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
    """Mind Coach - Empathetic productivity coaching that respects mental state.
    
    Key Principles:
    1. Mental health comes first - never push productivity at the expense of wellbeing
    2. Be warm and human - not robotic or preachy
    3. Small steps matter - don't overwhelm with big goals
    4. Growth mindset - encourage without forcing
    5. Personalized - adapt to time, mood, and context
    """
    import random
    
    # Time context
    time_context = "morning" if current_hour < 12 else "afternoon" if current_hour < 17 else "evening"
    is_late_night = current_hour >= 22 or current_hour < 6
    
    # Mood understanding
    mood_lower = current_mood.lower()
    is_positive = mood_lower in ["happy", "calm"]
    is_neutral = mood_lower == "neutral"
    is_struggling = mood_lower in ["anxious", "sad", "angry"]
    
    # Mood-specific coaching strategies
    mood_coaching = {
        "happy": {
            "mental_check": random.choice([
                "Your positive energy is wonderful! Let's channel it into something meaningful.",
                "Happiness is fuel for great things. What would you love to accomplish?",
                "Love seeing you in a good place! This is the perfect time for focused work."
            ]),
            "productivity_focus": "leverage this energy for meaningful progress"
        },
        "calm": {
            "mental_check": random.choice([
                "This peaceful state is perfect for deep work. Your mind is clear and ready.",
                "Calmness is a superpower. You can tackle complex tasks with clarity right now.",
                "In this centered state, you're capable of incredible focus."
            ]),
            "productivity_focus": "use this clarity for deep, meaningful work"
        },
        "anxious": {
            "mental_check": random.choice([
                "I see you're feeling anxious. That's okay. Let's take things gently, one small step at a time.",
                "Anxiety can feel overwhelming. Remember: you don't have to do everything. What's ONE tiny thing?",
                "Your wellbeing matters more than any task. Let's focus only on what truly needs attention."
            ]),
            "productivity_focus": "break things into tiny, manageable pieces - no pressure"
        },
        "sad": {
            "mental_check": random.choice([
                "I'm here with you. On days like this, even small accomplishments are victories.",
                "It's okay to move slowly today. What's one gentle thing you can do for yourself?",
                "Sadness is heavy. Be kind to yourself. Any progress today is meaningful."
            ]),
            "productivity_focus": "gentle, self-compassionate micro-steps only"
        },
        "angry": {
            "mental_check": random.choice([
                "I hear you. Anger often has good reasons. Let's channel that energy constructively.",
                "That fire you're feeling? It can fuel action. What needs to change?",
                "Your anger is valid. Let's use this intensity purposefully, not destructively."
            ]),
            "productivity_focus": "channel this energy into constructive action"
        },
        "neutral": {
            "mental_check": random.choice([
                "A neutral state is a clean slate. What would make today feel worthwhile?",
                "No strong emotions pulling you - that's actually great for getting things done.",
                "This is a steady state. What's one thing that would give you a sense of accomplishment?"
            ]),
            "productivity_focus": "set an intentional direction for the day"
        }
    }
    
    coaching = mood_coaching.get(mood_lower, mood_coaching["neutral"])
    
    # Build contextual tips
    tips = []
    
    # Time-appropriate tip (make them more dynamic and less repetitive)
    if is_late_night:
        tips.append({
            "type": "rest",
            "icon": "🌙",
            "title": "Rest is Productive",
            "message": random.choice([
                "Your best work tomorrow depends on rest tonight. Consider winding down.",
                "Late-night productivity is usually borrowed from tomorrow. Time to recharge?",
                "Sleep is when your brain processes and consolidates. Consider calling it a night."
            ])
        })
    elif current_hour >= 6 and current_hour < 9:
        tips.append({
            "type": "morning",
            "icon": "☀️",
            "title": "Morning Power Hour",
            "message": random.choice([
                "Your mind is fresh. What's the ONE most important thing for today?",
                "Morning energy is premium fuel. Don't waste it on emails - tackle something meaningful!",
                "Set one clear intention for today. What will make you feel accomplished?"
            ])
        })
    elif current_hour >= 14 and current_hour < 16:
        tips.append({
            "type": "energy",
            "icon": "🔋",
            "title": "Afternoon Recharge",
            "message": random.choice([
                "Afternoon dip? That's biology, not laziness. A 10-min walk can reset your brain.",
                "If focus is fading, switch to a different type of task - variety sparks energy.",
                "This is a great time for collaborative or creative work. Save deep focus for later."
            ])
        })
    
    # Break reminder (make it more empathetic based on mood)
    if is_working and last_break_minutes > 50:
        if is_struggling:
            tips.append({
                "type": "break",
                "icon": "🌿",
                "title": "Gentle Pause",
                "message": random.choice([
                    "You've been at it for a while. A short break isn't weakness - it's wisdom.",
                    "Step away for a few minutes. Sometimes the best insights come when we rest.",
                    "Your brain needs small breaks to stay healthy. Even 3 minutes helps."
                ])
            })
        else:
            tips.append({
                "type": "break",
                "icon": "🚀",
                "title": "Strategic Break",
                "message": random.choice([
                    "Top performers take breaks every 50-90 min. Time to refresh!",
                    "A 5-minute break now = better focus for the next hour.",
                    "Movement boosts creativity. Quick stretch, then back to it?"
                ])
            })
    
    # Hydration (vary the messages)
    if is_working and last_break_minutes > 40:
        tips.append({
            "type": "hydration",
            "icon": "💧",
            "title": "Hydrate Your Brain",
            "message": random.choice([
                "Your brain is 75% water. A glass now = better thinking in 10 minutes.",
                "Quick hydration check! Even mild dehydration affects focus.",
                "Water break! Your body and mind will thank you."
            ])
        })
    
    # Get personalized AI coaching if available
    if client:
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": f"""You are a warm, wise productivity coach who deeply respects mental health. 
                    
Your coaching style:
- EMPATHETIC: Always acknowledge feelings before suggesting action
- HUMANE: Never pushy or guilt-tripping. Growth happens gently.
- PRACTICAL: Give specific, actionable micro-steps
- ENCOURAGING: Highlight what they're already doing well
- HONEST: Real talk, but delivered with kindness

CURRENT CONTEXT:
- Time: {time_context} ({current_hour}:00)
- Mood: {current_mood} ({'positive energy!' if is_positive else 'needs gentle support' if is_struggling else 'neutral/ready'})
- Working: {is_working}
- Last break: {last_break_minutes} min ago

Your response should be 2-3 sentences max. Be specific, not generic. Make them feel seen and supported."""},
                    {"role": "user", "content": f"Give me one personalized coaching insight that honors my {current_mood} mood while gently encouraging growth."}
                ],
                temperature=0.85,  # Higher for variety
                max_tokens=120
            )
            
            coach_message = response.choices[0].message.content
            tips.append({
                "type": "coach",
                "icon": "🧠",
                "title": "Your Mind Coach",
                "message": coach_message
            })
            
        except Exception as e:
            print(f"Mind coach LLM error: {e}")
    
    # Ensure we always have at least one tip
    if not tips:
        tips.append({
            "type": "encouragement",
            "icon": "💪",
            "title": "You've Got This",
            "message": coaching.get("mental_check", "You're doing great. Take things one step at a time.")
        })
    
    return {
        "productivity_tips": tips,
        "mental_check": coaching["mental_check"],
        "time_greeting": f"Good {time_context}!",
        "productivity_focus": coaching["productivity_focus"]
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

