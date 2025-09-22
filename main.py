import json
import pandas as pd
from collections import Counter
import re

# load your exported messenger file
with open("message_1.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# put messages into a DataFrame
df = pd.DataFrame(data["messages"])

# handle missing content safely
df["content"] = df.get("content", "")

# word count per message
df["word_count"] = df["content"].apply(lambda x: len(str(x).split()))

# word count per person
word_counts = df.groupby("sender_name")["word_count"].sum()

# message count per person
msg_counts = df["sender_name"].value_counts()

# function to get top words
def get_top_words(messages, n=10):
    words = " ".join(messages).lower()
    words = re.findall(r"\b\w+\b", words)  # keep only words
    return Counter(words).most_common(n)

# top words for each person
top_words = {}
for person in df["sender_name"].unique():
    msgs = df[df["sender_name"] == person]["content"].dropna().tolist()
    top_words[person] = get_top_words(msgs, 10)

print("Message counts:\n", msg_counts, "\n")
print("Word counts:\n", word_counts, "\n")
print("Top words:\n", top_words)
