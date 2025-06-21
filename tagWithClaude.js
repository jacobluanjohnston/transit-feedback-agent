const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function tagWithClaude(text) {
    const prompt = `Assign 2–3 high-level tags to this transit report:\n"${text}"\n\nTags:`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
    });

    const tagLine = response.choices[0].message.content.trim();
    return tagLine.replace(/\[|\]|"/g, '').split(',').map(tag => tag.trim());
}

module.exports = { tagWithClaude };
