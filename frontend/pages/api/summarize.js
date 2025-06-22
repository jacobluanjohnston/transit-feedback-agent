import { createClient } from '@supabase/supabase-js';
import { callClaude }   from '../../lib/claude';
import { sanitize }     from '../../utils/sanitize';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'POST only' });
        }

        const { chartId, data } = req.body;
        if (!chartId || !data) {
            return res.status(400).json({ error: 'chartId & data required' });
        }

        /* ---------- cache hit? ------------------------------------------ */
        const { data: cached } = await supabase
            .from('summaries')
            .select('summary_md')
            .eq('chart_id', chartId)
            .maybeSingle();

        if (cached?.summary_md) return res.json(cached);

        /* ---------- call Claude ----------------------------------------- */
        const cleanData   = sanitize(chartId, data);      // drop 0-4 AM buckets
        const summary_md  = await callClaude(cleanData);

        /* ---------- save & return --------------------------------------- */
        const { error } = await supabase
            .from('summaries')
            .insert({
                chart_id     : chartId,
                payload_json : cleanData,
                summary_md
            });

        if (error) throw error;
        res.json({ summary_md });

    } catch (err) {
        console.error('summarize error', err);
        res.status(500).json({ error: err.message });
    }
}
