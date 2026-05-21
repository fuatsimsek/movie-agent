"""Build the Colab training notebook as a single .ipynb file."""
import json

cells = []

def md(text):
    cells.append({"cell_type": "markdown", "metadata": {}, "source": text})

def code(text):
    cells.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": text})


# ---------- 1. INTRO ----------
md("""# Movie Agent — MPST + Llama 3.1 8B LoRA (Colab T4)

Bu notebook yapar:
1. MPST veri setini indirir + temizler
2. Talimat formatına çevirir
3. `mood_map.json` üretir
4. Unsloth ile LoRA fine-tune (T4 GPU)
5. GGUF Q4_K_M olarak export
6. Yerel Ollama'da kullanmak için ZIP indirir

**Önce:** Runtime → Change runtime type → **T4 GPU** seç.""")


# ---------- 2. GPU CHECK ----------
md("""## 1. GPU kontrol""")
code("""!nvidia-smi""")


# ---------- 3. INSTALL ----------
md("""## 2. Bağımlılıklar (~2-3 dk)""")
code("""%%capture
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps "trl<0.9.0" peft accelerate bitsandbytes
!pip install datasets pandas""")


# ---------- 4. DOWNLOAD MPST ----------
md("""## 3. MPST veri setini yükle

Birden fazla kaynak deneriz. Hepsi başarısız olursa CSV'yi elle yükle.""")
code("""import pandas as pd
from datasets import Dataset, load_dataset

df = None

# Deneme 1: HuggingFace mirror
hf_candidates = ["Mihir1108/MPST", "duxprajapati/movie-plot-synopses"]
for name in hf_candidates:
    try:
        ds = load_dataset(name, split="train")
        df = ds.to_pandas()
        print(f"OK: HF '{name}' -> {len(df)} satir")
        break
    except Exception as e:
        print(f"  fail {name}: {str(e)[:80]}")

# Deneme 2: direkt CSV
if df is None:
    try:
        url = "https://raw.githubusercontent.com/cryptexcode/MPST_Tags_Prediction/master/data/mpst_full_data.csv"
        df = pd.read_csv(url)
        print(f"OK: GitHub CSV -> {len(df)} satir")
    except Exception as e:
        print(f"  fail GitHub: {str(e)[:80]}")

# Deneme 3: manuel yukleme
if df is None:
    print("\\nManuel yukleme gerekli. mpst_full_data.csv dosyasini sec:")
    from google.colab import files
    up = files.upload()
    fname = list(up.keys())[0]
    df = pd.read_csv(fname)
    print(f"OK: yuklendi -> {len(df)} satir")

print("\\nKolonlar:", df.columns.tolist())
df.head(2)""")


# ---------- 5. EXPLORE ----------
md("""## 4. Veriyi tanı""")
code("""# Tipik MPST kolonlari: imdb_id, title, plot_synopsis, tags, split, synopsis_source
print("Ornek satir:")
print("Title:", df.iloc[0].get("title", "?"))
print("Tags :", df.iloc[0].get("tags", "?"))
print("Plot :", str(df.iloc[0].get("plot_synopsis", "?"))[:300], "...")
print("\\nTag dagilimi (top 20):")
from collections import Counter
all_tags = []
for t in df["tags"].dropna():
    all_tags.extend([x.strip().lower() for x in str(t).split(",")])
top = Counter(all_tags).most_common(20)
for tag, n in top:
    print(f"  {tag:25s} {n}")""")


