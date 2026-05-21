# Movie Agent

A mood-based movie recommendation system built with a 5-layer AI pipeline. You describe how you're feeling in Turkish, and the app suggests a film that matches your emotional state.

Runs entirely offline using Ollama for local LLM inference.

---

## Features

- Natural language input in Turkish
- Fully offline (no API keys, no internet required for inference)
- 5-layer AI pipeline: emotion analysis, recommendation, genre classification, mood mapping, and film selection
- Fine-tuned model for genre classification (Ollama Modelfile + system prompt)
- Cinematic dark UI with React 18
- 3-stage poster fallback: TMDB CDN, SVG, and text placeholder
- Curated library of 30 films

---

## How It Works

```
User input (Turkish mood description)
        |
[1] Emotion Analysis      — llama3.1:8b    (energy level, mood valence, needs)
        |
[2] Film Recommendation   — llama3.1:8b    (title, year, plot, reason)
        |
[3] Genre Classification  — movie-agent    (1-3 genre tags)
        |
[4] Mood Mapping          — mood_map.json  (deterministic genre-to-mood lookup)
        |
[5] Film Selection        — FILM_LIBRARY   (filtered from 30 curated films)
        |
React UI (poster + pipeline visualization)
```

The key design decision in Layer 5: the AI's recommendation is always filtered against a curated library of 30 films, so the output is always a verified, well-known title.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Babel (in-browser JSX, no build step) |
| Backend | Flask 3.x |
| AI Runtime | Ollama + llama3.1:8b |
| Fine-tuned Model | movie-agent (Modelfile + system prompt) |
| Posters | TMDB CDN with SVG fallback |

---

## Setup

### Prerequisites

- Python 3.9 or higher
- [Ollama](https://ollama.com) installed and running (`ollama serve`)

### 1. Pull the base model

```bash
ollama pull llama3.1:8b
```

### 2. Create the fine-tuned model

```bash
cd artifacts
ollama create movie-agent -f Modelfile
```

Note: The Modelfile references a LoRA adapter (`movie-agent-lora.gguf`) which is not included in this repo due to file size. You can recreate it using the training notebook (`movie_agent_train.ipynb`) on Google Colab, or remove the `ADAPTER` line from the Modelfile to use base llama3.1:8b with just the system prompt.

### 3. Install dependencies

```bash
cd web
pip install -r requirements.txt
```

### 4. Start the server

```bash
python3 app.py
```

Open your browser at http://localhost:5000

---

## Testing the API

```bash
curl -X POST http://localhost:5000/api/find \
  -H "Content-Type: application/json" \
  -d '{"text":"Cok mutsuzum, derin duygusal film istiyorum"}'
```

Example response:

```json
{
  "emotion": { "energy_level": "low", "mood_valence": "negative" },
  "recommendation": { "title": "Joker", "year": 2019 },
  "genres": ["drama", "psychological"],
  "detected_moods": ["emotional", "thought-provoking"]
}
```

---

## Project Structure

```
movie-agent/
├── artifacts/
│   ├── Modelfile             # Ollama model definition
│   └── mood_map.json         # Genre to mood mapping table
├── web/
│   ├── app.py                # Flask backend (5-layer pipeline logic)
│   ├── requirements.txt
│   └── templates/
│       ├── Movie Agent.html  # React entry point
│       ├── *.jsx             # React components
│       ├── tokens.css        # Design tokens
│       └── posters/          # SVG poster fallbacks (30 films)
├── build_notebook.py         # Training notebook builder
├── demo.py                   # CLI demo script
├── movie_agent_train.ipynb   # Colab fine-tuning notebook (Unsloth + QLoRA)
├── SYSTEM_ARCHITECTURE.svg   # Architecture diagram
└── view-architecture.html    # Architecture diagram viewer
```

---

## Fine-tuning Approach

The `movie-agent` model is llama3.1:8b adapted via an Ollama Modelfile with a specialized system prompt for genre classification. The model returns only a JSON object with genre tags, nothing else.

```
FROM llama3.1:8b
ADAPTER ./movie-agent-lora.gguf
PARAMETER temperature 0.2
PARAMETER num_predict 80
SYSTEM "Sen bir film etiketleyicisin..."
```

For full LoRA fine-tuning, see `movie_agent_train.ipynb`. It uses Unsloth + QLoRA on the MPST dataset and runs on a Colab T4 GPU in roughly 5 hours.

---

## Design

The UI uses a cinematic dark theme ("Criterion Dark") built with React 18 and in-browser Babel (no build step required). All design tokens are in `web/templates/tokens.css`.

Colors: dark navy backgrounds, amber accent (#C8871A), muted text.  
Fonts: Syne for headings, Space Grotesk for body, JetBrains Mono for code.

---

**Author:** Fuat Simsek
