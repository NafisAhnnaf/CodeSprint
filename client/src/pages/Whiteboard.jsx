// Whiteboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import './Whiteboard.css';

function Whiteboard() {
  const [selectedFile, setSelectedFile] = useState(null);

  const folders = [
    {
      name: 'Folder 1',
      files: ['File 1.1', 'File 1.2']
    },
    {
      name: 'Folder 2',
      files: ['File 2.1', 'File 2.2']
    }
  ];

  const handleFileClick = (fileName) => {
    setSelectedFile(fileName);
  };

  return (
    <div className="whiteboard-container">
      {/* Left Directory Panel */}
      <motion.div 
        className="directory-panel" 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <h3>Directory</h3>
        {folders.map((folder, index) => (
          <div key={index} className="folder">
            <span role="img" aria-label="folder">📁</span> {folder.name}
            <div className="files">
              {folder.files.map((file, idx) => (
                <div key={idx} className="file" onClick={() => handleFileClick(file)}>
                  <span role="img" aria-label="file">📄</span> {file}
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Middle Whiteboard Panel */}
      <motion.div 
        className="whiteboard-panel" 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="toolbar">
          <div className="palette red"></div>
          <div className="palette blue"></div>
          <div className="palette green"></div>
          <div className="palette yellow"></div>
          <div className="icon">🧽</div>
          <div className="icon">🧮</div>
        </div>
        <div className="canvas-area">
          <h2>{selectedFile ? selectedFile : 'No File Selected'}</h2>
          <Player
            src="./whiteboard-animation.json" // Download and place your lottie file here
            loop
            autoplay
            className="whiteboard-lottie"
          />
        </div>
      </motion.div>

      {/* Right Chatbot Panel */}
      <motion.div 
        className="chatbot-panel" 
        initial={{ x: 100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <h3>Chatbot</h3>
        <div className="chat-window">
          {/* This will be dynamic from backend */}
          <p><strong>Bot:</strong> Hello! How can I help you today?</p>
        </div>
        <input type="text" placeholder="Type your message..." className="chat-input" />
      </motion.div>
    </div>
  );
}

export default Whiteboard;