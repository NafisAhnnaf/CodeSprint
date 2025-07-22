import pysrt
import subprocess
import os
from pathlib import Path

# Configuration
segments_folder = "segments"
captions_folder = "captions"
output_folder = "DeadCut"
gap_before = 0.2
gap_after = 0.2

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Get all mp4 files in segments folder
segment_files = list(Path(segments_folder).glob("*.mp4"))

for input_video in segment_files:
    # Determine corresponding caption file
    video_stem = input_video.stem
    srt_file = Path(captions_folder) / f"{video_stem}.srt"
    
    # Skip if caption file doesn't exist
    if not srt_file.exists():
        print(f"Skipping {input_video} - no corresponding caption file found")
        continue
    
    # Prepare output path
    output_video = Path(output_folder) / f"cut_{input_video.name}"
    
    print(f"Processing {input_video}...")
    
    try:
        # Load subtitles
        subs = pysrt.open(srt_file)
        
        # Generate cut segments with gaps
        segments = []
        for i, sub in enumerate(subs):
            start = max(0, sub.start.ordinal / 1000 - gap_before)  # Add gap before
            end = sub.end.ordinal / 1000 + gap_after               # Add gap after
            segments.append((start, end))
        
        # Skip if no subtitles found
        if not segments:
            print(f"No subtitles found in {srt_file}, skipping")
            continue
        
        # Merge overlapping/adjacent segments (to avoid empty gaps)
        merged_segments = []
        segments.sort()  # Ensure segments are in chronological order
        current_start, current_end = segments[0]
        for start, end in segments[1:]:
            if start <= current_end:  # Overlapping or adjacent
                current_end = max(current_end, end)
            else:
                merged_segments.append((current_start, current_end))
                current_start, current_end = start, end
        merged_segments.append((current_start, current_end))
        
        # Generate FFmpeg commands for each segment
        temp_files = []
        for i, (start, end) in enumerate(merged_segments):
            duration = end - start
            temp_file = f"temp_segment_{i}_{video_stem}.mp4"
            temp_files.append(temp_file)
            
            # Cut with re-encoding (for frame accuracy) and audio fades
            cmd = [
                "ffmpeg",
                "-i", str(input_video),
                "-ss", str(start),
                "-to", str(end),
                "-c:v", "libx264", "-crf", "18", "-preset", "fast",
                "-c:a", "aac", "-b:a", "192k",
                temp_file
            ]
            subprocess.run(cmd, check=True)
        
        # Simple concatenation without crossfades (more reliable)
        if len(temp_files) == 1:
            # If only one segment, just rename it
            os.rename(temp_files[0], output_video)
        else:
            # Create a text file with the list of files to concatenate
            with open("concat_list.txt", "w") as f:
                for file in temp_files:
                    f.write(f"file '{file}'\n")
            
            # Concatenate using the concat demuxer
            cmd = [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", "concat_list.txt",
                "-c", "copy",
                "-movflags", "+faststart",
                str(output_video)
            ]
            subprocess.run(cmd, check=True)
            if os.path.exists("concat_list.txt"):
                os.remove("concat_list.txt")
        
        # Clean up temporary files
        for file in temp_files:
            if os.path.exists(file):
                os.remove(file)
        
        print(f"Done! Output saved to {output_video}")
    
    except Exception as e:
        print(f"Error processing {input_video}: {str(e)}")

print("All files processed!")
