# PlacePrep Vercel Deployment Guide

This guide provides step-by-step instructions for deploying both the **PlacePrep AI Frontend** (Next.js) and **Backend** (Express/TypeScript Serverless) to Vercel from this repository.

---

## Architecture Overview

PlacePrep is structured as a monorepo with separate `frontend` and `backend` directories. On Vercel, the recommended and cleanest architecture is to deploy **two linked Vercel projects** from the same GitHub repository:

```
                  ┌───────────────────────────────┐
                  │       GitHub Repository       │
                  └───────────────┬───────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐
   │  placeprep-frontend       │     │  placeprep-backend        │
   │  (Root: frontend)         │     │  (Root: backend)          │
   │  Next.js 14 App Router    │     │  Express Serverless API   │
   │  Edge Rewrites & SSR      │     │  Supabase + Azure AI SDK  │
   └─────────────┬─────────────┘     └─────────────▲─────────────┘
                 │                                 │
                 └──────── Rewrites / Direct ──────┘
                           (Encrypted HTTPS)
```

### Key Advantages:
- **Security Isolation**: Backend secrets (`SUPABASE_SECRET_KEY`, Azure AI keys) remain strictly on the backend and are never exposed to the frontend bundle.
- **Independent Scaling & Deployments**: Changes to frontend UI deploy independently of backend logic.
- **Zero-Config Previews**: Preview deployments for pull requests are automatically supported via CORS wildcard detection for `*.vercel.app`.
- **Automatic Proxy Rewrites**: Next.js proxies `/api/*` to the backend, preventing browser cross-origin (CORS) complications.

---

## Step 1: Deploy the Backend (`placeprep-backend`)

Deploy the backend first so you have its production URL ready for the frontend.

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Select your `PlacePrep` repository.
3. In the project configuration screen:
   - **Project Name**: `placeprep-backend` (or any name you prefer)
   - **Framework Preset**: Leave as **Other** (Vercel automatically detects `backend/vercel.json` and `backend/api/index.ts`).
   - **Root Directory**: Click **Edit** and select **`backend`**.
4. Expand **Environment Variables** and add the following:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `JWT_SECRET` | `your-secure-random-jwt-secret-key-32chars` | Secret key used for signing user auth tokens |
| `USE_MOCK_AI` | `false` (or `true` if testing without Azure keys) | Toggle mock AI engine vs. live Azure AI services |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `SUPABASE_SECRET_KEY` | `eyJhbGciOi...` | Supabase service role secret key |
| `AZURE_OPENAI_ENDPOINT` | `https://your-resource.openai.azure.com` | Azure OpenAI endpoint |
| `AZURE_OPENAI_API_KEY` | `your_azure_openai_api_key` | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT_NAME`| `gpt-4o` | Deployment model name |
| `AZURE_SEARCH_ENDPOINT` | `https://your-search.search.windows.net`| Azure AI Search endpoint |
| `AZURE_SEARCH_API_KEY` | `your_azure_search_api_key` | Azure AI Search admin/query key |
| `AZURE_SEARCH_INDEX_NAME` | `placement-knowledge-index` | Search index name |
| `AZURE_SPEECH_KEY` | `your_azure_speech_key` | Azure Speech service key |
| `AZURE_SPEECH_REGION` | `eastus` (or your region) | Azure Speech region |
| `AZURE_VISION_ENDPOINT` | `https://your-vision.cognitiveservices.azure.com` | Azure Vision endpoint |
| `AZURE_VISION_KEY` | `your_azure_vision_key` | Azure Vision key |

5. Click **Deploy**.
6. Once deployed, note down your backend URL (e.g. `https://placeprep-backend.vercel.app`).
7. **Verify Backend**:
   - Open `https://placeprep-backend.vercel.app/` in your browser. You should receive:
     ```json
     {
       "status": "healthy",
       "service": "PlacePrep AI Backend",
       "version": "1.0.0",
       "mode": "...",
       "timestamp": "..."
     }
     ```
   - Open `https://placeprep-backend.vercel.app/api/health` to verify database and services status.

---

## Step 2: Deploy the Frontend (`placeprep-frontend`)

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** > **Project**.
2. Select the same `PlacePrep` repository again.
3. In the project configuration screen:
   - **Project Name**: `placeprep-frontend` (or `placeprep`)
   - **Framework Preset**: **Next.js** (automatically detected)
   - **Root Directory**: Click **Edit** and select **`frontend`**.
4. Expand **Environment Variables** and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://placeprep-backend.vercel.app/api` | Backend API URL for client-side fetches |
| `BACKEND_URL` | `https://placeprep-backend.vercel.app` | Backend base URL for Next.js server-side edge rewrites |
| `NEXT_PUBLIC_USE_MOCK_AI` | `false` (or `true` if in mock mode) | Match mock mode state for UI indicators |

5. Click **Deploy**.
6. Once deployed, Vercel gives you your frontend URL (e.g. `https://placeprep.vercel.app`).

---

## Step 3: Link Frontend URL in Backend CORS Settings

To ensure strict production security:

1. Open your `placeprep-backend` project on Vercel.
2. Go to **Settings** > **Environment Variables**.
3. Add or update:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://placeprep.vercel.app` (your frontend deployment URL)
4. Go to **Deployments** and click **Redeploy** on the latest deployment so the new variable takes effect.

*(Note: The backend's CORS handler also automatically accepts any `*.vercel.app` subdomain, so preview branches and test deployments work without additional manual configuration.)*

---

## Verification & Sanity Checks

1. **Authentication**: Open your frontend URL, navigate to `/signup`, register an account, and confirm that the JWT token is stored and dashboard loads.
2. **AI Chat**: Navigate to `/chat`, send a question (e.g., "What are the key differences between BFS and DFS?"), and verify you receive an answer.
3. **Mock Interview**: Navigate to `/interview`, start a session, speak or submit an answer, and verify evaluation and scoring.
4. **Roadmap Generator**: Navigate to `/roadmap`, submit a target role (e.g. SDE-1), and verify milestone generation.

---

## Local Development vs. Vercel Production

| Aspect | Local Development | Vercel Production |
| :--- | :--- | :--- |
| **Backend Execution** | `npm run dev` (`tsx watch src/server.ts`) | Vercel Serverless Function (`api/index.ts`) |
| **Backend Port** | `http://localhost:5000` | Serverless on-demand HTTPS |
| **Frontend Execution** | `npm run dev` (`next dev -p 3000`) | Edge / Serverless Next.js Bundle |
| **API Calls** | Rewrites to `http://localhost:5000` | Dynamic rewrites to `BACKEND_URL` / `NEXT_PUBLIC_API_URL` |
