# SerenityAI 🧘‍♀️

**AI-Powered Mental Wellness Companion**

> Track emotions, journal thoughts, get AI coaching for mental wellness and productivity.

![Jaseci](https://img.shields.io/badge/JacLang-OSP%20Graph-blue) ![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-green) ![React](https://img.shields.io/badge/Frontend-React%20TS-61DAFB)

---

## 🎯 Hackathon Track

**Project 5: MindMate Harmony Space** - Jaseci AI Hackathon 2025

---

## 🌐 Live Demo

- **Frontend**: https://serenity-ai-gules.vercel.app
- **Backend**: https://serenity-ai-vfxy.onrender.com

---

## 🔧 Hybrid Architecture Approach

SerenityAI uses a **hybrid architecture** that combines:

1. **JacLang/OSP Concepts** - The `.jac` files define the graph structure, nodes, edges, walkers, and byLLM agent patterns
2. **FastAPI Backend** - Implements those patterns reliably with direct Groq LLM calls
3. **React Frontend** - Modern TypeScript UI with premium design

This approach demonstrates JacLang concepts while ensuring reliable demo performance.

---

## ✨ Features

| Feature               | Description                                      |
| --------------------- | ------------------------------------------------ |
| **Landing Page**      | Hero section, features, tech stack, CTAs         |
| **Mood Check-in**     | Log emotions with AI empathy response            |
| **Mood-Aligned Tips** | Tips personalized to your current mood           |
| **Mind Coach**        | Productivity coaching (breaks, hydration, sleep) |
| **Pattern Analysis**  | Weekly emotional trends with charts              |
| **Smart Journal**     | Side-by-side layout with AI insights             |
| **Contact Page**      | Contact form + social links                      |
| **About Section**     | Learn how the app helps you                      |

---

## 🤖 6 byLLM Agents

| Agent                         | Type       | Purpose                                            |
| ----------------------------- | ---------- | -------------------------------------------------- |
| `empathy_response()`          | Generative | Warm, supportive responses based on user's emotion |
| `classify_mood()`             | Analytical | Detects emotion, intensity, triggers from text     |
| `detect_patterns()`           | Analytical | Finds recurring emotions and weekly trends         |
| `generate_prompt()`           | Generative | Creates thoughtful journaling prompts              |
| `create_breathing_exercise()` | Generative | Builds stress-relief breathing routines            |
| `mind_coach()`                | Generative | Productivity tips that respect mental state        |

---

## 📊 OSP Graph Schema

**Nodes (6 types):**

- `Emotion` - Mood data with intensity, color, timestamp
- `Suggestion` - AI-generated tips and prompts
- `JournalEntry` - User writings with AI insights
- `User` - User profile and preferences
- `Trigger` - Events that affect mood
- `Activity` - Recommended activities

**Edges (6 types):**

- `triggers` → connects emotions to triggers
- `helps_with` → links suggestions to emotions
- `influences` → shows mood impact relationships
- `correlates_with` → pattern connections
- `contains` → user contains entries
- `logged_by` → entries logged by user

---

## 🏗️ Architecture Diagram

```
┌─────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│  FastAPI Backend    │
│   (TypeScript)      │     │  (Hybrid Approach)  │
│   Vercel Hosted     │     │  Render Hosted      │
└─────────────────────┘     └─────────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                   JacLang Files           6 byLLM Agents
                   (OSP Schema)            (Groq LLM Calls)
                        │                         │
                  ┌─────┴─────┐           ┌───────┴───────┐
                  │main.jac   │           │empathy_resp() │
                  │models.jac │           │classify_mood()│
                  │walkers.jac│           │detect_pattern │
                  │agents.jac │           │generate_prompt│
                  └───────────┘           │create_breath()│
                                          │mind_coach()   │
                                          └───────────────┘
```

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
│   ├── server.py         # FastAPI + 6 byLLM agents
│   ├── main.jac          # OSP Graph + Walkers
│   ├── models.jac        # Node/Edge definitions
│   ├── agents.jac        # byLLM agent declarations
│   └── walkers.jac       # Walker implementations
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # useJac API hook
│       └── styles/       # Premium UI CSS
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
