from dotenv import load_dotenv
import os

load_dotenv()

SERVER_URL = "0.0.0.0"
PORT = "8900"
ENV = "dev"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
