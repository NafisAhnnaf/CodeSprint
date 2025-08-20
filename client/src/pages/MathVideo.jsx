import React, { useState } from "react";
import "./MathVideo.css";
import Request from "../composables/Request";

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
      // 👇 call your wrapper, force responseType to "blob"
      const videoBlob = await Request.post(
        "/api/generate",
        { prompt },
        { responseType: "blob" } // axios config override
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
      <header className="header">
        <div className="header-content">
          <h1>AI Animation Generator</h1>
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16L12 4M12 16L8 12M12 16L16 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 20H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
