#TOTAL MOST COMMON WORDS
 
import json
import re
from collections import Counter
 
with open("message_1.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [msg["content"] for msg in data["messages"] if "content" in msg]

all_text = " ".join(texts).lower()

words = re.findall(r"\b[a-z']+\b", all_text)

counter = Counter(words)

print(counter.most_common(10))
