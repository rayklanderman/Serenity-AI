# SerenityAI 🧘‍♀️

**AI-Powered Mental Wellness Companion**

> Track emotions, journal thoughts, get AI coaching for mental wellness and productivity.

![Jaseci](https://img.shields.io/badge/JacLang-OSP%20Graph-blue) ![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-green) ![React](https://img.shields.io/badge/Frontend-React%20TS-61DAFB)

---

## 🎯 Hackathon Track

**Project 5: MindMate Harmony Space** - AI mental wellness companion

---

## ✨ Features (All Working)

| Feature                 | What It Does                                     | API Endpoint                   |
| ----------------------- | ------------------------------------------------ | ------------------------------ |
| **Mood Check-in**       | Log emotions with AI empathy response            | `/walker/MoodLogger`           |
| **Mood-Aligned Tips**   | Tips change based on your mood                   | `/walker/SuggestionGenerator`  |
| **Mind Coach**          | Productivity coaching (breaks, hydration, sleep) | `/walker/MindCoach`            |
| **Trend Analysis**      | Weekly pattern detection with charts             | `/walker/TrendAnalyzer`        |
| **Smart Journal**       | Journal entries with AI insights                 | `/walker/JournalSaver`         |
| **Breathing Exercises** | Personalized exercises for stress                | Built into SuggestionGenerator |
| **Mood History**        | Click to view details of past moods              | Frontend feature               |

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)     Backend (FastAPI + JacLang)
http://localhost:5173             http://localhost:8000
        │                                 │
        ├─ MoodWheel.tsx ──────────► /walker/MoodLogger
        ├─ TipsPanel.tsx ──────────► /walker/SuggestionGenerator
        ├─ TipsPanel.tsx ──────────► /walker/MindCoach
        ├─ JournalEntry.tsx ───────► /walker/JournalSaver
        └─ InsightsTimeline.tsx ───► /walker/TrendAnalyzer
                                          │
                                    6 byLLM Agents
                                          │
                                    Groq API (LLM)
```

---

## 🤖 6 byLLM Agents

| Agent                         | Type       | Purpose                          |
| ----------------------------- | ---------- | -------------------------------- |
| `empathy_response()`          | Generative | Warm, supportive responses       |
| `classify_mood()`             | Analytical | Emotion classification           |
| `detect_patterns()`           | Analytical | Trend analysis                   |
| `generate_prompt()`           | Generative | Journaling prompts               |
| `create_breathing_exercise()` | Generative | Breathing exercises              |
| `mind_coach()`                | Generative | Productivity + wellness coaching |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Groq API Key ([get free](https://console.groq.com))

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create .env
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
│   ├── main.jac          # OSP Graph + Walkers
│   ├── models.jac        # Node/Edge definitions
│   ├── agents.jac        # byLLM agent declarations
│   └── walkers.jac       # Walker implementations
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # useJac API hook
│       ├── types/        # TypeScript types
│       └── styles/       # CSS
└── docs/
    └── AGENTS.md         # Agent documentation
```

---

## 📊 OSP Graph Schema

**Nodes**: Emotion, Suggestion, JournalEntry, User, Trigger, Activity

**Edges**: triggers, helps_with, influences, correlates_with, contains, logged_by

---

## 🧪 API Testing

```bash
# Test MoodLogger
curl -X POST http://localhost:8000/walker/MoodLogger \
  -H "Content-Type: application/json" \
  -d '{"mood_text":"feeling calm","user_id":"test"}'

# Test MindCoach
curl -X POST http://localhost:8000/walker/MindCoach \
  -H "Content-Type: application/json" \
  -d '{"current_mood":"anxious","current_hour":16}'
```

---

## 🚀 Upcoming Features

| Feature                  | Description                                  | Status     |
| ------------------------ | -------------------------------------------- | ---------- |
| **Supabase Integration** | Persistent storage for moods & journals      | 🔜 Planned |
| **Mindfulness Plans**    | AI-generated daily/weekly wellness schedules | 🔜 Planned |
| **Assignment Reminders** | Smart task reminders based on mental state   | 🔜 Planned |
| **Mood Streaks**         | Gamification with daily logging streaks      | 🔜 Planned |
| **Push Notifications**   | Hydration, break, and sleep reminders        | 🔜 Planned |
| **Voice Journaling**     | Speech-to-text for hands-free entries        | 🔜 Planned |
| **Community Support**    | Anonymous peer support features              | 🔜 Planned |

---

## 👥 Team

Built for the Jaseci AI Hackathon 2024

## 📄 License

MIT
