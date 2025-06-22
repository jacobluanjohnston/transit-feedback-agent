require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TABLE = 'reports';

const EMBEDDING_MODEL = 'text-embedding-3-large';  // large for RAG

async function getEmbedding(text) {
    const res = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text
    });
    return res.data[0].embedding;
}

(async () => {
    const { data: reports, error } = await supabase
        .from(TABLE)
        .select('id, complaint')
        .is('embedding', null)
        .limit(1000);

    if (error) {
        console.error('❌ Fetch error:', error.message);
        return;
    }
    if (!reports.length) {
        console.log('✅ Nothing left to embed.');
        return;
    }

    for (const r of reports) {
        try {
            const vec = await getEmbedding(r.complaint);
            const { error: updErr } = await supabase
                .from(TABLE)
                .update({ embedding: vec })
                .eq('id', r.id);

            if (updErr) throw updErr;
            console.log(`✅ Embedded: ${r.id}`);
        } catch (e) {
            console.error(`❌ Failed (${r.id}):`, e.message);
        }
    }

    console.log('🎉 Embedding update complete.');
})();
