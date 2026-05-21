"""Movie Mood Agent — Flask web arayuzu.

Calistirmak icin:
    pip install flask requests
    python3 app.py
    -> http://localhost:5000

Onkosul:
    ollama serve calisiyor olmali ve `movie-agent` model yuklu olmali.
"""
import json
import re
from pathlib import Path
import mimetypes

import requests
from flask import Flask, jsonify, render_template, request, send_from_directory

# Ensure SVG MIME type
mimetypes.add_type('image/svg+xml', '.svg')

ROOT = Path(__file__).resolve().parent.parent
MOOD_MAP_PATH = ROOT / "artifacts" / "mood_map.json"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_TUNED = "movie-agent"   # Fine-tuned: SADECE tur siniflandirma
MODEL_BASE = "llama3.1:8b"    # Base: oneri ve mood siniflandirma

VALID_MOODS = ["fun", "adrenaline", "emotional", "comfort", "thought-provoking"]
MOOD_HINTS = {
    "fun": "eglenceli, hafif, gulduren",
    "adrenaline": "heyecanli, aksiyon dolu, gerilimli",
    "emotional": "duygusal, dramatik, yogun",
    "comfort": "rahatlatici, sicacik, tanidik",
    "thought-provoking": "dusundurucu, felsefi, derin",
}

# Curated film library (matching frontend POSTER_DATA)
FILM_LIBRARY = {
    "Inception": {"year": 2010, "moods": ["thought-provoking", "adrenaline"]},
    "The Dark Knight": {"year": 2008, "moods": ["adrenaline", "thought-provoking"]},
    "Interstellar": {"year": 2014, "moods": ["thought-provoking", "emotional"]},
    "Pulp Fiction": {"year": 1994, "moods": ["adrenaline", "fun"]},
    "The Godfather": {"year": 1972, "moods": ["emotional", "thought-provoking"]},
    "La La Land": {"year": 2016, "moods": ["emotional", "comfort"]},
    "Parasite": {"year": 2019, "moods": ["thought-provoking", "emotional"]},
    "Whiplash": {"year": 2014, "moods": ["adrenaline", "emotional"]},
    "The Matrix": {"year": 1999, "moods": ["adrenaline", "thought-provoking"]},
    "Joker": {"year": 2019, "moods": ["emotional", "thought-provoking"]},
    "Blade Runner": {"year": 1982, "moods": ["thought-provoking", "adrenaline"]},
    "Her": {"year": 2013, "moods": ["emotional", "comfort"]},
    "Fight Club": {"year": 1999, "moods": ["thought-provoking", "adrenaline"]},
    "Shawshank": {"year": 1994, "moods": ["emotional", "comfort"]},
    "Spirited Away": {"year": 2001, "moods": ["comfort", "fun"]},
    "Cinema Paradiso": {"year": 1988, "moods": ["comfort", "emotional"]},
    "Schindler's": {"year": 1993, "moods": ["emotional", "thought-provoking"]},
    "Silence Lambs": {"year": 1991, "moods": ["adrenaline", "emotional"]},
    "Forrest Gump": {"year": 1994, "moods": ["comfort", "emotional"]},
    "Mad Max": {"year": 2015, "moods": ["adrenaline", "fun"]},
    "1917": {"year": 2019, "moods": ["adrenaline", "emotional"]},
    "No Country": {"year": 2007, "moods": ["adrenaline", "thought-provoking"]},
    "Get Out": {"year": 2017, "moods": ["adrenaline", "thought-provoking"]},
    "The Revenant": {"year": 2015, "moods": ["adrenaline", "emotional"]},
    "Goodfellas": {"year": 1990, "moods": ["adrenaline", "fun"]},
    "Titanic": {"year": 1997, "moods": ["emotional", "comfort"]},
    "Black Swan": {"year": 2010, "moods": ["emotional", "adrenaline"]},
    "Social Network": {"year": 2010, "moods": ["thought-provoking", "adrenaline"]},
    "Avengers": {"year": 2019, "moods": ["adrenaline", "fun"]},
    "American Beauty": {"year": 1999, "moods": ["emotional", "thought-provoking"]},
}

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

app = Flask(__name__, template_folder=str(TEMPLATES_DIR))


def _load_mood_map() -> dict:
    if not MOOD_MAP_PATH.exists():
        raise FileNotFoundError(f"{MOOD_MAP_PATH} yok. Colab bundle acildi mi?")
    return json.loads(MOOD_MAP_PATH.read_text(encoding="utf-8"))


def _call_model(prompt: str, temperature: float, num_predict: int, model: str = MODEL_BASE) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": num_predict},
        },
        timeout=90,
    )
    response.raise_for_status()
    return response.json()["response"].strip()


def _extract_genres(raw: str) -> list[str]:
    match = re.search(r"\{[^{}]*\}", raw, re.DOTALL)
    if not match:
        return []
    try:
        parsed = json.loads(match.group())
    except json.JSONDecodeError:
        return []
    genres = parsed.get("genres") or parsed.get("türler") or parsed.get("tags") or []
    return [g.lower().strip() for g in genres if isinstance(g, str)]


