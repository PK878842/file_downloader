import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [showSubscribe, setShowSubscribe] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setDownloadUrl('');
    setProgress(0);
    if (e.target.files[0] && e.target.files[0].size > 10 * 1024 * 1024 * 1024) {
      setShowSubscribe(true);
    } else {
      setShowSubscribe(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a ZIP file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024 * 1024) {
      setShowSubscribe(true);
      setError('File exceeds 10GB. Please subscribe to upload larger files.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await axios.post(`${apiUrl}/api/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      setDownloadUrl(res.data.downloadUrl);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    }
  };

  const handleSubscribe = async () => {
    // Placeholder for subscription logic
    alert('Subscription feature coming soon!');
  };

  return (
    <div className="container">
      <h1>File Share App</h1>
      <div className="upload-box">
        <input type="file" accept=".zip" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file}>Upload</button>
        {progress > 0 && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {downloadUrl && (
          <div className="download-link">
            <p>Universal Download Link:</p>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">{downloadUrl}</a>
          </div>
        )}
        {showSubscribe && (
          <div className="subscribe-box">
            <p>Want to upload files larger than 10GB?</p>
            <button onClick={handleSubscribe}>Subscribe</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
