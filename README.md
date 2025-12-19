# SerenityAI 🧘‍♀️

**AI-Powered Mental Wellness Companion**

> Track emotions, journal thoughts, get AI coaching for mental wellness and productivity.

![Jaseci](https://img.shields.io/badge/JacLang-OSP%20Graph-blue) ![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-green) ![React](https://img.shields.io/badge/Frontend-React%20TS-61DAFB) ![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)

---

## 🎯 Hackathon Track

**Project 5: MindMate Harmony Space** - Jaseci AI Hackathon 2025

---

## 🌐 Live Demo

| Platform        | URL                                          |
| --------------- | -------------------------------------------- |
| **Frontend**    | https://serenityai.qzz.io                    |
| **Backend API** | https://serenity-ai-vfxy.onrender.com        |
| **GitHub**      | https://github.com/rayklanderman/Serenity-AI |

---

## 🏗️ Multi-Agent Architecture

SerenityAI implements a **multi-agent design** with 4 specialized walkers that interact through the OSP graph:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                  │
│                          Uses Spawn() via useJac hook                    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │      FastAPI Backend Server     │
                    │   Groq LLM (Llama 3.3-70B)      │
                    └────────────────┬────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐          ┌─────────────────┐          ┌─────────────────┐
│  MoodLogger   │          │  TrendAnalyzer  │          │SuggestionGen    │
│  (Walker 1)   │          │   (Walker 2)    │          │  (Walker 3)     │
├───────────────┤          ├─────────────────┤          ├─────────────────┤
│ classify_mood │──────────│ detect_patterns │──────────│ generate_prompt │
│empathy_resp() │          │ [-->Emotion]    │          │create_breathing │
└───────┬───────┘          └────────┬────────┘          └────────┬────────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         OSP GRAPH (In-Memory)                           │
│  ┌──────────┐    triggers    ┌──────────┐    helps_with    ┌─────────┐ │
│  │ Emotion  │◄──────────────▶│ Trigger  │◄───────────────▶│Activity │ │
│  └────┬─────┘                └──────────┘                  └─────────┘ │
│       │ influences                                                      │
│       ▼                                                                 │
│  ┌──────────┐    logged_by   ┌──────────┐                               │
│  │Suggestion│◄──────────────▶│  User    │                               │
│  └──────────┘                └──────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Long-term Persistence)                    │
│   mood_logs │ journal_entries │ wellness_plans │ game_scores            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Agent Interaction Flow

When a user logs a mood, the following multi-agent interaction occurs:

```
User Action                  Walker                    byLLM Function
───────────────────────────────────────────────────────────────────────
1. Select Mood      ──────▶  MoodLogger      ──────▶  classify_mood()
                                             ──────▶  empathy_response()
                    [Creates Emotion node in graph]

2. View Insights    ──────▶  TrendAnalyzer   ──────▶  detect_patterns()
                    [Traverses -->Emotion edges]
                    [Returns: recurring_emotions, weekly_trend]

3. Get Suggestions  ──────▶  SuggestionGen   ──────▶  generate_prompt()
                                             ──────▶  create_breathing_exercise()
                    [Creates Suggestion node]

4. Journal Entry    ──────▶  JournalSaver    ──────▶  classify_mood()
                                             ──────▶  empathy_response()
                    [Creates JournalEntry node]
```

---

## 🤖 byLLM Agent Functions

### Generative Agents (Content Creation)

| Function                      | Purpose                   | Example Output                                                  |
| ----------------------------- | ------------------------- | --------------------------------------------------------------- |
| `empathy_response()`          | Warm, supportive messages | "I hear that you're feeling anxious. Let's breathe together..." |
| `generate_prompt()`           | Journaling prompts        | "What made you smile today, even briefly?"                      |
| `create_breathing_exercise()` | Stress-relief routines    | 4-7-8 breathing with step-by-step guide                         |

### Analytical Agents (Pattern Detection)

| Function            | Purpose                    | Output Type                                           |
| ------------------- | -------------------------- | ----------------------------------------------------- |
| `classify_mood()`   | Detect emotion + intensity | `{emotion: "happy", intensity: 8, triggers: [...]}`   |
| `detect_patterns()` | Weekly trend analysis      | `{weekly_trend: "improving", recommendations: [...]}` |

---

## 📊 OSP Graph Schema

### Node Types (6)

