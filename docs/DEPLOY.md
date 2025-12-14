# Deployment Guide

## 🚀 Frontend: Vercel

### Via CLI

```bash
cd frontend
vercel login
vercel
```

### Via Dashboard

1. Go to https://vercel.com/new
2. Import from GitHub: `rayklanderman/Serenity-AI`
3. Set Root Directory: `frontend`
4. Environment Variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://serenity-ai.onrender.com`)
5. Deploy!

---

## 🌐 Backend: Render

### Step-by-Step

1. **Go to** https://dashboard.render.com/

2. **New Web Service** → Connect GitHub repo

3. **Settings:**
   | Field | Value |
   |-------|-------|
   | Name | `serenity-ai-backend` |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `python server.py` |

4. **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `GROQ_API_KEY` | `gsk_your_key_here` |

5. **Click Deploy**

### URL Format

Your backend will be at: `https://serenity-ai-backend.onrender.com`

---

## 🔗 Connect Frontend to Backend

After Render deploys, update Vercel environment:

1. Go to Vercel project settings
2. Add Environment Variable:
   - `VITE_API_URL` = `https://serenity-ai-backend.onrender.com`
3. Redeploy frontend

---

## ✅ Verify Deployment

Test backend:

```bash
curl https://your-render-url.onrender.com/health
```

Expected:

```json
{ "status": "healthy", "service": "SerenityAI Backend" }
```
