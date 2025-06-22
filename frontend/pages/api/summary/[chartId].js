import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { chartId } = req.query;
    const { data, error } = await supabase
        .from('summaries')
        .select('summary_md')
        .eq('chart_id', chartId)
        .order('created_at', { ascending:false })
        .limit(1)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data || {});
}
