require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
    const text = "The elevator at Civic Center station is broken again.";

    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
    });

    // ✅ Get the embedding once
    const embedding = embeddingResponse.data[0].embedding;

    // ✅ Add logging here
    console.log("🧠 Embedding vector length:", embedding.length);
    console.log("🧠 First 5 values:", embedding.slice(0, 5));

    // ✅ Ensure clean float array
    const cleanEmbedding = embedding.map(Number);

    const { data, error } = await supabase
        .from('reports')
        .insert([{
            text,
            embedding: `[${cleanEmbedding.join(',')}]`,  // pass as Postgres-compatible string
            tags: ['accessibility', 'infrastructure'],
            location: 'Civic Center Station',
            stop_name: 'Civic Center',
            agency: 'BART',
            route_id: null
        }]);

    if (error) {
        console.error("❌ Supabase insert error:", error);
    } else {
        console.log("✅ Report stored!", data);
    }
}

main();