# ---------- 6. FILTER + FORMAT ----------
md("""## 5. Filtre + train/val split + talimat formatı""")
code("""import re, random
random.seed(42)

WHITELIST = set([
    "murder","violence","flashback","romantic","cult","revenge","psychedelic","suspenseful",
    "action","dramatic","comedy","sentimental","neo noir","dark","philosophical","gothic",
    "fantasy","mystery","melodrama","comic","thought-provoking","satire","cruelty","paranormal",
    "sadist","atmospheric","horror","humor","alternate history","prank","plot twist","queer",
    "intrigue","allegory","autobiographical","magical realism","depressing","alternate reality",
    "suicidal","tragedy","claustrophobic","anti war","feel-good","historical","brainwashing",
    "absurd","bleak","entertaining","inspiring","western","avant garde","boring","clever",
    "cute","good versus evil","haunting","insanity","realism","religious","sci-fi","stupid",
    "whimsical","grindhouse film","blaxploitation","christian film","home movie","historical fiction",
    "non fiction","pornographic","sword and sandal","tragedy"
])

def clean_tags(s):
    if not isinstance(s, str): return []
    out = []
    for t in s.split(","):
        t = t.strip().lower()
        if t in WHITELIST:
            out.append(t)
    return out[:3]

def token_estimate(s):
    return len(str(s).split())

rows = []
for _, r in df.iterrows():
    plot = str(r.get("plot_synopsis", "")).strip()
    tags = clean_tags(r.get("tags", ""))
    n_tok = token_estimate(plot)
    if 100 <= n_tok <= 800 and 1 <= len(tags) <= 3:
        rows.append({"plot": plot, "tags": tags})

random.shuffle(rows)
rows = rows[:9000]
train = rows[:8000]
val   = rows[8000:9000]
print(f"train={len(train)}  val={len(val)}")

# Llama 3.1 chat template
SYSTEM = "Sen bir film etiketleyicisin. Verilen ozete gore 1-3 etiket dondur. SADECE JSON formatinda yanit ver."

def to_chat(r):
    user = f"Ozet: {r['plot'][:2500]}"
    asst = json.dumps({"genres": r["tags"]}, ensure_ascii=False)
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user",   "content": user},
        {"role": "assistant", "content": asst},
    ]

import json as _json
train_msgs = [{"messages": to_chat(r)} for r in train]
val_msgs   = [{"messages": to_chat(r)} for r in val]

print("Ornek:", train_msgs[0]["messages"][2]["content"])""")


# ---------- 7. MOOD MAP ----------
md("""## 6. mood_map.json üret (71 tag → 5 mood)""")
code("""mood_map = {
    # fun
    "comedy":"fun","humor":"fun","comic":"fun","satire":"fun","prank":"fun",
    "cute":"fun","entertaining":"fun","whimsical":"fun","feel-good":"fun",
    "stupid":"fun","clever":"fun",
    # adrenaline
    "action":"adrenaline","suspenseful":"adrenaline","violence":"adrenaline",
    "revenge":"adrenaline","horror":"adrenaline","murder":"adrenaline",
    "mystery":"adrenaline","intrigue":"adrenaline","neo noir":"adrenaline",
    "dark":"adrenaline","grindhouse film":"adrenaline","blaxploitation":"adrenaline",
    "good versus evil":"adrenaline","haunting":"adrenaline","plot twist":"adrenaline",
    # emotional
    "dramatic":"emotional","melodrama":"emotional","sentimental":"emotional",
    "tragedy":"emotional","depressing":"emotional","sadist":"emotional",
    "suicidal":"emotional","bleak":"emotional","cruelty":"emotional",
    "romantic":"emotional","queer":"emotional",
    # comfort
    "fantasy":"comfort","magical realism":"comfort","inspiring":"comfort",
    "christian film":"comfort","home movie":"comfort","western":"comfort",
    "sword and sandal":"comfort",
    # thought-provoking
    "philosophical":"thought-provoking","allegory":"thought-provoking",
    "absurd":"thought-provoking","avant garde":"thought-provoking",
    "autobiographical":"thought-provoking","historical":"thought-provoking",
    "historical fiction":"thought-provoking","anti war":"thought-provoking",
    "alternate history":"thought-provoking","alternate reality":"thought-provoking",
    "realism":"thought-provoking","non fiction":"thought-provoking",
    "psychedelic":"thought-provoking","brainwashing":"thought-provoking",
    "atmospheric":"thought-provoking","claustrophobic":"thought-provoking",
    "paranormal":"thought-provoking","gothic":"thought-provoking",
    "insanity":"thought-provoking","religious":"thought-provoking",
    "sci-fi":"thought-provoking","cult":"thought-provoking","flashback":"thought-provoking",
    "pornographic":"thought-provoking","boring":"thought-provoking",
}

with open("mood_map.json", "w", encoding="utf-8") as f:
    json.dump(mood_map, f, ensure_ascii=False, indent=2)

print(f"mood_map.json yazildi: {len(mood_map)} tag esleme")
print("Mood dagilimi:")
from collections import Counter
print(Counter(mood_map.values()))""")


# ---------- 8. LOAD MODEL ----------
md("""## 7. Llama 3.1 8B Instruct yükle (4-bit, ~5 dk indirme)""")
code("""from unsloth import FastLanguageModel
import torch

max_seq_length = 1024

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
    max_seq_length = max_seq_length,
    dtype = None,
    load_in_4bit = True,
)

from unsloth.chat_templates import get_chat_template
tokenizer = get_chat_template(tokenizer, chat_template="llama-3.1")
print("Model yuklendi. VRAM:", torch.cuda.memory_allocated()/1e9, "GB")""")


