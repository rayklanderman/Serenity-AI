# SerenityAI Multi-Agent Architecture

## Overview

SerenityAI uses **5 specialized byLLM agents** organized into generative and analytical roles.

## Agent Roles

### Generative Agents (Content Creation)

| Agent               | Function                      | Purpose                    |
| ------------------- | ----------------------------- | -------------------------- |
| **EmpathyAgent**    | `empathy_response()`          | Warm, supportive responses |
| **PromptGenerator** | `generate_prompt()`           | Journaling prompts         |
| **ExerciseCreator** | `create_breathing_exercise()` | Breathing exercises        |

### Analytical Agents (Data Processing)

| Agent               | Function            | Purpose                |
| ------------------- | ------------------- | ---------------------- |
| **MoodAnalyzer**    | `classify_mood()`   | Emotion classification |
| **PatternDetector** | `detect_patterns()` | Trend analysis         |

---

## Agent Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │MoodWheel│  │ Journal │  │ Insights │  │ Mindfulness    │ │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └───────┬────────┘ │
│       │            │            │                │           │
│       ▼            ▼            ▼                ▼           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              useJac() Hook - Spawn()                    │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP POST /walker/{name}
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (JacLang via `jac serve`)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ MoodLogger   │  │TrendAnalyzer │  │SuggestionGenerator│  │
│  │   Walker     │  │   Walker     │  │     Walker        │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬────────┘   │
│         │                 │                    │             │
│         ▼                 ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  byLLM Agents                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │ classify_   │  │  empathy_   │  │  detect_    │  │    │
│  │  │   mood()    │  │  response() │  │ patterns()  │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  │         │                │                │          │    │
│  │         ▼                ▼                ▼          │    │
│  │  ┌─────────────────────────────────────────────────┐│    │
│  │  │      Groq API (llama-3.3-70b-versatile)        ││    │
│  │  └─────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  OSP Graph (Nodes)                   │    │
│  │   User ──> Emotion ──> Trigger                       │    │
│  │             │                                        │    │
│  │             └──> JournalEntry ──> Suggestion         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. Mood Logging Flow

```
User clicks emoji → MoodWheel → useJac("MoodLogger")
                                      │
                                      ▼
                              MoodLogger Walker
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             classify_mood()    Create Emotion    empathy_response()
             (ANALYTICAL)       Node in Graph      (GENERATIVE)
                    │                 │                 │
                    └─────────────────┴─────────────────┘
                                      │
                                      ▼
                              Report to Frontend
                              (analysis + response)
```

### 2. Trend Analysis Flow

```
User visits Insights → InsightsTimeline → useJac("TrendAnalyzer")
                                               │
                                               ▼
                                    TrendAnalyzer Walker
                                               │
                              Traverse Graph (Emotion nodes)
                                               │
                                               ▼
                                    detect_patterns()
                                      (ANALYTICAL)
                                               │
                                               ▼
                                    Report patterns + tips
```

---

## OSP Graph Schema

### Nodes

| Node           | Fields                              | Purpose         |
| -------------- | ----------------------------------- | --------------- |
| `User`         | user_id, name, created_at           | User root node  |
| `Emotion`      | name, intensity, timestamp, color   | Logged moods    |
| `Trigger`      | name, category, frequency           | Emotion causes  |
| `Suggestion`   | content, type, relevance_score      | AI suggestions  |
| `JournalEntry` | content, mood_before, mood_after    | Journal logs    |
| `Activity`     | name, type, duration, effectiveness | User activities |

### Edges

| Edge              | From → To          | Purpose              |
| ----------------- | ------------------ | -------------------- |
| `contains`        | User → \*          | User owns data       |
| `triggers`        | Trigger → Emotion  | Cause relationship   |
| `helps_with`      | Activity → Emotion | Coping effectiveness |
| `influences`      | Emotion → Emotion  | Mood chains          |
| `correlates_with` | Trigger → Trigger  | Pattern links        |

---

## byLLM Configuration

All agents use Groq's `llama-3.3-70b-versatile` model:

```jac
can classify_mood(text: str) -> dict
by llm(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.3,  // Lower for consistency
    reason="Analyze text and return emotion data..."
);
```

**Environment Variable:** `GROQ_API_KEY`
