// pages/api/summary/[chartId].js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    const { chartId } = req.query;               // URL param e.g. /summary/hourly-delay

    try {
        const { data, error } = await supabase
            .from('summaries')
            .select('summary_md')
            .eq('chart_id', chartId)
            .maybeSingle();                          // 👉 returns null instead of throwing

        if (error) throw error;

        // always return a payload so the frontend never 404s
        res.json({ summary_md: data?.summary_md ?? '' });
    } catch (err) {
        console.error('summary GET error', err);
        res.status(500).json({ error: err.message });
    }
}