def classify_genre(plot: str) -> dict:
    """Fine-tuned movie-agent kullanir."""
    prompt = (
        "Sen bir film etiketleyicisin. Asagidaki ozet icin 1-3 etiket dondur. "
        'SADECE su formatta JSON dondur: {"genres": ["...", "..."]}\n\n'
        f"Ozet: {plot}"
    )
    raw = _call_model(prompt, temperature=0.1, num_predict=40, model=MODEL_TUNED)
    return {"genres": _extract_genres(raw), "raw": raw}


def analyze_emotion(user_text: str) -> dict:
    """Katman 1: cok boyutlu duygu analizi (base model)."""
    prompt = (
        "Kullanicinin duygu durumunu detayli analiz et:\n"
        f'"{user_text}"\n\n'
        "SADECE su JSON formatinda dondur, baska hicbir sey yazma:\n"
        '{"energy_level": "low|medium|high", "mood_valence": "positive|negative|neutral", '
        '"needs": ["istedigi 2-4 ozellik (Turkce)"], '
        '"avoid": ["kaciniaca 2-3 ozellik (Turkce)"], '
        '"summary": "Tek cumle Turkce ozet"}'
    )
    raw = _call_model(prompt, temperature=0.3, num_predict=250, model=MODEL_BASE)
    parsed = {}
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group())
        except json.JSONDecodeError:
            parsed = {}
    return {
        "energy_level": parsed.get("energy_level") or "medium",
        "mood_valence": parsed.get("mood_valence") or "neutral",
        "needs": parsed.get("needs") or [],
        "avoid": parsed.get("avoid") or [],
        "summary": parsed.get("summary") or user_text,
    }


def recommend_for_emotion(emotion: dict) -> dict:
    """Katman 2: duygu profiline gore film/dizi oner (base model)."""
    prompt = (
        "Sen bir film/dizi onericisisin. Kullanicinin su duygu profiline UYGUN gercek bir yapim oner:\n"
        f"Enerji: {emotion['energy_level']}\n"
        f"Ruh hali: {emotion['mood_valence']}\n"
        f"Ihtiyaclar: {', '.join(emotion['needs']) if emotion['needs'] else 'belirsiz'}\n"
        f"Kacinilmasi gereken: {', '.join(emotion['avoid']) if emotion['avoid'] else 'yok'}\n\n"
        "SADECE su formatta JSON dondur, baska hicbir sey yazma:\n"
        '{"title": "Film/dizi adi", "year": 2020, "type": "film veya dizi", '
        '"plot": "Filmin konusunu Ingilizce 2-3 cumle ile yaz", '
        '"reason": "Bu yapimin kullanicinin duygu durumuna neden uydugunu Turkce tek cumle ile yaz"}'
    )
    raw = _call_model(prompt, temperature=0.6, num_predict=400, model=MODEL_BASE)
    parsed = {}
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group())
        except json.JSONDecodeError:
            parsed = {}
    return {
        "title": parsed.get("title") or parsed.get("ad") or "?",
        "year": parsed.get("year") or parsed.get("yil"),
        "type": parsed.get("type") or parsed.get("tur") or "yapim",
        "plot": parsed.get("plot") or parsed.get("konu") or "",
        "reason": parsed.get("reason") or parsed.get("aciklama") or "",
    }


def _select_film_by_mood(target_moods: list[str]) -> dict:
    """Detected mood'a uygun filmi FILM_LIBRARY'den seç."""
    import random

    candidates = []
    for title, info in FILM_LIBRARY.items():
        if any(m in info["moods"] for m in target_moods):
            candidates.append({"title": title, "year": info["year"]})

    if not candidates:
        title = random.choice(list(FILM_LIBRARY.keys()))
        candidates = [{"title": title, "year": FILM_LIBRARY[title]["year"]}]

    return random.choice(candidates)


def _emotion_to_moods(emotion: dict) -> list[str]:
    """Emotion profilinden güvenilir mood kategorileri türet."""
    energy = emotion.get("energy_level", "medium")
    valence = emotion.get("mood_valence", "neutral")
    if valence == "positive":
        return ["fun", "adrenaline"] if energy == "high" else ["comfort", "fun"]
    elif valence == "negative":
        return ["comfort"] if energy == "low" else ["emotional"]
    else:
        return ["thought-provoking"]


