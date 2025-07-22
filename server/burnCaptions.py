import subprocess
from pathlib import Path
from saveCaptions import process_segments

# Make dir
Path("output").mkdir(exist_ok=True)
Path("styledSubtitles").mkdir(exist_ok=True)

# Configuration
SEGMENTS_DIR = "reframe"
CAPTIONS_DIR = "captionsCut"
WHISPER_COMMAND = [
    "mlx_whisper",
    "--model", "mlx-community/whisper-base-mlx",
    "--output-format", "srt",
    "--language", "en",
    "--no-speech-threshold", "0.5",
    "--word-timestamps", "True",
    "--hallucination-silence-threshold", "1.0",
    "--max-words-per-line", "3"
]

#create captions and save to captions file
process_segments(SEGMENTS_DIR, CAPTIONS_DIR, WHISPER_COMMAND)

STYLE = (
    "Fontname=Helvetica-bold, Fontsize=25, BackColour=&H00000000,"
    "OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=0,"
    "PrimaryColour=&HFFFFFF&,Alignment=2,MarginV=80"
)

def convert_srt_to_ass(srt_path, ass_path):
    """Convert SRT to ASS format"""
    cmd = [
        "ffmpeg",
        "-i", str(srt_path),
        "-c", "ass",
        str(ass_path)
    ]
    subprocess.run(cmd, check=True)


def burn_subtitles(video_path, ass_path, output_path):
    """Burn subtitles into video"""
    cmd = [
        "ffmpeg",
        "-i", str(video_path),
        "-vf", f"subtitles={ass_path}:force_style='{STYLE}'",
        "-c:a", "copy",
        str(output_path)
    ]
    subprocess.run(cmd, check=True)


def process_files():
    """Process all SRT and video files"""
    captions_dir = Path("captionsCut")
    reframe_dir = Path("reframe")
    
    for srt_file in captions_dir.glob("*.srt"):
        base_name = srt_file.stem
        video_file = reframe_dir / f"{base_name}.mp4"
        ass_file = Path("styledSubtitles") / f"{base_name}.ass"
        output_file = Path("output") / f"{base_name}.mp4"
        
        if not video_file.exists():
            print(f"Warning: No corresponding video found for {srt_file}")
            continue
        
        print(f"Processing {base_name}...")
        
        try:
            # Convert SRT to ASS
            convert_srt_to_ass(srt_file, ass_file)
            
            # Burn subtitles into video
            burn_subtitles(video_file, ass_file, output_file)
            
            print(f"Successfully processed {base_name}")
        except subprocess.CalledProcessError as e:
            print(f"Error processing {base_name}: {e}")
        except Exception as e:
            print(f"Unexpected error with {base_name}: {e}")

if __name__ == "__main__":
    process_files()
    print("Processing complete!")

