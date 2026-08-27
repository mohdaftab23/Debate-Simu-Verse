# Chronos — Alternate Reality Laboratory

An advanced multi-agent counterfactual reasoning laboratory powered by Google Gemini 3.7 Flash and Gemini 3.1 Pro. Specialized AI agents independently research, debate, stress-test, and synthesize coherent alternate historical timelines, geopolitical map boundaries, and causal graphs.

---

## 🔒 API Key & Security Architecture

This project strictly adheres to server-side API key security principles:

- **Zero Client-Side Exposure**: All Gemini API calls are proxied exclusively through server-side Express endpoints (`/api/*`). The browser client never accesses or stores API credentials.
- **Environment Variables**: API keys are loaded at runtime from `process.env.GEMINI_API_KEY`.
- **No Hardcoded Secrets**: No credentials or tokens exist in frontend code, version control, or static bundles.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

---

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd chronos-sim
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and set your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

   *(Note: `.env` is listed in `.gitignore` and will never be committed to git.)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment (Vercel & Cloud Platforms)

### Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel Dashboard](https://vercel.com/dashboard).
3. In **Project Settings** → **Environment Variables**, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_actual_gemini_api_key_here`
   - **Environments**: Production, Preview, Development
4. Deploy the project.

> **Important**: If the `GEMINI_API_KEY` variable is missing or empty, the server will output:
> ```
> Gemini API key is not configured. Add GEMINI_API_KEY in the deployment environment.
> ```
> and safely activate the built-in deterministic counterfactual reasoning fallback.

---

## 🛠️ Architecture Overview

- **Backend (`src/server/`)**:
  - `geminiPool.ts`: Manages server-side Gemini API client instances, connection pools, throttling, and failovers.
  - `routes.ts`: Secure REST endpoints for scenario parsing, multi-agent debate orchestration, and world state synthesis.
  - `agents/`: Disciplinary specialists (Historian, Economist, Geopolitician, Futurist, Synthesizer).
- **Frontend (`src/client/`)**:
  - Interactive SVG World Map with divergent sovereign borders, trade arteries, and conflict flashpoints.
  - Interactive Causal DAG Graph (D3 force-directed layout with multi-order effect tiers).
  - Multi-agent debate arena with consensus tracking and argument threads.
  - Speculative Atlas Cover Art Studio with 4K resolution PNG & SVG vector export.
