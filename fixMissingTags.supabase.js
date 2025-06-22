require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const { tagWithClaude } = require('./tagWithClaude.js');

const TABLE = 'reports';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    console.log('🔍 Fetching reports with missing tags…');

    const { data: reports, error } = await supabase
        .from(TABLE)
        .select('id, text')
        .or('tags.is.null,tags.eq.{}');

    if (error) return console.error('❌ Fetch error:', error.message);
    if (!reports.length) return console.log('👍 Nothing to tag!');

    for (const r of reports) {
        try {
            const tags = await tagWithClaude(r.text);
            await supabase.from(TABLE).update({ tags }).eq('id', r.id);
            console.log('🆕', r.id, '→', tags);
        } catch (e) {
            console.error('⚠️ Update failed for', r.id, e.message);
        }
    }
    console.log('✅ Tag back-fill done.');
})();
