require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
// const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

const systemPrompt = `
You are a data analyst for a public transportation agency. 
Your job is to identify trends in complaint tags and summarize key insights.
Use bullet points. If a certain complaint type is rising (e.g. safety), mention it. 
If there's anything especially frequent (e.g. missed stops), highlight it.
Be helpful and concise.
`;

async function main() {
    console.log('📊 Fetching complaints from Supabase...');

    const { data: reports, error } = await supabase
        .from('reports')
        .select('text, tags, created_at')
        .order('created_at', { ascending: false })
        .limit(100); // last 100

    if (error) {
        console.error('❌ Error fetching complaints:', error.message);
        return;
    }

    if (!reports.length) {
        console.log('⚠️ No complaints found.');
        return;
    }

    const rawText = reports
        .map(r => `• ${r.tags.join(', ')} — ${r.text}`)
        .join('\n');

    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            temperature: 0.4,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: `Here are the latest transit complaints:\n\n${rawText}`,
                },
            ],
        });

        const summary = message.content[0].text;

        console.log('\n📈 Complaint Summary:\n');
        console.log(summary);

        const { error: insertError } = await supabase
            .from('analytics_summary')
            .insert({ summary });

        if (insertError) {
            console.error('❌ Error saving summary:', insertError.message);
        } else {
            console.log('✅ Summary saved to Supabase.');
        }
    } catch (err) {
        console.error('❌ Claude summary failed:', err.message);
    }
}

main();
