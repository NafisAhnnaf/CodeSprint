import sys
import json
import time

def main():
    # Input passed as argument
    if len(sys.argv) < 2:
        print("No input argument")
        sys.exit(1)

    input_data = json.loads(sys.argv[1])
    file_path = input_data.get("path", "unknown")

    # Simulate quiz generation delay
    time.sleep(2)

    print(f"Quiz generated successfully at {file_path}")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
