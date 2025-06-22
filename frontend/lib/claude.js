// lib/claude.js
import Anthropic from '@anthropic-ai/sdk';
import { EXAMPLES } from '../utils/examples';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Call Claude and get the markdown summary */
export async function callClaude(chartData) {
    const prompt = `
${EXAMPLES}
────────────────────────────────────────
NOW WRITE THE INSIGHT FOR THIS CHART
(60-120 words, markdown, **Key insight** then an *Action*).
JSON:
\`\`\`json
${JSON.stringify(chartData).slice(0, 10_000)}
\`\`\`
`;

    const resp = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 350,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
    });

    return resp.content[0].text.trim();
}
