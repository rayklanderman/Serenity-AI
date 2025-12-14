"""
SerenityAI Walkers
Graph traversal walkers that use byLLM agents
These become REST API endpoints via `jac serve`
"""

import datetime;

include models;
include agents;

# =====================================================
# WALKER: MoodLogger
# Endpoint: POST /walker/MoodLogger
# =====================================================

walker MoodLogger {
    has user_id: str = "";
    has mood_text: str = "";
    has emoji: str = "";
    
    can log_mood with `root entry {
        # Analyze the mood using byLLM agent
        analysis = classify_mood(self.mood_text);
        
        # Get emotion color
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
        
        # Create emotion node and connect to graph
        emotion_node = Emotion(
            name=emotion_name,
            intensity=intensity,
            timestamp=str(datetime.datetime.now()),
            color=emotion_color,
            note=self.mood_text
        );
        
        # Connect to root (user's graph)
        here ++> emotion_node;
        
        # Generate empathetic response using byLLM agent
        response = empathy_response(
            emotion_name,
            intensity,
            self.mood_text
        );
        
        # Report results back to client
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
        };
    }
}

# =====================================================
# WALKER: TrendAnalyzer
# Endpoint: POST /walker/TrendAnalyzer
# =====================================================

walker TrendAnalyzer {
    has user_id: str = "";
    has days: int = 7;
    
    can analyze with `root entry {
        # Collect recent emotions from graph
        mood_history: list = [];
        
        for emotion_node in [--> Emotion] {
            mood_history.append({
                "emotion": emotion_node.name,
                "intensity": emotion_node.intensity,
                "timestamp": emotion_node.timestamp
            });
        }
        
        # Use byLLM agent to detect patterns
        if len(mood_history) > 0 {
            patterns = detect_patterns(mood_history);
            report {
                "patterns": {
                    "recurring_emotions": patterns.recurring_emotions,
                    "trigger_correlations": patterns.trigger_correlations,
                    "weekly_trend": patterns.weekly_trend,
                    "recommendations": patterns.recommendations
                }
            };
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
            };
        }
    }
}

# =====================================================
# WALKER: SuggestionGenerator
# Endpoint: POST /walker/SuggestionGenerator
# =====================================================

walker SuggestionGenerator {
    has user_id: str = "";
    has current_mood: str = "neutral";
    has stress_level: int = 5;
    
    can generate with `root entry {
        # Collect recent triggers from graph
        recent_triggers: list = [];
        
        # Generate journaling prompt using byLLM
        prompt = generate_prompt(self.current_mood, recent_triggers);
        
        # Create breathing exercise if stressed
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
        
        # Save suggestion to graph
        suggestion_node = Suggestion(
            content=prompt,
            suggestion_type="journal_prompt",
            timestamp=str(datetime.datetime.now())
        );
        here ++> suggestion_node;
        
        report {
            "prompt": prompt,
            "exercise": exercise
        };
    }
}

# =====================================================
# WALKER: JournalSaver
# Endpoint: POST /walker/JournalSaver
# =====================================================

walker JournalSaver {
    has user_id: str = "";
    has content: str = "";
    has mood_before: int = 5;
    
    can save with `root entry {
        # Analyze journal content using byLLM
        analysis = classify_mood(self.content);
        mood_after = analysis.intensity;
        
        # Create journal entry node
        journal_node = JournalEntry(
            content=self.content,
            timestamp=str(datetime.datetime.now()),
            mood_before=self.mood_before,
            mood_after=mood_after
        );
        
        # Connect to graph
        here ++> journal_node;
        
        # Generate insight response
        response = empathy_response(
            analysis.emotion,
            mood_after,
            "After journaling: " + self.content[:100]
        );
        
        # Update journal with AI insight
        journal_node.ai_insight = response;
        
        report {
            "entry_id": str(id(journal_node)),
            "mood_change": mood_after - self.mood_before,
            "response": response
        };
    }
}

# =====================================================
# WALKER: HealthCheck
# Endpoint: POST /walker/HealthCheck
# =====================================================

walker HealthCheck {
    can check with `root entry {
        report {
            "status": "healthy",
            "service": "SerenityAI Backend",
            "version": "1.0.0"
        };
    }
}
