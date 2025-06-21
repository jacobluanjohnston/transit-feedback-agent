require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function findSimilarReports(inputText) {
    // Step 1: Generate embedding for the input
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: inputText
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Query similar reports from Supabase
    const { data, error } = await supabase.rpc('match_reports', {
        query_embedding: queryEmbedding,
        match_threshold: 0.75,    // optional: similarity threshold
        match_count: 5            // top 5 matches
    });

    if (error) {
        console.error("❌ Similarity search error:", error);
    } else {
        console.log("🔍 Similar Reports:");
        data.forEach((report, i) => {
            console.log(`\n#${i + 1}`);
            console.log(`Agency: ${report.agency}`);
            console.log(`Text: ${report.text}`);
            console.log(`Tags: ${report.tags}`);
        });
    }
}

findSimilarReports("The elevator at Civic Center station was broken again today.");
