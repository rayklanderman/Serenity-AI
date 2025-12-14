"""
SerenityAI Data Models
OSP Graph nodes and edges for mental wellness tracking
"""

# =====================================================
# NODE TYPES - Represent entities in the emotional graph
# =====================================================
"""User node - root of user's emotional graph"""
node User {
    has user_id: str = "";
    has name: str = "";
    has created_at: str = "";
}

"""Emotion node - represents a logged emotional state"""
node Emotion {
    has name: str = "neutral";  # happy, sad, anxious, calm, angry, neutral
    has intensity: int = 5;  # 1-10 scale
    has timestamp: str = "";
    has color: str = "#808080";  # For visualization
    has note: str = "";  # Optional user note
}

"""Trigger node - represents what caused an emotion"""
node Trigger {
    has name: str = "";
    has category: str = "general";  # work, relationships, health, etc.
    has frequency: int = 1;
}

"""Activity node - breathing, journaling, meditation, etc."""
node Activity {
    has name: str = "";
    has activity_type: str = "";  # breathing, journaling, meditation
    has duration: int = 0;  # minutes
    has effectiveness: float = 0.0;
}

"""Suggestion node - AI-generated suggestions"""
node Suggestion {
    has content: str = "";
    has suggestion_type: str = "";  # tip, exercise, prompt
    has relevance_score: float = 0.9;
    has timestamp: str = "";
}

"""JournalEntry node - user journal entries"""
node JournalEntry {
    has content: str = "";
    has timestamp: str = "";
    has mood_before: int = 5;
    has mood_after: int = 5;
    has ai_insight: str = "";
}

# =====================================================
# EDGE TYPES - Represent relationships
# =====================================================
"""Edge: Trigger causes Emotion"""
edge triggers {
    has frequency: int = 1;
    has strength: float = 0.5;
}

"""Edge: Activity helps with Emotion"""
edge helps_with {
    has effectiveness: float = 0.0;
}

"""Edge: Emotion influences another Emotion"""
edge influences {
    has strength: float = 0.0;  # -1.0 to 1.0
}

"""Edge: Emotions correlate with each other"""
edge correlates_with {
    has correlation: float = 0.0;
}

"""Edge: User owns/contains something"""
edge contains;

"""Edge: Something was logged by User"""
edge logged_by;