# ---------- 9. LORA CONFIG ----------
md("""## 8. LoRA adaptörleri ekle""")
code("""model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj","k_proj","v_proj","o_proj",
                       "gate_proj","up_proj","down_proj"],
    lora_alpha = 32,
    lora_dropout = 0.05,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 42,
    use_rslora = False,
    loftq_config = None,
)
model.print_trainable_parameters()""")


# ---------- 10. TOKENIZE ----------
md("""## 9. Dataset'i tokenize formatına çevir""")
code("""from datasets import Dataset

def format_conv(example):
    text = tokenizer.apply_chat_template(example["messages"], tokenize=False, add_generation_prompt=False)
    return {"text": text}

train_ds = Dataset.from_list(train_msgs).map(format_conv, remove_columns=["messages"])
val_ds   = Dataset.from_list(val_msgs).map(format_conv,   remove_columns=["messages"])

print(train_ds[0]["text"][:400])""")


# ---------- 11. TRAIN ----------
md("""## 10. Eğit (T4'te ~2-3 saat, 2 epoch)""")
code("""from trl import SFTTrainer
from transformers import TrainingArguments

trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = train_ds,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 10,
        num_train_epochs = 2,
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 20,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "cosine",
        seed = 42,
        output_dir = "outputs",
        report_to = "none",
        save_strategy = "no",
    ),
)

stats = trainer.train()
print(stats)""")


# ---------- 12. QUICK TEST ----------
md("""## 11. Hızlı inference testi""")
code("""FastLanguageModel.for_inference(model)

test_plot = ("A retired hitman is pulled back into the criminal underworld "
             "when a young gangster kills his beloved dog, sparking a violent "
             "rampage through the New York City underworld.")

msgs = [
    {"role":"system","content":"Sen bir film etiketleyicisin. Verilen ozete gore 1-3 etiket dondur. SADECE JSON formatinda yanit ver."},
    {"role":"user","content":f"Ozet: {test_plot}"},
]
inputs = tokenizer.apply_chat_template(msgs, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
out = model.generate(input_ids=inputs, max_new_tokens=40, temperature=0.1, do_sample=True)
print(tokenizer.decode(out[0][inputs.shape[1]:], skip_special_tokens=True))""")


# ---------- 13. SAVE GGUF ----------
md("""## 12. GGUF Q4_K_M olarak export (~10-15 dk)""")
code("""# llama.cpp ile GGUF'a cevirir + Q4_K_M kuantize eder
model.save_pretrained_gguf("movie-agent", tokenizer, quantization_method="q4_k_m")

import os
for root, dirs, files in os.walk("movie-agent"):
    for f in files:
        p = os.path.join(root, f)
        sz = os.path.getsize(p) / 1e6
        print(f"{p}  ({sz:.1f} MB)")""")


# ---------- 14. PACKAGE + DOWNLOAD ----------
md("""## 13. ZIP'le + indir (yerel Ollama için)""")
code("""import shutil, glob

gguf_files = glob.glob("movie-agent/*.gguf")
assert gguf_files, "GGUF bulunamadi!"
gguf_path = gguf_files[0]
print("GGUF:", gguf_path)

# Modelfile yaz
modelfile_content = f'''FROM ./{os.path.basename(gguf_path)}
PARAMETER temperature 0.2
PARAMETER num_predict 80
SYSTEM "Sen bir film etiketleyicisin. Sadece istenen JSON formatinda Turkce yanit ver."
'''
with open("movie-agent/Modelfile", "w") as f:
    f.write(modelfile_content)

# mood_map'i de paketin icine koy
shutil.copy("mood_map.json", "movie-agent/mood_map.json")

# ZIP yap
shutil.make_archive("movie-agent-bundle", "zip", "movie-agent")
sz = os.path.getsize("movie-agent-bundle.zip") / 1e6
print(f"\\nBundle: movie-agent-bundle.zip  ({sz:.1f} MB)")

from google.colab import files
files.download("movie-agent-bundle.zip")""")


# ---------- 15. NEXT STEPS ----------
md("""## 14. Sonraki adımlar (yerel WSL'de)

İndirdiğin `movie-agent-bundle.zip` dosyasını WSL'de `~/movie-agent/artifacts/` içine aç:

```bash
cd /mnt/c/Users/PC/movie-agent/artifacts
unzip ~/Downloads/movie-agent-bundle.zip
ollama create movie-agent -f Modelfile
ollama run movie-agent "Test"
```

Sonra `demo.py` ile demo yapacaksın (proje dizininde hazır).""")


# ---------- WRITE NOTEBOOK ----------
notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
        "accelerator": "GPU",
        "colab": {"provenance": [], "gpuType": "T4"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

with open("movie_agent_train.ipynb", "w", encoding="utf-8") as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print(f"OK: movie_agent_train.ipynb ({len(cells)} hücre)")
