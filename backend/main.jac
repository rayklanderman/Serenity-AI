"""
SerenityAI Main Entry Point
Run with: jac serve main.jac
"""

import datetime;

import from byllm.lib { Model }

glob llm = Model(model_name="groq/llama-3.3-70b-versatile");

# =====================================================
# RESPONSE OBJECTS
# =====================================================
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

# =====================================================
# byLLM AGENTS
# =====================================================
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

# =====================================================
# =====================================================
# GRAPH NODES
# GRAPH NODES
# =====================================================
# =====================================================
node Emotion {
    has name: str = "neutral";
    has intensity: int = 5;
    has timestamp: str = "";
    has color: str = "#808080";
    has note: str = "";
}

node Suggestion {
    has content: str = "";
    has suggestion_type: str = "";
    has timestamp: str = "";
}

node JournalEntry {
    has content: str = "";
    has timestamp: str = "";
    has mood_before: int = 5;
    has mood_after: int = 5;
    has ai_insight: str = "";
}

# =====================================================
# =====================================================
# WALKERS (API ENDPOINTS)
# WALKERS (API ENDPOINTS)
# =====================================================
# =====================================================
walker MoodLogger {
    has user_id: str = "";
    has mood_text: str = "";
    has emoji: str = "";

    can log_mood with `root entry {
        analysis = classify_mood(self.mood_text);

        colors = {
            "happy": "#FFD700",
            "sad": "#4169E1",
            "anxious": "#FF6347",
            "calm": "#98FB98",
            "angry": "#DC143C",
            "neutral": "#808080"
        };

        emotion_name = analysis.emotion;
        emotion_color = colors.get(emotion_name, "#808080");
        intensity = analysis.intensity;

        emotion_node = Emotion(
            name=emotion_name,
            intensity=intensity,
            timestamp=str(datetime.datetime.now()),
            color=emotion_color,
            note=self.mood_text
        );

        here ++> emotion_node;

        response = empathy_response(emotion_name, intensity, self.mood_text);

        report {
            "analysis": {
                "emotion": analysis.emotion,
                "intensity": analysis.intensity,
                "triggers": analysis.triggers,
                "sentiment": analysis.sentiment
            },
            "response": response,
            "emotion": {
                "name": emotion_name,
                "intensity": intensity,
                "color": emotion_color
            }
        } ;
    }
}

walker TrendAnalyzer {
    has user_id: str = "";
    has days: int = 7;

    can analyze with `root entry {
        mood_history: list = [];

        for emotion_node in [-->Emotion] {
            mood_history.append(
                {
                    "emotion": emotion_node.name,
                    "intensity": emotion_node.intensity,
                    "timestamp": emotion_node.timestamp
                }
            );
        }

        if len(mood_history) > 0 {
            patterns = detect_patterns(mood_history);
            report {
                "patterns": {
                    "recurring_emotions": patterns.recurring_emotions,
                    "trigger_correlations": patterns.trigger_correlations,
                    "weekly_trend": patterns.weekly_trend,
                    "recommendations": patterns.recommendations
                }
            } ;
        } else {
            report {
                "patterns": {
                    "recurring_emotions": ["neutral"],
                    "trigger_correlations": {},
                    "weekly_trend": "stable",
                    "recommendations": [
                        "Start logging your moods daily",
                        "Try a 5-minute breathing exercise",
                        "Write in your journal before bed"
                    ]
                }
            } ;
        }
    }
}

walker SuggestionGenerator {
    has user_id: str = "";
    has current_mood: str = "neutral";
    has stress_level: int = 5;

    can generate with `root entry {
        recent_triggers: list = [];

        prompt = generate_prompt(self.current_mood, recent_triggers);

        exercise = None;
        if self.stress_level > 5 {
            ex = create_breathing_exercise(self.stress_level);
            exercise = {
                "name": ex.name,
                "steps": ex.steps,
                "duration_seconds": ex.duration_seconds,
                "benefits": ex.benefits
            };
        }

        suggestion_node = Suggestion(
            content=prompt,
            suggestion_type="journal_prompt",
            timestamp=str(datetime.datetime.now())
        );
        here ++> suggestion_node;

        report {"prompt": prompt, "exercise": exercise} ;
    }
}

walker JournalSaver {
    has user_id: str = "";
    has content: str = "";
    has mood_before: int = 5;

    can save with `root entry {
        analysis = classify_mood(self.content);
        mood_after = analysis.intensity;

        journal_node = JournalEntry(
            content=self.content,
            timestamp=str(datetime.datetime.now()),
            mood_before=self.mood_before,
            mood_after=mood_after
        );

        here ++> journal_node;

        response = empathy_response(
            analysis.emotion, mood_after, "After journaling: " + self.content[:100]
        );

        journal_node.ai_insight = response;

        report {
            "entry_id": str(id(journal_node)),
            "mood_change": mood_after - self.mood_before,
            "response": response
        } ;
    }
}

walker HealthCheck {
    can check with `root entry {
        report {
            "status": "healthy",
            "service": "SerenityAI Backend",
            "version": "1.0.0"
        } ;
    }
}
