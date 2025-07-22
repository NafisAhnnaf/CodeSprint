import subprocess
from pathlib import Path

# Configuration
SEGMENTS_DIR = "segments"
CAPTIONS_DIR = "captions"
WHISPER_COMMAND = [
    "mlx_whisper",
    "--model", "mlx-community/whisper-base-mlx",
    "--output-format", "srt",
    "--language", "en",
    "--no-speech-threshold", "0.5",
    "--word-timestamps", "True",
    "--hallucination-silence-threshold", "1.0"
]


def process_segments(segment_dir = SEGMENTS_DIR, captions_dir = CAPTIONS_DIR, whisper_command = WHISPER_COMMAND):
    # Ensure segments directory exists
    segments_path = Path(segment_dir)
    if not segments_path.exists():
        print(f"Error: Directory '{segment_dir}' not found.")
        return
    
    # Create captions directory if it doesn't exist
    captions_path = Path(captions_dir)
    captions_path.mkdir(parents=True, exist_ok=True)
    
    # Find all MP4 files in the directory
    mp4_files = list(segments_path.glob("*.mp4"))
    if not mp4_files:
        print(f"No MP4 files found in '{segment_dir}'.")
        return
    
    print(f"Found {len(mp4_files)} MP4 files to process.")
    
    for mp4_file in mp4_files:
        print(f"\nProcessing: {mp4_file.name}")
        
        # Build the output path (same name but .srt in captions folder)
        output_path = captions_path / f"{mp4_file.stem}.srt"
        
        # Build the command
        command = whisper_command.copy()
        command.extend(["--output-dir", str(captions_path)])  # Output directory
        command.insert(1, str(mp4_file))  # Insert input file path after mlx_whisper
        
        try:
            # Run the command
            subprocess.run(command, check=True)
            print(f"Successfully generated captions: {output_path}")

        except subprocess.CalledProcessError as e:
            print(f"Error processing {mp4_file.name}: {e}")

        except Exception as e:
            print(f"Unexpected error processing {mp4_file.name}: {e}")


if __name__ == "__main__":
    process_segments()
    print("\nProcessing complete.")
