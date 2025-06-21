const express = require('express');
const path = require('path');
require('dotenv').config();

const { embedText } = require('./embed'); // You should export a function from embed.js
const { tagWithClaude } = require('./tagWithClaude'); // Same here
const { supabase } = require('./supabaseClient'); // and here
const { findSimilarReports } = require('./findSimilarReports'); // and here

const app = express();
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// API route
app.post('/submit', async (req, res) => {
    const { text, location, agency } = req.body;

    try {
        // 1. Embed text
        const embedding = await embedText(text);

        // 2. Get tags
        const tags = await tagWithClaude(text);

        // 3. Store in Supabase
        const { data, error } = await supabase.from('reports').insert([{
            text,
            location,
            agency,
            tags,
            embedding
        }]);

        if (error) {
            console.error('❌ Supabase insert error:', error);
            return res.status(500).json({ error: 'Supabase insert failed' });
        }

        // 4. Find similar reports
        const similarReports = await findSimilarReports(embedding);

        // 5. Respond to frontend
        res.json({
            message: 'Report submitted and stored.',
            tags,
            similar_reports: similarReports
        });

    } catch (err) {
        console.error('❌ Server error:', err);
        res.status(500).json({ error: 'Server error during submission' });
    }
});

// Fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
