import os
import sys
import shutil
from dotenv import load_dotenv
import google.generativeai as genai
from gtts import gTTS
from moviepy import AudioFileClip
import subprocess
import textwrap
import re
import time

# Load environment variables
load_dotenv()

class AnimationGenerator:
    def __init__(self):
        self.gemini = self.initialize_gemini()
        self.explanation = ""
        self.voiceover_duration = 0
        self.animation_structure = []
        
    def initialize_gemini(self):
        """Initialize the Gemini API client with environment variable"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_animation_structure(self, manim_code):
        """Extract the structure and timing from the generated Manim code"""
        try:
            # Parse the code to understand animation sequence and timing
            structure = []
            
            # Find all self.play and self.wait calls
            play_pattern = r'self\.play\(([^)]+)\)'
            wait_pattern = r'self\.wait\(([^)]+)\)'
            
            play_matches = re.findall(play_pattern, manim_code)
            wait_matches = re.findall(wait_pattern, manim_code)
            
            # Estimate timing for each animation segment
            total_duration = 0
            for i, play_call in enumerate(play_matches):
                # Each play call typically takes 1-2 seconds
                anim_duration = 1.5  # default estimate
                
                # Check if there's a corresponding wait time
                if i < len(wait_matches):
                    try:
                        wait_time = float(wait_matches[i])
                        anim_duration += wait_time
                    except:
                        pass
                
                structure.append({
                    'type': 'animation',
                    'content': play_call,
                    'duration': anim_duration
                })
                total_duration += anim_duration
            
            self.voiceover_duration = total_duration
            self.animation_structure = structure
            return structure
            
        except Exception as e:
            raise RuntimeError(f"Failed to extract animation structure: {str(e)}")
    
    def fix_code_with_error_feedback(self, initial_code, error_output, max_retries=3):
        """Use the LLM to fix code based on error feedback"""
        for attempt in range(max_retries):
            try:
                print(f"Attempt {attempt + 1}/{max_retries} to fix code...")
                
                fix_prompt = f"""
                I'm getting errors when trying to run this Manim code. Please fix the code to resolve these errors.
                
                Original code:
                ```python
                {initial_code}
                ```
                
                Error output:
                ```
                {error_output}
                ```
                
                Please:
                1. Fix all syntax errors and compilation issues
                2. Ensure proper LaTeX syntax (use \\frac{{numerator}}{{denominator}} instead of {{numerator}} \\over {{denominator}})
                3. Make sure all imports are correct
                4. Ensure the code follows Manim Community Edition syntax
                5. Return ONLY the fixed Python code with no additional text
                6. Keep the class name as ExplanationScene
                7. Keep the background color as BLACK
                
                Fixed code:
                """
                
                response = self.gemini.generate_content(
                    fix_prompt,
                    generation_config={
                        "response_mime_type": "text/plain",
                        "response_schema": {
                            "type": "string",
                            "description": "Fixed Python code for Manim animation"
                        }
                    }
                )
                
                fixed_code = response.text
                
                # Clean up the response (remove markdown code blocks if present)
                if fixed_code.startswith('```python'):
                    fixed_code = fixed_code.replace('```python', '').replace('```', '').strip()
                elif fixed_code.startswith('```'):
                    fixed_code = fixed_code.replace('```', '').strip()
                
                # Validate the fixed code
                if "class ExplanationScene" not in fixed_code:
                    fixed_code = f"from manim import *\n\nclass ExplanationScene(Scene):\n" + \
                               textwrap.indent(fixed_code, '    ')
                
                if "self.camera.background_color = BLACK" not in fixed_code:
                    fixed_code = fixed_code.replace("def construct(self):", 
                                                   "def construct(self):\n        self.camera.background_color = BLACK")
                
                return fixed_code
                
            except Exception as e:
                print(f"Error in fix attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    raise RuntimeError(f"Failed to fix code after {max_retries} attempts: {str(e)}")
                time.sleep(2)  # Wait before retrying
    
    def generate_manim_code(self, prompt):
        """Generate Manim code based on the prompt"""
        manim_prompt = textwrap.dedent(
            f"""
            Create a Manim Community Edition animation that visually explains:
            {prompt}
            
            Requirements:
            1. Scene class must be named ExplanationScene and inherit from Scene
            2. Total animation duration: 60-90 seconds
            3. Divide animation into logical sections with clear visual elements
            4. All animations must be wrapped in self.play() calls
            5. Include proper imports (from manim import *)
            6. Use these common objects:
                - Text, MathTex, Arrow, Circle, Square, Line
                - ValueTracker, DecimalNumber
            7. Ensure all variables are properly defined before use
            8. Set camera background to BLACK (self.camera.background_color = BLACK)
            9. Include proper waiting times between animations
            10. Return ONLY the raw Python code with:
                - No markdown formatting
                - No additional explanations
                - No code block wrappers
            11. The code must be syntactically perfect and run without errors
            12. Use proper LaTeX syntax (use \\frac{{numerator}}{{denominator}} instead of {{numerator}} \\over {{denominator}})
            13. Avoid complex LaTeX expressions that might cause compilation errors
            14. The background should be black
            
            Example structure:
            from manim import *
            
            class ExplanationScene(Scene):
                def construct(self):
                    self.camera.background_color = BLACK
                    
                    # Create objects
                    title = Text("Explanation", color=BLACK)
                    
                    # Animate
                    self.play(Write(title))
                    self.wait(1)
                    
                    # More animation...
            """
        )
        
        try:
            response = self.gemini.generate_content(
                manim_prompt,
                generation_config={
                    "response_mime_type": "text/plain",
                    "response_schema": {
                        "type": "string",
                        "description": "Raw Python code for Manim animation"
                    }
                }
            )
            code = response.text
            
            # Clean up the response
            if code.startswith('```python'):
                code = code.replace('```python', '').replace('```', '').strip()
            elif code.startswith('```'):
                code = code.replace('```', '').strip()
                
            # Validate the code structure
            if "class ExplanationScene" not in code:
                code = f"from manim import *\n\nclass ExplanationScene(Scene):\n" + \
                       textwrap.indent(code, '    ')
            
            if "self.camera.background_color = BLACK" not in code:
                code = code.replace("def construct(self):", 
                                   "def construct(self):\n        self.camera.background_color = BLACK")
            
            return code
        except Exception as e:
            raise RuntimeError(f"Failed to generate Manim code: {str(e)}")
    
    def generate_explanation_for_animation(self, prompt, manim_code):
        """Generate an explanation that matches the animation structure"""
        # Extract animation structure first
        structure = self.extract_animation_structure(manim_code)
        
        explanation_prompt = f"""
        Create a concise, pedagogical voiceover script for this animation that explains: {prompt}
        
        Animation structure analysis:
        {structure}
        
        Requirements:
        1. The explanation should perfectly match the animation sequence
        2. Each animation segment should have corresponding narration
        3. Total duration: {self.voiceover_duration} seconds
        4. Use simple language appropriate for the topic 
        5. Break down the explanation into parts that sync with visual elements
        6. Include appropriate pauses between concepts
        7. Return ONLY the narration text with proper timing cues in comments
        8. DO NOT include anything extra other than what is described in the animation code
        9. Strictly follow the content given in the code for generating explanation
        10. DO NOT include any back tiks (```) before or after the response text
        
        Format:
        [0.0s-2.5s]: Introduction to the concept
        [2.5s-5.0s]: Explanation of first element
        ...
        """
        
        try:
            response = self.gemini.generate_content(
                explanation_prompt,
                generation_config={
                    "response_mime_type": "text/plain",
                    "response_schema": {
                        "type": "string",
                        "description": "Voiceover script synchronized with animation"
                    }
                }
            )
            self.explanation = response.text
            return self.explanation
        except Exception as e:
            raise RuntimeError(f"Failed to generate explanation: {str(e)}")
    
    def generate_voiceover(self):
        """Generate synchronized voiceover audio"""
        try:
            # Extract just the text parts (remove timing comments)
            clean_text = re.sub(r'\[\d+\.\d+s-\d+\.\d+s\]:', '', self.explanation)
            clean_text = re.sub(r'#.*', '', clean_text)
            clean_text = ' '.join(clean_text.split())  # Normalize whitespace
            
            tts = gTTS(text=clean_text, lang='en', slow=False)
            tts.save("voiceover_normal.mp3")

            # Increase speed by 1.25x using FFmpeg
            subprocess.run([
                'ffmpeg', '-y',
                '-i', 'voiceover_normal.mp3',
                '-filter:a', 'atempo=1.32',
                'voiceover.mp3'
            ], check=True)
            
            # Clean up the temporary file
            if os.path.exists("voiceover_normal.mp3"):
                os.remove("voiceover_normal.mp3")
            
            # Verify audio duration
            audio = AudioFileClip("voiceover.mp3")
            actual_duration = audio.duration
            audio.close()
            
            # Adjust animation if needed
            if abs(actual_duration - self.voiceover_duration) > 2:
                self.voiceover_duration = actual_duration
                
            return "voiceover.mp3"
        
        except Exception as e:
            raise RuntimeError(f"Failed to generate voiceover: {str(e)}")
    
    def render_animation(self, manim_code, max_retries=3):
        """Render the Manim animation with error feedback and retry mechanism"""
        for attempt in range(max_retries):
            try:
                with open("temp_animation.py", 'w') as f:
                    f.write(manim_code)
                
                # Create media directory if it doesn't exist
                media_dir = os.path.join(os.getcwd(), "media")
                os.makedirs(media_dir, exist_ok=True)
                
                # Render with quality matching the duration
                quality_flag = '-ql' if self.voiceover_duration > 45 else '-qh'
                cmd = f"manim --disable_caching {quality_flag} temp_animation.py ExplanationScene -o output_animation"
                
                # Run the command and capture output
                result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
                
                # Find the actual output file in the media directory
                media_files_dir = os.path.join(media_dir, "videos", "temp_animation", "480p15")
                if not os.path.exists(media_files_dir):
                    # Try different quality directories
                    quality_dir = "1080p60" if quality_flag == '-qh' else "480p15"
                    media_files_dir = os.path.join(media_dir, "videos", "temp_animation", quality_dir)
                    if not os.path.exists(media_files_dir):
                        # Try to find any output directory
                        video_dirs = [d for d in os.listdir(os.path.join(media_dir, "videos", "temp_animation")) 
                                    if os.path.isdir(os.path.join(media_dir, "videos", "temp_animation", d))]
                        if video_dirs:
                            media_files_dir = os.path.join(media_dir, "videos", "temp_animation", video_dirs[0])
                        else:
                            raise FileNotFoundError(f"Manim output directory not found")
                
                # Look for the output file
                for f in os.listdir(media_files_dir):
                    if f.startswith("output_animation") and f.endswith('.mp4'):
                        output_path = os.path.join(media_files_dir, f)
                        # Copy to current directory for easier access
                        final_path = os.path.join(os.getcwd(), "output_animation.mp4")
                        shutil.copy2(output_path, final_path)
                        return final_path
                
                raise FileNotFoundError(f"No animation file found in {media_files_dir}")
                
            except subprocess.CalledProcessError as e:
                error_output = f"STDERR: {e.stderr}\nSTDOUT: {e.stdout}"
                print(f"Rendering failed on attempt {attempt + 1}: {error_output}")
                
                if attempt < max_retries - 1:
                    # Try to fix the code with error feedback
                    print("Attempting to fix code with error feedback...")
                    manim_code = self.fix_code_with_error_feedback(manim_code, error_output)
                    time.sleep(2)  # Wait before retrying
                else:
                    raise RuntimeError(f"Manim rendering failed after {max_retries} attempts: {error_output}")
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Error on attempt {attempt + 1}: {str(e)}")
                    time.sleep(2)  # Wait before retrying
                else:
                    raise RuntimeError(f"Failed to render animation after {max_retries} attempts: {str(e)}")
    
    def synchronize_media(self, video_file):
        """Combine video and audio with perfect synchronization using ffmpeg"""
        try:
            # Get durations using ffprobe
            def get_duration(filename):
                result = subprocess.run([
                    'ffprobe', '-v', 'error', '-show_entries', 
                    'format=duration', '-of', 
                    'default=noprint_wrappers=1:nokey=1', filename
                ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                return float(result.stdout)

            video_duration = get_duration(video_file)
            audio_duration = get_duration("voiceover.mp3")

            output_file = "final_output.mp4"
            
            # Case 1: Audio is longer than video - trim audio
            if audio_duration > video_duration:
                subprocess.run([
                    'ffmpeg', '-y',
                    '-i', video_file,
                    '-i', 'voiceover.mp3',
                    '-filter_complex', 
                    f'[0:v]setpts=PTS-STARTPTS[v];[1:a]atrim=0:{video_duration},asetpts=PTS-STARTPTS[a]',
                    '-map', '[v]',
                    '-map', '[a]',
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-shortest',
                    output_file
                ], check=True)
            
            # Case 2: Video is longer than audio - speed up video slightly
            elif audio_duration < video_duration:
                speed_factor = audio_duration / video_duration
                subprocess.run([
                    'ffmpeg', '-y',
                    '-i', video_file,
                    '-i', 'voiceover.mp3',
                    '-filter_complex',
                    f'[0:v]setpts={1/speed_factor}*PTS[v]',
                    '-map', '[v]',
                    '-map', '1:a',
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    output_file
                ], check=True)
            
            # Case 3: Durations match exactly
            else:
                subprocess.run([
                    'ffmpeg', '-y',
                    '-i', video_file,
                    '-i', 'voiceover.mp3',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-map', '0:v:0',
                    '-map', '1:a:0',
                    output_file
                ], check=True)

            # Clean up
            for f in [video_file, "temp_animation.py"]:
                if os.path.exists(f):
                    os.remove(f)
                    
            return output_file
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg processing failed: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Failed to synchronize media: {str(e)}")
    
    def process(self, prompt):
        """Full pipeline from prompt to final video"""
        try:
            print("Generating animation code...")
            manim_code = self.generate_manim_code(prompt)
            
            print("Creating synchronized explanation...")
            explanation = self.generate_explanation_for_animation(prompt, manim_code)
            
            print("Generating voiceover...")
            self.generate_voiceover()
            
            print("Rendering animation...")
            video_file = self.render_animation(manim_code, max_retries=3)
            
            print("Combining media...")
            final_file = self.synchronize_media(video_file)
            
            print(f"\nDone! Final video saved as: {final_file}")
            return final_file
        except Exception as e:
            print(f"\nError: {str(e)}")
            # Clean up any partial files
            for f in ["voiceover.mp3", "temp_animation.py"]:
                if os.path.exists(f):
                    os.remove(f)
            return None

if __name__ == "__main__":
    try:
        # Check if a command line argument was provided
        if len(sys.argv) < 2:
            print("Usage: python3 main.py \"explanation prompt\"")
            print("Example: python3 main.py \"Explain the Pythagorean theorem\"")
            sys.exit(1)
            
        # Combine all arguments after the script name as the prompt
        prompt = " ".join(sys.argv[1:])
        
        generator = AnimationGenerator()
        result = generator.process(prompt)
        
        if not result:
            print("Failed to generate animation. Please check the error message.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        sys.exit(1)
