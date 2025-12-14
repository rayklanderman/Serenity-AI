# SerenityAI - Project Proposal

**Jaseci AI Hackathon 2025 | MindMate Harmony Space Track**

---

**Submitted by:** Raymond Klanderman  
**Team Name:** Serenity  
**Course:** Generative AI Training  
**Date:** December 14, 2025

**Reviewers:** marsninja, kugesan1105, udithishanka, MalithaPrabhashana, Thamirawaran, MusabMahmoodh

---

## 1. Problem Statement

Mental wellness challenges affect millions globally, yet accessible tools for daily emotional support remain scarce. Traditional mental health apps often feel impersonal, fail to adapt to users' changing moods, and lack intelligent pattern recognition. Users need a companion that understands their emotional state and provides personalized, empathetic guidance—not generic advice.

---

## 2. Solution: SerenityAI

SerenityAI is an **AI-powered mental wellness companion** that leverages JacLang's byLLM agents and OSP graph architecture to deliver personalized emotional support. The application tracks moods, offers intelligent coaching, and helps users understand their emotional patterns through AI-driven analysis.

**Live Demo:**

- Frontend: https://serenity-ai.vercel.app
- Backend: https://serenity-ai-vfxy.onrender.com
- GitHub: https://github.com/rayklanderman/Serenity-AI

---

## 3. Key Features

| Feature                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| **Mood Check-in**       | Emoji wheel for logging emotions with AI-generated empathetic responses     |
| **Mind Coach**          | Productivity coaching that respects mental state (hydration, breaks, sleep) |
| **Smart Journal**       | Side-by-side layout with AI insights analyzing entry sentiment              |
| **Pattern Analysis**    | Weekly trend detection with charts and clickable recommendations            |
| **Breathing Exercises** | Personalized stress-relief routines based on stress level                   |
| **About Section**       | Educational content on how the app benefits mental wellness                 |

---

## 4. Architecture

SerenityAI uses a **hybrid architecture** combining JacLang concepts with FastAPI reliability:

```
┌──────────────────┐        ┌──────────────────┐
│  React Frontend  │───────▶│  FastAPI Backend │
│  (Vercel)        │        │  (Render)        │
└──────────────────┘        └────────┬─────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
              JacLang Files                    6 byLLM Agents
              (OSP Schema)                     (Groq LLM Calls)
                    │                                 │
              ┌─────┴─────┐                    ┌──────┴──────┐
              │main.jac   │                    │empathy_resp │
              │models.jac │                    │classify_mood│
              │walkers.jac│                    │detect_patt. │
              │agents.jac │                    │gen_prompt   │
              └───────────┘                    │create_breath│
                                               │mind_coach   │
                                               └─────────────┘
```

---

## 5. Technical Implementation

### 5.1 JacLang OSP Graph Schema

**6 Node Types:**

- Emotion, Suggestion, JournalEntry, User, Trigger, Activity

**6 Edge Types:**

- triggers, helps_with, influences, correlates_with, contains, logged_by

### 5.2 Six byLLM Agents (Exceeds Required 2-3)

| Agent                         | Type       | Purpose                     |
| ----------------------------- | ---------- | --------------------------- |
| `empathy_response()`          | Generative | Warm, supportive responses  |
| `classify_mood()`             | Analytical | Emotion detection from text |
| `detect_patterns()`           | Analytical | Weekly trend analysis       |
| `generate_prompt()`           | Generative | Thoughtful journal prompts  |
| `create_breathing_exercise()` | Generative | Stress relief routines      |
| `mind_coach()`                | Generative | Productivity coaching       |

### 5.3 Technology Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, TypeScript, Vite, Recharts   |
| Backend  | FastAPI, Python, Pydantic           |
| LLM      | Groq API (llama-3.3-70b-versatile)  |
| Hosting  | Vercel (frontend), Render (backend) |
| Design   | Glass-morphism, responsive CSS      |

---

## 6. Future Roadmap

- **Supabase Integration** – Persistent storage for moods and journal entries
- **Push Notifications** – Proactive hydration and break reminders
- **Voice Journaling** – Speech-to-text for hands-free entries
- **Community Support** – Anonymous peer support features

---

## 7. Conclusion

SerenityAI demonstrates how JacLang's byLLM agents and OSP graph architecture can power intelligent, empathetic applications. With 6 agents, 6 node types, and 6 edge types, the project exceeds hackathon requirements while delivering a polished, user-friendly mental wellness experience.

---

_Submitted for Jaseci AI Hackathon 2025 – MindMate Harmony Space Track_

---

**Font:** Times New Roman, 12pt  
**Pages:** 2
