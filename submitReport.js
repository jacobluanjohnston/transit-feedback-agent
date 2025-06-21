require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const { tagWithClaude } = require('./utils/tagger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
    const text = "The elevator at Civic Center station is broken again.";

    // Step 1: Generate embedding
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
    });
    const embedding = embeddingResponse.data[0].embedding;
    const cleanEmbedding = embedding.map(Number);

    console.log("🧠 Embedding vector length:", cleanEmbedding.length);
    console.log("🧠 First 5 values:", cleanEmbedding.slice(0, 5));

    // Step 2: Get tags from Claude
    const tags = await tagWithClaude(text);
    console.log("🏷️ Tags:", tags);

    // Step 3: Insert into Supabase
    const { data, error } = await supabase
        .from('reports')
        .insert([{
            text,
            embedding: `[${cleanEmbedding.join(',')}]`,
            tags,
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
