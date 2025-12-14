# SerenityAI - Project Documentation

## 🎯 Hackathon Track

**Project 5: MindMate Harmony Space** - AI-powered mental wellness companion

---

## 📋 Project Overview

SerenityAI is a mental wellness application that helps users track their emotional state, get AI-powered coaching, and develop positive habits. Built with JacLang (byLLM agents) and React.

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│  FastAPI Backend    │
│   (TypeScript)      │     │  (Python + Jac)     │
│   Port: 5173        │     │  Port: 8000         │
└─────────────────────┘     └─────────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Groq LLM      │
                            │ (llama-3.3-70b) │
                            └─────────────────┘
```

---

## 🤖 6 byLLM Agents

| Agent                         | Type       | Purpose                             |
| ----------------------------- | ---------- | ----------------------------------- |
| `empathy_response()`          | Generative | Warm, supportive responses to users |
| `classify_mood()`             | Analytical | Emotion classification from text    |
| `detect_patterns()`           | Analytical | Weekly mood pattern detection       |
| `generate_prompt()`           | Generative | Journaling prompts                  |
| `create_breathing_exercise()` | Generative | Stress-relief exercises             |
| `mind_coach()`                | Generative | Productivity coaching               |

---

## 📊 OSP Graph Schema

### Nodes (6 types)

- Emotion, Suggestion, JournalEntry, User, Trigger, Activity

### Edges (6 types)

- triggers, helps_with, influences, correlates_with, contains, logged_by

---

## ✨ Features

### Check-in Tab

- Mood wheel with 6 emotions
- AI empathy response
- Mood history strip (clickable for details)

### Mind Coach

- Productivity tips based on mental state
- Hydration, break, sleep reminders
- Time-of-day awareness

### Journal

- Free-form writing
- AI insights after saving
- Expandable entry history

### Insights

- Weekly trend analysis
- Clickable recommendations with positive elaboration
- Emotional pattern detection

---

## 🗂️ Project Structure

```
serenity-ai/
├── backend/
│   ├── server.py         # FastAPI + byLLM agents
│   ├── main.jac          # OSP Graph + Walkers
│   ├── models.jac        # Node/Edge definitions
│   ├── agents.jac        # byLLM declarations
│   ├── walkers.jac       # Walker implementations
│   ├── requirements.txt  # Python dependencies
│   └── .env              # API keys (NOT committed)
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # useJac API hook
│   │   ├── styles/       # CSS
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets (logo)
│   └── index.html        # Entry point
├── docs/
│   └── AGENTS.md         # Agent documentation
├── .gitignore            # Protects secrets
└── README.md             # Setup instructions
```

---

## 🔌 API Endpoints

| Endpoint                      | Method | Purpose                      |
| ----------------------------- | ------ | ---------------------------- |
| `/walker/MoodLogger`          | POST   | Log mood, get AI response    |
| `/walker/TrendAnalyzer`       | POST   | Analyze mood patterns        |
| `/walker/SuggestionGenerator` | POST   | Get mood-aligned tips        |
| `/walker/JournalSaver`        | POST   | Save journal with AI insight |
| `/walker/MindCoach`           | POST   | Productivity coaching        |
| `/health`                     | GET    | Server health check          |

---

## 🚀 Running Locally

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Set GROQ_API_KEY in .env
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Open:** http://localhost:5173

---

## 🔐 Security

- `.gitignore` protects `.env` files
- API keys stored in environment variables only
- No secrets committed to git

---

## 📈 Future Enhancements

- Supabase for persistent storage
- Mindfulness plan generation
- Push notifications
- Voice journaling
- Community support features

---

## 👥 Team

Built for Jaseci AI Hackathon 2024
