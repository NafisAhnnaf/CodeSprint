# Study Buddy

An intelligent digital whiteboard application that combines traditional drawing capabilities with Google Gemini AI-powered features for enhanced creativity and collaboration. Built with a modern frontend-backend architecture for optimal performance and scalability.

## 🎨 Features

- **Gemini AI Integration**: Powered by Google's Gemini AI for intelligent drawing assistance
- **AI-Powered Drawing Interface**: Smart drawing tools with advanced AI capabilities
- **Dynamic Controls**: Easy-to-use interface for quick interaction
- **Customizable Brushes**: Dynamic color selection and brush size adjustments
- **Real-time Drawing**: Smooth and responsive drawing experience
- **Smart Recognition**: AI-powered shape and text recognition capabilities
- **Export Options**: Save your creations in various formats
- **Modern Architecture**: Separate frontend and backend for better performance

## 🚀 Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- Python 3.10
- Conda (Anaconda or Miniconda)
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key

### Installation

#### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/NafisAhnnaf/CodeSprint.git
cd StudyBuddy
```

2. **Create a conda environment for backend**
```bash
conda create -n study-buddy python=3.10
conda activate study-buddy
```

3. **Install backend dependencies**
```bash
cd backend
conda install --file requirements.txt
# Or if using pip within conda environment:
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env file and add your Gemini API key:
# GEMINI_API_KEY=your_gemini_api_key_here
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install frontend dependencies**
```bash
npm install
# Or using yarn:
# yarn install
```

3. **Set up frontend environment variables**
```bash
cp .env.example .env.local
# Edit .env.local and configure backend API URL if needed
```

## 🚀 Running the Application

### Start Backend Server

Activate conda environment and start backend:

```bash
conda activate study-buddy
cd backend
python main.py
```

The backend API will start running on `http://localhost:8000` (or your configured port).

### Start Frontend Development Server

In a new terminal, start the frontend:

```bash
cd frontend
npm run dev
# Or using yarn:
# yarn start
```

The frontend will start running on `http://localhost:5173` and automatically open in your browser.

### Production Build (Optional)

For production deployment:

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in the 'build' directory
# Configure your backend to serve these static files
```

## 🛠️ Technology Stack

### Backend
- **Python 3.10**: Core backend language
- **FastAPI/Flask**: Web framework for API endpoints
- **Google Gemini AI**: Advanced AI capabilities for drawing assistance
- **Computer Vision Libraries**: Image processing and recognition

### Frontend
- **React.js/Vue.js**: Modern frontend framework
- **JavaScript/TypeScript**: Frontend development
- **Canvas API**: Real-time drawing capabilities
- **WebSocket**: Real-time communication with backend

### AI Integration
- **Google Gemini API**: Intelligent drawing assistance and recognition
- **Machine Learning**: Custom models for enhanced features


## 🎯 How to Use

1. **Access the Application**: Open your browser and navigate to `http://localhost:5173`
2. **Start Drawing**: Use your mouse or touch input to draw on the whiteboard
3. **Adjust Brush Settings**:
   - Select different colors from the color palette
   - Adjust brush size using the size slider
4. **AI Features (Powered by Gemini)**:
   - Enable shape recognition for automatic shape correction
   - Use AI-assisted drawing for smoother lines
   - Get intelligent suggestions for completing your drawings
5. **Save & Export**: Save your work or export in different formats

## 🔑 API Configuration

### Getting Gemini API Key

1. Visit the [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key for Gemini
3. Add the key to your backend `.env` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Environment Variables

**Backend (.env):**
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env.local):**
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🌟 Roadmap

- [ ] Advanced AI drawing suggestions
- [ ] Collaborative real-time editing
- [ ] Voice-to-drawing commands
- [ ] Enhanced shape recognition
- [ ] Mobile application support
- [ ] Integration with cloud storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Nafis Ahnnaf** - *Backend* - [@NafisAhnnaf](https://github.com/NafisAhnnaf)
**Tabib Hassan** - *Frontend* - [@AniMahou](https://github.com/AniMahou)
**Sieam Shahriare** - *AI integration* - [@SieamShahriare](https://github.com/SieamShahriare)


## 🙏 Acknowledgments

- Thanks to Google for providing the Gemini AI API
- Inspired by digital whiteboard applications and AI-powered creativity tools
- Special thanks to the open-source community for drawing and canvas libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/NafisAhnnaf/CodeSprint/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NafisAhnnaf/CodeSprint/discussions)

---
