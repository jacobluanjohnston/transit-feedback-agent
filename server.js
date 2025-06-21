const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API route
app.post('/submit', (req, res) => {
    const { text, location, agency } = req.body;
    console.log("📬 Received:", { text, location, agency });
    res.json({ message: "Report received!" });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start servercl
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
