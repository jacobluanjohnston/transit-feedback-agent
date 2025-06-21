const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function embedText(text) {
    const res = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
    });
    return res.data[0].embedding;
}

module.exports = { embedText };
