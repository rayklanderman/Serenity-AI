# SerenityAI 🧘‍♀️

**AI-Powered Mental Wellness Companion**

> Track emotions, journal thoughts, get AI coaching for mental wellness and productivity.

![Jaseci](https://img.shields.io/badge/JacLang-OSP%20Graph-blue) ![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-green) ![React](https://img.shields.io/badge/Frontend-React%20TS-61DAFB)

---

## 🎯 Hackathon Track

**Project 5: MindMate Harmony Space** - Jaseci AI Hackathon 2025

---

## 🌐 Live Demo

- **Frontend**: https://serenity-ai.vercel.app
- **Backend**: https://serenity-ai-vfxy.onrender.com

---

## ✨ Features

| Feature                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| **Mood Check-in**       | Log emotions with AI empathy response            |
| **Mood-Aligned Tips**   | Tips personalized to your current mood           |
| **Mind Coach**          | Productivity coaching (breaks, hydration, sleep) |
| **Pattern Analysis**    | Weekly emotional trends with charts              |
| **Smart Journal**       | Side-by-side entries with AI insights            |
| **Breathing Exercises** | Personalized stress relief exercises             |
| **Mood History**        | Click to view past mood details                  |
| **About Section**       | Learn app benefits                               |

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)     Backend (FastAPI + JacLang)
         │                                 │
         ├─ MoodWheel.tsx ──────────► /walker/MoodLogger
         ├─ TipsPanel.tsx ──────────► /walker/SuggestionGenerator
         ├─ TipsPanel.tsx ──────────► /walker/MindCoach
         ├─ JournalEntry.tsx ───────► /walker/JournalSaver
         └─ InsightsTimeline.tsx ───► /walker/TrendAnalyzer
                                           │
                                     6 byLLM Agents → Groq API
```

---

## 🤖 6 byLLM Agents

| Agent                         | Type       | Purpose           |
| ----------------------------- | ---------- | ----------------- |
| `empathy_response()`          | Generative | Warm responses    |
| `classify_mood()`             | Analytical | Emotion detection |
| `detect_patterns()`           | Analytical | Trend analysis    |
| `generate_prompt()`           | Generative | Journal prompts   |
| `create_breathing_exercise()` | Generative | Stress relief     |
| `mind_coach()`                | Generative | Productivity tips |

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
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
│   ├── main.jac          # OSP Graph + Walkers
│   ├── models.jac        # Node/Edge definitions
│   ├── agents.jac        # byLLM declarations
│   └── walkers.jac       # Walker implementations
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # useJac API hook
│       └── styles/       # Premium CSS
└── docs/
    ├── PROJECT.md        # Full documentation
    └── DEPLOY.md         # Deployment guide
```

---

## 🚀 Upcoming Features

| Feature              | Status     |
| -------------------- | ---------- |
| Supabase Persistence | 🔜 Planned |
| Mindfulness Plans    | 🔜 Planned |
| Push Notifications   | 🔜 Planned |
| Voice Journaling     | 🔜 Planned |

---

## 👥 Team

Built for the Jaseci AI Hackathon 2025 | MindMate Track

## 📄 License

MIT
