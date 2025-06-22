import { createClient } from '@supabase/supabase-js';
import { callClaude }   from '../../lib/claude';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const { chartId, data } = req.body;

        // 0) cache
        const { data: cached } = await supabase
            .from('summaries')
            .select('summary_md')
            .eq('chart_id', chartId)
            .single();
        if (cached) return res.json(cached);

        // 1) Claude
        const text = await callClaude(data);

        // 2) save
        const { error } = await supabase
            .from('summaries')
            .insert({ chart_id: chartId, payload_json: data, summary_md: text });
        if (error) throw error;

        res.json({ summary_md: text });
    } catch (err) {
        console.error('summarize error', err);
        res.status(500).json({ error: err.message });
    }
}
