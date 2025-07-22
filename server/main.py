import os
import sys

def setup_directories():
    """Create necessary directories and files before execution."""
    directories = [
        "captions",
        "captionsCut",
        "DeadCut",
        "output",
        "reframe",
        "segments",
        "styledSubtitles"
    ]
    
    # Create directories
    for dir_name in directories:
        os.makedirs(dir_name, exist_ok=True)
    
    # Create empty segments.json if it doesn't exist
    if not os.path.exists("segments.json"):
        with open("segments.json", "w") as f:
            f.write("")

def cleanup():
    """Remove temporary directories after execution."""
    dirs_to_remove = [
        "captions",
        "captionsCut",
        "DeadCut",
        "reframe",
        "segments",
        "styledSubtitles"
    ]
    
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            # Remove all files in the directory first
            for file_name in os.listdir(dir_name):
                file_path = os.path.join(dir_name, file_name)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
            
            # Remove the directory itself
            try:
                os.rmdir(dir_name)
            except Exception as e:
                print(f"Error removing directory {dir_name}: {e}")

def main():
    # Setup environment
    setup_directories()
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Accept YouTube URL as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python main.py <YouTube URL>")
        sys.exit(1)
    youtube_url = sys.argv[1]

    # Execute scripts in order
    scripts = [
        ("getSubSegments.py", [youtube_url]),   # Step 1: Get interesting segments from YouTube video
        ("cutVidBySegments.py", []), # Step 2: Download the video segments
        ("saveCaptions.py", []),     # Step 3: Generate captions for each segment
        ("srtCutter.py", []),        # Step 4: Cut segments based on captions
        ("autoCrop.py", []),         # Step 5: Auto-crop the final videos
        ("burnCaptions.py", [])      # Step 6: Burn the captions into the videos and save to output
    ]
    
    for script, args in scripts:
        script_path = os.path.join(BASE_DIR, script)
        arg_str = ' '.join([f'"{a}"' for a in args])
        cmd = f'python3 "{script_path}" {arg_str}'
        print(f"\nExecuting {cmd}...")
        exit_code = os.system(cmd)
        if exit_code != 0:
            print(f"Warning: {script} exited with code {exit_code}")
        print(f"Finished {script}")
    
    # Clean up temporary files
    cleanup()
    print("\nProcessing complete. Only the 'output' directory and 'segments.json' remain.")

if __name__ == "__main__":
    main()
