import sys
import json
import time

def main():
    input_line = sys.stdin.readline()
    if not input_line:
        print("No input received")
        return

    data = json.loads(input_line)
    user_message = data.get("userMessage", "")

    # Simulate AI processing delay
    time.sleep(1)

    response = {
        "reply": f"AI agent received your message: '{user_message}'"
    }
    print(json.dumps(response))
    sys.stdout.flush()

if __name__ == "__main__":
    main()