| Node           | Purpose                | Key Fields                                   |
| -------------- | ---------------------- | -------------------------------------------- |
| `User`         | Root of user's graph   | user_id, name                                |
| `Emotion`      | Logged emotional state | name, intensity, timestamp, color            |
| `Trigger`      | What caused an emotion | name, category, frequency                    |
| `Activity`     | Recommended activities | name, duration, effectiveness                |
| `Suggestion`   | AI-generated tips      | content, type, relevance_score               |
| `JournalEntry` | User journal entries   | content, mood_before, mood_after, ai_insight |

### Edge Types (5)

| Edge              | Relationship        | Example                                   |
| ----------------- | ------------------- | ----------------------------------------- |
| `triggers`        | Trigger → Emotion   | "work stress" triggers "anxious"          |
| `helps_with`      | Activity → Emotion  | "breathing exercise" helps with "anxious" |
| `influences`      | Emotion → Emotion   | "anxious" influences "tired"              |
| `correlates_with` | Pattern connections | "Monday" correlates with "stressed"       |
| `contains`        | User → nodes        | User contains all their data              |

### Graph Traversal Example

```jac
// In TrendAnalyzer walker
for emotion_node in [-->Emotion] {
    mood_history.append({
        "emotion": emotion_node.name,
        "intensity": emotion_node.intensity,
        "timestamp": emotion_node.timestamp
    });
}
patterns = detect_patterns(mood_history);  // byLLM call
```

---

## ✨ Features

| Feature                 | Description                       | Status  |
| ----------------------- | --------------------------------- | ------- |
| **Mood Check-in**       | 6 moods with AI empathy           | ✅ Live |
| **Voice Input**         | Speech-to-text logging            | ✅ Live |
| **Smart Journal**       | AI insights + mood tracking       | ✅ Live |
| **Emotion Graphs**      | Timeline + Radar visualization    | ✅ Live |
| **Weekly Insights**     | TrendAnalyzer patterns            | ✅ Live |
| **Mind Planner**        | 7-day wellness carousel           | ✅ Live |
| **Activity Completion** | Checkboxes + daily progress bar   | ✅ Live |
| **Today Widget**        | Quick view of daily activities    | ✅ Live |
| **Notification Center** | In-app notification system        | ✅ Live |
| **Push Notifications**  | Activity reminders (PWA)          | ✅ Live |
| **Progress Dashboard**  | Weekly stats + achievement badges | ✅ Live |
| **Mind Games**          | 3 levels, 24 shuffled questions   | ✅ Live |
| **Supabase Auth**       | Email/password + guest mode       | ✅ Live |

---

## 🗄️ Data Persistence (Hybrid Approach)

SerenityAI uses a **hybrid storage strategy**:

| Layer         | Technology        | Purpose                               |
| ------------- | ----------------- | ------------------------------------- |
| **OSP Graph** | JacLang in-memory | Real-time analysis, pattern detection |
| **Supabase**  | PostgreSQL + RLS  | Long-term persistence across sessions |

### Supabase Tables

```sql
mood_logs       -- Emotion logging with AI responses
journal_entries -- Journal entries with AI insights
wellness_plans  -- Weekly planner data
game_scores     -- Trivia game high scores
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
echo "GROQ_API_KEY=your_key" > .env
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Open**: http://localhost:5173

---

## 📁 Project Structure

```
serenity-ai/
├── backend/
│   ├── server.py         # FastAPI + byLLM agents
│   ├── models.jac        # OSP Node/Edge definitions
│   ├── agents.jac        # byLLM function declarations
│   ├── walkers.jac       # Walker implementations
│   └── main.jac          # Graph initialization
├── frontend/
│   └── src/
│       ├── components/   # React components
│       │   ├── MoodWheel.tsx
│       │   ├── EmotionGraph.tsx
│       │   ├── InsightsTimeline.tsx
│       │   ├── MindPlanner.tsx
│       │   └── TriviaGames.tsx
│       ├── hooks/
│       │   ├── useJac.ts     # Spawn() API hook
│       │   └── useStorage.ts # Supabase persistence
│       └── styles/
│           └── index.css     # Premium UI
└── supabase/
    └── schema.sql        # Database schema
```

---

## 🔑 Environment Variables

### Backend (.env)

```
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 👥 Team

**Ray Klanderman** - Open University of Kenya (OUK)  
Built for Jaseci AI Hackathon 2025 | MindMate Harmony Space Track

---

## 📄 License

MIT
