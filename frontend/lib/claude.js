// lib/claude.js
import Anthropic from '@anthropic-ai/sdk';
import { EXAMPLES } from '../utils/examples';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Build a prompt that forces Claude to:
 *   • skip obvious facts (e.g. “nobody complains at 3 a.m.”)
 *   • surface adjacency spill-over, confounding variables, real anomalies
 *   • finish with one actionable recommendation
 */
function buildPrompt(chartData) {
    return `
${EXAMPLES}

────────────────────────────────────────
You are a senior transit-operations analyst.
IMPORTANT: Buckets for hours 0–4 represent non-service time.  
• **Ignore those buckets when finding patterns or anomalies.**  
• Do NOT conclude “no reports at any hour” just because 0–4 are zero.

1. Benchmark each series against the *expected* pattern (ridership curve, service hours, seasonal weather comfort zone).  
2. Highlight **anomalies**: spikes, dips, adjacent-station bleed-over, weekday/weekend inversions, temperature-bias artefacts, etc.  
   • If the chart involves stations, group by physical adjacency / next-stop and mention spill-over.  
   • If the chart involves weather or time of day, discuss under- or over-reporting biases.  
3. Ignore trivial observations (e.g. “few riders at 02:00”) unless it deviates from the norm.  
4. End with one concrete *Action* for operations (staffing, maintenance, comms, policy).  
5. Output **80-120 words** in **markdown** exactly like:

**Key insight:** …  
*Action:* …

JSON:
\`\`\`json
${JSON.stringify(chartData).slice(0, 10_000)}
\`\`\`
`;
}

/** Call Claude and return the markdown summary */
export async function callClaude(chartData) {
    const prompt = buildPrompt(chartData);

    const resp = await anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 300,
        temperature: 0.3,               // tighter, less waffle
        messages: [{ role: 'user', content: prompt }],
    });

    return resp.content[0].text.trim();
}