def describe_film_for_emotion(title: str, year: int, emotion: dict) -> dict:
    """Seçilen film için plot ve gerekçe üret — title/plot uyumu garantili."""
    prompt = (
        f"Film: {title} ({year})\n"
        f"Kullanicinin ruh hali: enerji={emotion['energy_level']}, "
        f"valens={emotion['mood_valence']}\n\n"
        "SADECE su formatta JSON dondur, baska hicbir sey yazma:\n"
        '{"plot": "Filmin gercek konusunu Ingilizce 2-3 cumle ile yaz", '
        '"reason": "Bu filmin kullanicinin ruh haline neden uydugunu Turkce tek cumle ile yaz"}'
    )
    raw = _call_model(prompt, temperature=0.4, num_predict=300, model=MODEL_BASE)
    parsed = {}
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group())
        except json.JSONDecodeError:
            parsed = {}
    return {
        "plot": parsed.get("plot", ""),
        "reason": parsed.get("reason", ""),
    }


def find_movie(user_text: str) -> dict:
    """5 katmanli pipeline: duygu -> mood -> film sec -> icerik uret -> tur."""
    # Katman 1: duygu analizi
    emotion = analyze_emotion(user_text)

    # Katman 2: emotion'dan direkt mood kategorileri (güvenilir, genre hatasına bağımlı değil)
    detected_moods = _emotion_to_moods(emotion)

    # Katman 3: mood'a uygun filmi library'den seç
    selected_film = _select_film_by_mood(detected_moods)
    title, year = selected_film["title"], selected_film["year"]

    # Katman 4: seçilen film için plot ve gerekçe üret (title-plot uyumu garantili)
    film_desc = describe_film_for_emotion(title, year, emotion)
    plot = film_desc["plot"]

    # Katman 5: fine-tuned model ile tur tahmini + mood_map eslesme (görüntü için)
    genres = classify_genre(plot)["genres"] if plot else []
    mood_map = _load_mood_map()
    genre_moods = sorted({mood_map[g] for g in genres if g in mood_map})
    if not genre_moods:
        genre_moods = detected_moods

    final_recommendation = {
        "title": title,
        "year": year,
        "type": "film",
        "plot": plot,
        "reason": film_desc["reason"],
    }

    return {
        "emotion": emotion,
        "recommendation": final_recommendation,
        "genres": genres,
        "detected_moods": detected_moods,
    }


def classify_user_mood(user_text: str) -> str | None:
    """Serbest Turkce ruh hali metnini 5 kategoriden birine esler."""
    categories_desc = "\n".join(f"- {m}: {hint}" for m, hint in MOOD_HINTS.items())
    prompt = (
        "Asagidaki Turkce ruh hali aciklamasini sadece su 5 kategoriden BIRINE eslestir. "
        "SADECE kategori adini tek kelime olarak dondur, baska hicbir sey yazma.\n\n"
        f"Kategoriler:\n{categories_desc}\n\n"
        f"Aciklama: {user_text}\n"
        "Kategori:"
    )
    raw = _call_model(prompt, temperature=0.0, num_predict=15).lower()
    for mood in VALID_MOODS:
        if mood in raw:
            return mood
    return None


def mood_match(plot: str, user_mood: str) -> dict:
    if user_mood not in VALID_MOODS:
        return {"error": f"Gecersiz mood: {user_mood}"}

    classification = classify_genre(plot)
    genres = classification["genres"]
    mood_map = _load_mood_map()
    detected_moods = sorted({mood_map[g] for g in genres if g in mood_map})
    is_match = user_mood in detected_moods

    reason_prompt = (
        f"Bu film '{user_mood}' ruh halinde olan birine uygun mu? "
        "Tek cumle Turkce gerekce yaz. Asiri uzun olma.\n\n"
        f"Ozet: {plot}"
    )
    reason = _call_model(reason_prompt, temperature=0.3, num_predict=80)

    return {
        "match": is_match,
        "detected_moods": detected_moods,
        "genres": genres,
        "reason": reason,
    }


@app.route("/")
def index():
    return render_template("Movie Agent.html")


@app.route("/api/find", methods=["POST"])
def find():
    data = request.get_json(silent=True) or {}
    user_text = (data.get("text") or "").strip()

    if not user_text:
        return jsonify({"error": "Nasil hissettigini yaz"}), 400
    if len(user_text) < 10:
        return jsonify({"error": "Biraz daha detay yaz (en az 10 karakter)"}), 400
    if len(user_text) > 1000:
        return jsonify({"error": "Metin cok uzun (max 1000 karakter)"}), 400

    try:
        result = find_movie(user_text)
        return jsonify(result)
    except requests.ConnectionError:
        return jsonify({"error": "Ollama'ya baglanilamadi. 'ollama serve' calisiyor mu?"}), 503
    except requests.Timeout:
        return jsonify({"error": "Model cevap vermedi (timeout)"}), 504
    except Exception as e:
        return jsonify({"error": f"Beklenmedik hata: {e}"}), 500


@app.route("/posters/<path:filename>")
def serve_posters(filename):
    """Serve poster SVG files."""
    return send_from_directory(TEMPLATES_DIR / "posters", filename)


@app.route("/<path:filename>")
def serve_static(filename):
    """Serve static files (CSS, JS, SVG) from templates directory."""
    return send_from_directory(TEMPLATES_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
