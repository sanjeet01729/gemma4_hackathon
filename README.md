# PadhAi 📚

An offline-first AI-powered doubt solver built for government exam aspirants in low-connectivity regions of Bihar and beyond. Powered by **Gemma 4 E2B** via Ollama, PadhAi lets students ask questions by text or photograph a page from their textbook and get clear, exam-focused answers in **Hindi or English** — no internet required during use.

> Built for the **Gemma 4 Impact Challenge** by Sanjeet Kumar.

---

## The Problem

Millions of students across Bihar prepare for BPSC, SSC, Railway, and UPSC exams from villages where mobile connectivity is near-zero. They rely on printed books and downloaded videos. When they hit a doubt at 11 PM, there is no one to ask. PadhAi is that patient tutor — always available, always free.

---

## Features

- **Text-based doubt clearing** — ask any GK, History, Polity, Maths, or Science question
- **Vision / image input** — photograph a textbook page or question paper and get an explanation
- **Hindi + English support** — responds in the language you ask in
- **Offline after setup** — no internet needed once the model is running
- **Practice screen** — self-test mode for exam preparation
- **Language selection** — choose your preferred interaction language on first launch

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native CLI (Android) |
| API client | TypeScript (`src/api/gemma.ts`) |
| State management | Zustand (`src/store/useAppStore.ts`) |
| Backend | FastAPI on Google Colab |
| Tunneling | ngrok (two tunnels: Mac → Colab → App) |
| Inference | Ollama running locally on MacBook |
| Model | Gemma 4 E2B (multimodal, multilingual) |

---

## Project Structure

```text
src/
├── api/
│   └── gemma.ts                    # API calls to FastAPI (text + vision)
├── screens/
│   ├── SplashScreen.tsx            # Launch screen
│   ├── LanguageSelectScreen.tsx    # Hindi / English selection
│   ├── HomeScreen.tsx              # Main entry point
│   ├── ChatScreen.tsx              # Text and image Q&A interface
│   └── PracticeScreen.tsx          # Self-practice / quiz mode
└── store/
    └── useAppStore.ts              # Global state via Zustand
```

---

## Architecture

```text
┌─────────────────────────────────────┐
│        React Native App             │
│           (Android)                 │
│  text input · camera · gallery      │
└──────────────┬──────────────────────┘
               │
               │ ngrok tunnel #2
               │ (HTTP · JSON)
               │
┌──────────────▼──────────────────────┐
│     FastAPI Server · Google Colab   │
│  POST /ask · POST /ask-vision       │
└──────────────┬──────────────────────┘
               │
               │ ngrok tunnel #1
               │ (REST · localhost)
               │
┌──────────────▼──────────────────────┐
│      Ollama · MacBook               │
│   inference server · port 11434     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Gemma 4 E2B                 │
│   text + vision · Hindi + English   │
└─────────────────────────────────────┘
```

## Getting Started



---

## Google Colab Backend

The FastAPI backend used for text and vision inference can also run directly from Google Colab.  
This was used during development and testing to expose the API publicly through ngrok while keeping Ollama running locally on a MacBook.

### Colab Notebook

:contentReference[oaicite:0]{index=0}

### What the notebook does

- Installs FastAPI, Uvicorn, pyngrok, and required dependencies
- Starts a FastAPI server inside Colab
- Creates public ngrok endpoints for the API
- Forwards requests from the React Native app to Ollama
- Supports both:
  - `POST /ask` → text questions
  - `POST /ask-vision` → image-based questions

### Request Flow

```text
React Native App
        ↓
FastAPI on Google Colab
        ↓
ngrok tunnel
        ↓
Local Ollama Server (MacBook)
        ↓
Gemma 4 E2B
```

This setup allowed rapid prototyping without deploying a dedicated cloud backend.
### Prerequisites for react native cli

- Node.js ≥ 18
- React Native CLI environment set up — see the [official guide](https://reactnative.dev/docs/set-up-your-environment)
- Android device or emulator
- Ollama installed on your machine with Gemma 4 E2B pulled
- Python 3.10+ for the FastAPI server
- ngrok account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/PadhAi.git
cd PadhAi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the FastAPI server

```bash
cd server
pip install fastapi uvicorn requests
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Start ngrok tunnels

```bash
# Tunnel 1: expose Ollama on Mac
ngrok http 11434

# Tunnel 2: expose FastAPI on Colab (or locally)
ngrok http 8000
```

Update the base URL in `src/api/gemma.ts` with your ngrok URL.

### 5. Pull the model via Ollama

```bash
ollama pull gemma4:e2b
ollama serve
```

### 6. Start Metro and run the app

```bash
# Start Metro
npm start

# Run on Android (new terminal)
npm run android
```

---

## Screens

| Screen | Description |
|---|---|
| Splash | App launch animation |
| Language Select | Choose Hindi or English |
| Home | Navigation hub |
| Chat | Text and image doubt-clearing |
| Practice | Self-test mode for exam prep |

---

## Roadmap

- [ ] Improve prompts for Bihar-focused competitive exam preparation
- [ ] Voice input and output for low-literacy users
- [ ] Fully offline APK with on-device inference (llama.cpp via JNI)
- [ ] Maithili, Bhojpuri, and Magahi language support
- [ ] Cached response history for offline review

---

## License

MIT

---

*If it works for a student in Madhubani, it will work for a student in Gaza.*
