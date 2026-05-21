"""Movie Agent — sinif demosu.

Kullanim:
    python3 demo.py "film ozeti burada..."

Onkosul:
    1. Colab'da egittigin movie-agent-bundle.zip'i artifacts/ icine ac.
    2. ollama create movie-agent -f artifacts/Modelfile
    3. ollama run movie-agent "test"  -> calistigini dogrula
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
MOOD_MAP_PATH = ROOT / "artifacts" / "mood_map.json"
MODEL_NAME = "movie-agent"

VALID_MOODS = {"fun", "adrenaline", "emotional", "comfort", "thought-provoking"}


def _load_mood_map() -> dict:
    if not MOOD_MAP_PATH.exists():
        print(f"HATA: {MOOD_MAP_PATH} yok. Colab bundle'ini acmadin mi?", file=sys.stderr)
        sys.exit(1)
    return json.loads(MOOD_MAP_PATH.read_text(encoding="utf-8"))


def _call_ollama(prompt: str, temperature: float, num_predict: int) -> str:
    cmd = [
        "ollama", "run", MODEL_NAME,
        "--",  # stdin yerine arg modu
    ]
    full_prompt = (
        f"<<SYS>>temperature={temperature} num_predict={num_predict}<</SYS>>\n{prompt}"
    )
    result = subprocess.run(
        ["ollama", "run", MODEL_NAME, full_prompt],
        capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ollama hata: {result.stderr}")
    return result.stdout.strip()


def _extract_json(text: str) -> dict:
    m = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if not m:
        return {}
    try:
        return json.loads(m.group())
    except json.JSONDecodeError:
        return {}


def classify_genre(plot: str) -> dict:
    """Fonksiyon 1: film ozetinden 1-3 tag tahmin eder."""
    prompt = (
        "Sen bir film etiketleyicisin. Asagidaki ozet icin 1-3 etiket dondur. "
        "SADECE su formatta JSON dondur: {\"genres\": [\"...\", \"...\"]}\n\n"
        f"Ozet: {plot}"
    )
    raw = _call_ollama(prompt, temperature=0.1, num_predict=40)
    parsed = _extract_json(raw)
    genres = parsed.get("genres", [])
    return {
        "genres": [g.lower().strip() for g in genres if isinstance(g, str)],
        "raw": raw,
    }


def mood_match(plot: str, user_mood: str) -> dict:
    """Fonksiyon 2: film + ruh hali -> uyumlu mu + tek cumle gerekce."""
    if user_mood not in VALID_MOODS:
        return {"match": False, "reason": f"Gecersiz mood. Sec: {VALID_MOODS}"}

    classification = classify_genre(plot)
    genres = classification["genres"]

    mood_map = _load_mood_map()
    detected_moods = {mood_map[g] for g in genres if g in mood_map}

    deterministic_match = user_mood in detected_moods

    prompt = (
        f"Bu film ozetini '{user_mood}' ruh halinde olan birine uygun mu? "
        "Tek cumle Turkce gerekce yaz. Onerme/onermeme kararini ver.\n\n"
        f"Ozet: {plot}"
    )
    reason = _call_ollama(prompt, temperature=0.3, num_predict=60)

    return {
        "match": deterministic_match,
        "detected_moods": sorted(detected_moods),
        "genres": genres,
        "reason": reason,
    }


def _main():
    if len(sys.argv) < 2:
        print("Kullanim: python3 demo.py \"film ozeti burada\"")
        sys.exit(1)

    plot = sys.argv[1]

    print("\n=== 1) Tur tahmini ===")
    g = classify_genre(plot)
    print(json.dumps(g, ensure_ascii=False, indent=2))

    print("\n=== 2) Ruh hali sor ===")
    print("Secenekler:", ", ".join(sorted(VALID_MOODS)))
    mood = input("Ruh haliniz: ").strip().lower()

    print("\n=== 3) Mood Match ===")
    result = mood_match(plot, mood)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    _main()
