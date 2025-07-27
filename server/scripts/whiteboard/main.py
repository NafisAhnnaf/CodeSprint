import sys
import json
import time

def main():
    input_line = sys.stdin.readline()
    if not input_line:
        print("No input received")
        return

    data = json.loads(input_line)
    # For example, just acknowledge receipt of whiteboard data
    time.sleep(0.5)

    print(f"Whiteboard data saved: {json.dumps(data)}")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
