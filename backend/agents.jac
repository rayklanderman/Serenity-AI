"""
SerenityAI Agent Definitions
byLLM-powered agents for mental wellness companion
"""

import from byllm.lib { Model }

glob llm = Model(model_name="groq/llama-3.3-70b-versatile");

# Response objects
obj MoodAnalysis {
    has emotion: str = "neutral";
    has intensity: int = 5;
    has triggers: list = [];
    has sentiment: str = "neutral";
}

obj PatternResult {
    has recurring_emotions: list = [];
    has trigger_correlations: dict = {};
    has weekly_trend: str = "stable";
    has recommendations: list = [];
}

obj BreathingExercise {
    has name: str = "";
    has steps: list = [];
    has duration_seconds: int = 120;
    has benefits: str = "";
}

"""Generate warm supportive response for the given emotion."""
def empathy_response(emotion: str, intensity: int, context: str) -> str by llm();

"""Analyze text and classify emotion."""
def classify_mood(text: str) -> MoodAnalysis by llm();

"""Detect patterns in mood history."""
def detect_patterns(mood_history: list) -> PatternResult by llm();

"""Create thought journaling prompt."""
def generate_prompt(current_mood: str, recent_triggers: list) -> str by llm();

"""Create breathing exercise for stress level."""
def create_breathing_exercise(stress_level: int) -> BreathingExercise by llm();
