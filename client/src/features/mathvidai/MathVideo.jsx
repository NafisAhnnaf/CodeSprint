import React, { useEffect, useState } from "react";
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

  // useEffect(() => {
  //   setVideoUrl(localStorage.getItem("videoUrl") || null);
  // }, [videoUrl]);

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
      // Step 1: Send job request
      console.log("Submitting prompt:", prompt);
      const res = await Request.post("/api/generate", { prompt });
      console.log(res);
      const jobId = res.jobId;

      // Step 2: Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await Request.get(`/api/generate/status/${jobId}`);

          if (status.status === "completed") {
            clearInterval(pollInterval);

            // Step 3: Fetch video file
            const videoBlob = await Request.get(
              `/api/generate/result/${jobId}`,
              {
                responseType: "blob",
              }
            );

            const videoObjectUrl = URL.createObjectURL(videoBlob);
            setVideoUrl(videoObjectUrl);
            localStorage.setItem("videoUrl", videoObjectUrl);
            setIsLoading(false);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setError(status.error || "Job failed");
            setIsLoading(false);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setError(
            "Error checking job status: " +
              (err.response?.data?.error || err.message)
          );
          setIsLoading(false);
        }
      }, 5000); // poll every 5s
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start job");
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
        <form
          onSubmit={handleSubmit}
          className="generator-form  flex flex-col space-y-5"
        >
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
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={isLoading ? "loading" : "button-create-animation"}
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
          </div>
          {error && <div className="error-message">{error}</div>}
        </form>

        {videoUrl && (
          <div className="video-container flex flex-col space-y-5">
            <h2 className="text-xl">Your Animation</h2>
            <div className="video-wrapper">
              <video controls key={videoUrl}>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-center">
              <a
                href={videoUrl}
                download="animation.mp4"
                className="download-button"
              >
                Download Video
              </a>
            </div>
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
