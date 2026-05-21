# 🎬 Movie Agent

Kullanıcının ruh halini açıklayan doğal dilde bir cümle yazması sonrasında, o duygusal duruma uygun bir film önerisinde bulunan **5-katmanlı AI pipeline** sistemi.

Tamamen offline çalışır (Ollama ile lokal LLM inference), Türkçe doğal dil destekler.

---

## ✨ Özellikler

- 🇹🇷 Türkçe doğal dil girdisi
- 🔌 Tamamen offline (Ollama lokal LLM)
- 🧠 5-katmanlı AI pipeline (emotion → recommendation → genre → mood → film selection)
- 🎯 Fine-tuned model (`movie-agent`) — Modelfile + sistem prompt ile
- 🎨 Sinematik UI (Criterion Dark teması, React 18)
- 🖼️ 3-aşamalı poster fallback (TMDB → SVG → text placeholder)
- 📚 30 kurgulu film kütüphanesi

---

## 🏗️ Pipeline Mimarisi

```
Kullanıcı girdisi (Türkçe ruh hali)
        ↓
[1] EMOTION ANALYSIS      → llama3.1:8b      (energy, valence, needs)
        ↓
[2] RECOMMENDATION        → llama3.1:8b      (title, year, plot, reason)
        ↓
[3] GENRE CLASSIFICATION  → movie-agent      (1–3 tür etiketi)
        ↓
[4] MOOD MAPPING          → mood_map.json    (deterministik genre→mood)
        ↓
[5] FILM SELECTION        → FILM_LIBRARY     (30 filmden filtrelenmiş seçim)
        ↓
React UI (poster + pipeline visualization)
```

**Anahtar nokta (Katman 5):** AI'ın önerdiği film, kurgulu 30 filmlik kütüphane ile filtrelenir. Listede olmayan bir film hiçbir zaman kullanıcıya sunulmaz.

---

## 🔧 Teknik Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + Babel (in-browser JSX) |
| Backend | Flask 3.x |
| AI Runtime | Ollama + llama3.1:8b |
| Fine-tuned Model | `movie-agent` (Modelfile + sistem prompt) |
| Posters | TMDB CDN + SVG fallback |

---

## 🚀 Kurulum & Çalıştırma

### Ön koşullar

- Python 3.9+
- [Ollama](https://ollama.com/) (yüklü ve `ollama serve` çalışır durumda)

### 1) Modelleri hazırla

```bash
# Base model
ollama pull llama3.1:8b

# Fine-tuned model (proje köküne göre)
cd artifacts
ollama create movie-agent -f Modelfile
```

> **Not:** `Modelfile` LoRA adapter (`movie-agent-lora.gguf`) bekler. Bu dosya GitHub'a (100MB limit nedeniyle) dahil değildir. Eğitim notebook'u (`movie_agent_train.ipynb`) üzerinden Colab'da yeniden üretebilirsiniz.

### 2) Bağımlılıklar

```bash
cd web
pip install -r requirements.txt
```

### 3) Çalıştır

```bash
python3 app.py
```

Tarayıcıdan aç: <http://localhost:5000>

---

## 🧪 Test

### API endpoint

```bash
curl -X POST http://localhost:5000/api/find \
  -H "Content-Type: application/json" \
  -d '{"text":"Çok mutsuzum, derin duygusal film istiyorum"}'
```

Örnek cevap:

```json
{
  "emotion": { "energy_level": "low", "mood_valence": "negative", ... },
  "recommendation": { "title": "Joker", "year": 2019, ... },
  "genres": ["drama", "psychological"],
  "detected_moods": ["emotional", "thought-provoking"]
}
```

---

## 📁 Repo Yapısı

```
movie-agent/
├── artifacts/
│   ├── Modelfile             # Ollama fine-tuning tanımı
│   └── mood_map.json         # Genre → mood eşleştirmesi
├── web/
│   ├── app.py                # Flask backend (5-katmanlı pipeline)
│   ├── requirements.txt
│   └── templates/
│       ├── Movie Agent.html  # React entry
│       ├── *.jsx             # React bileşenleri
│       ├── tokens.css        # Design tokens
│       └── posters/          # SVG poster fallback'leri
├── build_notebook.py         # Notebook builder
├── demo.py                   # CLI demo
├── movie_agent_train.ipynb   # Colab fine-tuning notebook
├── SYSTEM_ARCHITECTURE.svg   # Sistem mimari diyagramı
└── view-architecture.html    # Mimari görüntüleyici
```

---

## 🤖 Fine-tuning Yaklaşımı

`movie-agent` modeli, `llama3.1:8b` üzerinde **Ollama Modelfile + sistem prompt engineering** ile uyarlanmıştır.

```dockerfile
FROM llama3.1:8b
ADAPTER ./movie-agent-lora.gguf
PARAMETER temperature 0.2
PARAMETER num_predict 80
SYSTEM "Sen bir film etiketleyicisin. Verilen özete göre 1-3 etiket döndür..."
```

Alternatif olarak `movie_agent_train.ipynb` notebook'u, Unsloth + QLoRA ile MPST dataset üzerinde tam LoRA fine-tuning sürecini içerir (Colab T4 üzerinde ~5 saat).

---

## 🎨 Tasarım

UI Claude Designer ile kurgulanmış "Criterion Dark" temasını kullanır:

- Renkler: `#07070F`, `#0C0C1B`, `#C8871A` (amber accent), `#DEAB52`
- Tipografi: Syne (display), Space Grotesk (body), JetBrains Mono (code)
- Tüm token'lar `web/templates/tokens.css` içinde

---

## 📝 Lisans

Kişisel / akademik kullanım için.

---

**Geliştiren:** Fuat Şimşek
