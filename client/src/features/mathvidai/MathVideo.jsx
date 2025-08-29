import React, { useState } from "react";
import "./MathVideo.css";
import Request from "../../composables/Request";
// 👇 Add this import for lottie
import { Player } from "@lottiefiles/react-lottie-player";

// import backgroundAnimation from "./background.json"; // <-- put your lottie JSON here

function MathVideo() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const videoBlob = await Request.post(
        "/api/generate",
        { prompt },
        { responseType: "blob" }
      );

      const videoObjectUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(videoObjectUrl);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to generate animation";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mathApp">
      {/* Background Lottie Animation */}
      <Player src="/about-us.json" className="hero-lottie" autoplay loop />
      
      {/* <Lottie animationData={backgroundAnimation} loop={true} className="backgroundLottie" /> */}

      <header className="header">
        <div className="header-content">
          <h1 className="gradient-text">AI Animation Generator</h1>
          <p>Transform educational concepts into captivating animations</p>
        </div>
      </header>

      <main className="main-content">
        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-group">
            <label htmlFor="prompt">
              What concept would you like to visualize?
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Explain the Pythagorean theorem, newton's law of motion and more..."
              rows="4"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              "Create Animation"
            )}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        {videoUrl && (
          <div className="video-container">
            <h2>Your Animation</h2>
            <div className="video-wrapper">
              <video controls key={videoUrl}>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <a
              href={videoUrl}
              download="animation.mp4"
              className="download-button"
            >
              Download Video
            </a>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>AI Animation Generator &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default MathVideo;
