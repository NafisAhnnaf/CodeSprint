import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("Processing");
  const [logs, setLogs] = useState([]);
  const [files, setFiles] = useState([]);
  const backend = import.meta.env.VITE_BACKEND;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/generate`, { inputText: text });
      setJobId(res.data.jobId);
    } catch (error) {
      alert("Error starting job: " + error.message);
    }
  };

  // Poll for status when jobId is available
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/status/${jobId}`);
        setStatus(res.data.completed ? "Completed" : "Processing");
        setLogs(res.data.logs);
        setFiles(res.data.files);

        if (res.data.completed) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching job status:", error.message);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="flex h-screen flex-col justify-center items-center p-5 text-white bg-black">
      <div className="flex flex-col space-y-8 w-full lg:w-1/2 text-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-full py-2 px-4 text-lg bg-transparent border border-white"
          placeholder="Paste YouTube link"
        />
        <button
          className="rounded-full text-black p-2 text-lg bg-white w-1/2 mx-auto"
          onClick={handleSubmit}
        >
          Create Reels
        </button>
        {jobId && (
          <div className="mt-4">
            <p>Job ID: {jobId}</p>
            <p>Status: {status}</p>
            {logs.length > 0 && (
              <div className="text-left mt-2">
                <h3 className="font-bold">Logs:</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {logs.join("\n")}
                </pre>
              </div>
            )}
            {files.length > 0 && (
              <div className="mt-2">
                <h3 className="font-bold">Files:</h3>
                <ul>
                  {files.map((file, idx) => (
                    <li key={idx}>
                      <a
                        href={`${backend}/api/result/${jobId}/${file}`}
                        download
                      >
                        Download Reel {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
