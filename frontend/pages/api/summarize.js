import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { EXAMPLES } from '../../utils/examples.js';   // <<— keep prompt tidy

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE       // service role key, NOT public
);
const claude = new Anthropic({ apiKey: process.env.CLAUDE_KEY });

export default async function handler(req, res) {
    try {
        const { chartId, data } = req.body;
        if (!chartId || !data) return res.status(400).json({ error:'no data' });

        const prompt = `
You are a transit data analyst. Write ≤120-word Markdown insights
(headline in **bold**, one “Action:” bullet at end).
Mention spikes (>3× baseline) or correlations (r>0.6) by number.
Never say “chart” or “JSON”.

${EXAMPLES}

NEW chart:
${JSON.stringify(data).slice(0, 65000)}
`;

        const msg = await claude.messages.create({
            model       : 'claude-3-opus-20240229',
            max_tokens  : 300,
            temperature : 0.2,
            system      : 'You output pure Markdown.',
            messages    : [{ role:'user', content: prompt }],
        });

        const text = msg.content[0].text;

        await supabase.from('summaries').insert({
            chart_id     : chartId,
            payload_json : data,
            summary_md   : text,
        });

        res.status(200).json({ summary: text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
