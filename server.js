const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads'  // Use /tmp for production
  : path.join(__dirname, 'uploads');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create upload directory:', err);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.files.file;
  if (path.extname(file.name) !== '.zip') {
    return res.status(400).json({ error: 'Only ZIP files allowed' });
  }
  const id = uuidv4();
  const savePath = path.join(UPLOAD_DIR, id + '.zip');
  await file.mv(savePath);
  const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${id}`;
  res.json({ downloadUrl });
});

// Download endpoint
app.get('/api/download/:id', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.id + '.zip');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  res.download(filePath);
});

// Placeholder for subscription logic
app.post('/api/subscribe', (req, res) => {
  // Implement subscription logic here
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});