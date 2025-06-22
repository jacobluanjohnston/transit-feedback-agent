#!/usr/bin/env node
/**
 * generate-summary.js  (run with:  node generate-summary.js)
 * ----------------------------------------------------------
 * Pulls the last N complaints, asks Claude for a bullet-point
 * insight paragraph, and stores it in the analytics_summary table.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

/* ───────────────────────────────────────────────────────── */
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY          // service-role key!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const COLUMN = 'complaint';   // ← rename if your table uses a different field
const LIMIT  = 1000;             // last 100 rows

/* system prompt for Claude */
const systemPrompt = `
You are a data analyst for a public transportation agency.
Summarise the key complaint trends in concise bullet points.
Highlight rises in any tag (e.g. safety), recurring hotspots, or unusual spikes.
Be helpful and actionable.
`;

(async function main () {
    console.log(`📊 Fetching ${LIMIT} latest complaints…`);

    const { data: reports, error } = await supabase
        .from('reports')
        .select(`${COLUMN}, tags, created_at`)
        .order('created_at', { ascending: false })
        .limit(LIMIT);

    if (error) return console.error('❌ Fetch error:', error.message);
    if (!reports.length) return console.log('⚠️  No complaints found.');

    /* build raw text for Claude input */
    const raw = reports.map(r =>
        `• ${ (r.tags||[]).join(', ') } — ${ r[COLUMN] || '' }`
    ).join('\n');

    try {
        const msg = await anthropic.messages.create({
            model        : 'claude-3-opus-20240229',
            max_tokens   : 1024,
            temperature  : 0.4,
            system       : systemPrompt,
            messages     : [{ role:'user', content:`Latest complaints:\n\n${raw}` }],
        });

        const summary = msg.content[0].text;
        console.log('\n📈 Claude summary:\n', summary, '\n');

        /* store in analytics_summary */
        const { error: insertErr } = await supabase
            .from('analytics_summary')
            .insert({ summary });

        if (insertErr) console.error('❌ Save error:', insertErr.message);
        else            console.log('✅ Summary saved to Supabase.');
    } catch (err) {
        console.error('❌ Claude call failed:', err.message);
    }
})();
