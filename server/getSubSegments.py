import os
import json
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
import sys


def extract_video_id(url):
    """Extract YouTube video ID from various URL formats."""
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            return parse_qs(query.query)['v'][0]
        if query.path.startswith('/embed/'):
            return query.path.split('/')[2]
        if query.path.startswith('/v/'):
            return query.path.split('/')[2]
    return None


def get_video_title(video_id):
    """Get video title using YouTube Data API"""
    try:
        youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        if not youtube_api_key:
            print("YouTube API key not found in .env file")
            return None
            
        youtube = build('youtube', 'v3', developerKey=youtube_api_key)
        request = youtube.videos().list(
            part="snippet",
            id=video_id
        )
        response = request.execute()
        
        if response['items']:
            return response['items'][0]['snippet']['title']
        return None
        
    except Exception as e:
        print(f"Error fetching video title: {e}")
        return None
    

def get_transcript(video_id):
    """Fetch transcript for a YouTube video."""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        # Manually format the transcript text by joining all text elements with timestamps
        formatted_transcript = ""
        for entry in transcript:
            start = entry['start']
            text = entry['text']
            formatted_transcript += f"[{start:.2f}] {text}\n"
        return formatted_transcript
    
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return None


def process_with_gemini(transcript_text, video_title, video_url):
    """Send transcript to Gemini API for analysis."""
    prompt = f"""
    You are a short form content analyst. Your job is to analyze the transcript of the following long video. This video can be a movie/series/podcast. Find segments that are interesting to the audience which will later be used to make short-form content. Provide the output with a beginning and an ending timestamp from the document along with the title of the segments which they are about. Provide 3 such segments by analyzing the entire document and make sure to retrieve only the interesting parts that have quality and will ensure viewer retention. make sure the duration of the clips are no more than 1 minutes and 30 seconds long. Also make sure to pick only the best segments.

    Provide ONLY the raw JSON output with this EXACT structure:
    {{
        "video_title": "title",
        "video_url": "https://youtube.com/...",
        "segments": [
            {{
                "title": "Segment title",
                "start_time": 123.45,
                "end_time": 145.67,
                "duration": 22.22,
                "description": "Why this segment is interesting"
            }}
        ]
    }}
    
    Rules:
    1. Provide ONLY the JSON output - no additional text, markdown, or explanations
    2. Include exactly 3 segments
    3. All durations must be between 30-90 seconds
    4. Ensure all JSON syntax is perfect
    5. Never use markdown formatting (no ```json or similar)
    6. Never add any text outside the JSON structure


    Video Title: {video_title}
    Video URL: {video_url}
    
    Transcript:
    {transcript_text}
    """
    
    try:
        generation_config = {
            "temperature": 0.75,
            "top_p": 1,
            "top_k": 32,
            "response_mime_type": "application/json",
        }

        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config=generation_config
        )

        response = model.generate_content(prompt)

        # Clean the response to ensure pure JSON
        json_str = response.text.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:-3].strip()
        elif json_str.startswith('```'):
            json_str = json_str[3:-3].strip()
            
        return json_str
    
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return None


def save_results(video_title, video_url, gemini_output, filename="segments.json"):
    """Save the results to a file."""
    try:
        # Validate JSON before saving
        json_data = json.loads(gemini_output)
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)
        
        # Write to file (creates file if it doesn't exist)
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2)
        print(f"Results saved to {filename}")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON received: {e}")
        print("Raw output:")
        print(gemini_output)


def main():
    # Configure environment variables
    load_dotenv()
    
    # Configure Gemini API
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("Please create a .env file with GEMINI_API_KEY")
        return
    
    genai.configure(api_key=gemini_api_key)
    
    # Accept YouTube URL as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python getSubSegments.py <YouTube URL>")
        return
    youtube_url = sys.argv[1]
    video_id = extract_video_id(youtube_url)
    if not video_id:
        print("Invalid YouTube URL")
        return

    # Get actual video title
    print("Fetching video title...")
    video_title = get_video_title(video_id)
    if not video_title:
        print("Could not fetch video title - using placeholder")
        video_title = "Untitled Video"

    # Get transcript
    print("Fetching transcript...")
    transcript_text = get_transcript(video_id)
    if not transcript_text:
        print("Could not retrieve transcript for this video")
        return

    # Process with Gemini
    print("Analyzing content with Gemini...")
    gemini_output = process_with_gemini(transcript_text, video_title, youtube_url)
    if not gemini_output:
        print("Failed to analyze content")
        return

    # Save results
    save_results(video_title, youtube_url, gemini_output)


if __name__ == "__main__":
    main()