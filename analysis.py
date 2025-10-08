import json
import pandas as pd
from collections import Counter
import re
import glob
from jinja2 import Template
import os

def generate_report(upload_folder):
    # ---- load all JSONs ----
    all_messages = []
    for filename in glob.glob(os.path.join(upload_folder, "message_*.json")):
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
            for msg in data["messages"]:
                if "content" in msg:
                    try:
                        msg["content"] = msg["content"].encode("latin1").decode("utf-8")
                    except Exception:
                        pass
            all_messages.extend(data["messages"])

    df = pd.DataFrame(all_messages)
    df["content"] = df["content"].fillna("")

    # Word & message counts
    df["word_count"] = df["content"].str.split().str.len()
    word_counts = df.groupby("sender_name")["word_count"].sum()
    msg_counts = df["sender_name"].value_counts()

    # Top words
    def get_top_words(messages, n=10):
        words = " ".join(messages).lower()
        words = re.findall(r"\b\w+\b", words)
        return Counter(words).most_common(n)

    # Top emojis
    emoji_pattern = re.compile(
        r"[\U0001F600-\U0001F64F"
        r"\U0001F300-\U0001F5FF"
        r"\U0001F680-\U0001F6FF"
        r"\U0001F700-\U0001F77F"
        r"\U0001F780-\U0001F7FF"
        r"\U0001F800-\U0001F8FF"
        r"\U0001F900-\U0001F9FF"
        r"\U0001FA00-\U0001FA6F"
        r"\U0001FA70-\U0001FAFF"
        r"\U0001FAF0-\U0001FAFF"
        r"\U00002700-\U000027BF]"
    )
    skin_tones = {"🏻", "🏼", "🏽", "🏾", "🏿"}

    def get_top_emojis(messages, n=10):
        all_text = " ".join(messages)
        emojis = emoji_pattern.findall(all_text)
        emojis = [e for e in emojis if e not in skin_tones]
        return Counter(emojis).most_common(n)

    # Detect reels
    df["is_reel"] = df["share"].astype(str).str.contains("instagram.com/reel", na=False)
    reel_counts = df.groupby("sender_name")["is_reel"].sum()

    # Top words & emojis per sender
    top_words = {}
    top_emojis = {}
    for person, group in df.groupby("sender_name"):
        msgs = group["content"].tolist()
        top_words[person] = get_top_words(msgs, 10)
        top_emojis[person] = get_top_emojis(msgs, 10)

    # ---- render template ----
    with open("template.html", "r", encoding="utf-8") as f:
        template_content = f.read()
    template = Template(template_content)

    html_output = template.render(
        message_counts=msg_counts.to_dict(),
        word_counts=word_counts.to_dict(),
        reel_counts=reel_counts.to_dict(),
        top_words=top_words,
        top_emojis=top_emojis
    )

    return html_output
