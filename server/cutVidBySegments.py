import json
import re
import subprocess
from pathlib import Path


def cut_youtube_segments(segments_data: dict, output_dir: str = "segments") -> None:
    """Cut segments using yt-dlp."""
    # Check if video_url exists in the data
    if "video_url" not in segments_data:
        raise ValueError("video_url not found in segments.json")
    
    youtube_url = segments_data["video_url"]
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    for segment in segments_data["segments"]:
        safe_title = re.sub(r'[^\w\-_\. ]', '_', segment["title"])
        output_file = output_path / f"{safe_title}.mp4"
        
        cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--download-sections", f"*{segment['start_time']}-{segment['end_time']}",
            "--force-keyframes-at-cuts",
            "--output", output_file.as_posix(),
            youtube_url
        ]

        try:
            print(f"Downloading: {segment['title']} ({segment['start_time']}-{segment['end_time']})...")
            subprocess.run(cmd, check=True)
            print(f"Successfully saved: {output_file}")

        except subprocess.CalledProcessError as e:
            print(f"Failed to download segment '{segment['title']}'")


def main():
    # Load segments data from JSON
    try:
        with open("segments.json", "r") as f:
            segments_data = json.load(f)
        
        if not segments_data.get("segments"):
            raise ValueError("No segments found in the JSON file")
            
        cut_youtube_segments(segments_data)

    except FileNotFoundError:
        print("Error: segments.json file not found")

    except json.JSONDecodeError:
        print("Error: Invalid JSON format in segments.json")
        
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()