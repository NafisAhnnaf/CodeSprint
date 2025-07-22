import sys
text = sys.stdin.read().strip()
print(f"Processing: {text}")
with open("result.txt", "w") as f:
    f.write(f"Processed text: {text}")
