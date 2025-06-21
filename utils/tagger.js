require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function tagWithClaude(text) {
    const prompt = `You are an assistant that classifies public transit complaints. The following user message is a rider-submitted complaint. Categorize the issue using 1–3 tags from this list:\n
["accessibility", "safety", "delay", "infrastructure", "communication", "environment", "equipment", "harassment"]\n
Respond with only a JSON array of tag strings.\n
Complaint:\n"${text}"\n\nTags:\n`;

    const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
    });

    try {
        const content = response.content[0].text.trim();
        return JSON.parse(content);
    } catch (err) {
        console.error("❌ Failed to parse Claude tags:", err);
        return [];
    }
}

module.exports = { tagWithClaude };
