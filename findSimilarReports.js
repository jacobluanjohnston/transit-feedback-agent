const { supabase } = require('./supabaseClient');

async function findSimilarReports(queryEmbedding) {
    const { data, error } = await supabase.rpc('match_reports', {
        query_embedding: queryEmbedding,
        match_threshold: 0.78,
        match_count: 5
    });

    if (error) {
        console.error('❌ Error in similarity search:', error);
        return [];
    }

    return data;
}

module.exports = { findSimilarReports };
