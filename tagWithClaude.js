const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function tagWithClaude(text) {
    const prompt = `You are a transit data tagging assistant.

Given the following transit feedback, return a JSON array of 2–3 lowercase tags. Use simple, consistent, snake_case tags with no numbering or line breaks.

Example:
Input: "The train was 15 minutes late again."
Output: ["train_delay", "punctuality"]

Now tag this:
"${text}"`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
    });

    const content = response.choices[0].message.content.trim();

    try {
        return JSON.parse(content); // safest if it's clean JSON
    } catch (err) {
        // fallback if not perfectly formatted (e.g., no brackets)
        return content.replace(/\[|\]|"/g, '').split(',').map(tag => tag.trim().toLowerCase().replace(/\s+/g, '_'));
    }
}

module.exports = { tagWithClaude };
