const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function tagWithClaude(text) {
    const allowedTags = [
        "punctuality",        // general timing complaints
        "delay",              // late arrival
        "early_departure",    // left too early
        "missed_stop",        // skipped or didn't stop
        "confusing_schedule", // user confusion, unclear info
        "accessibility",      // wheelchairs, elevators, hearing
        "equipment_issue",    // broken AC, elevator, ramp
        "driver_issue",       // rude, reckless, racist, etc.
        "safety",             // speeding, platform concerns
        "cleanliness",        // trash, smells, vandalism
        "crowding",           // packed vehicles
        "harassment",         // sexual, verbal, racial aggression
        "discrimination",     // racial, disability, language-based
        "crime"               // theft, assault, harassment
    ];

    const prompt = `
You are a transit report tagging assistant.

Your job is to assign **2–5 tags** from the approved list below based on the following passenger complaint. Tags should be accurate, lowercase, and in **snake_case**, with no numbering or explanations.
Only choose from this list: ${JSON.stringify(allowedTags)}

Guidelines:
- Always pick the **most relevant** tags, but include **punctuality** if the report mentions inconsistent timing like early/late arrivals.
- Do not make up tags. Only use the ones from the list.

👉 Tagging rules:
- If the report mentions elevators, ramps, or wheelchair access, always include \'"accessibility"\'.
- If it mentions broken elevators/escalators, include both \'"equipment_issue"\' and \'"accessibility"\'.
- If someone mentions **lateness**, use \`"delay"\` AND \`"punctuality"\`.
- If someone says the vehicle **left too early**, use \`"early_departure"\` AND \`"punctuality"\`.
- If someone mentions **driver attitude or behavior**, use \`"driver_issue"\`.
- If a report includes illegal or violent behavior, always include \`"crime"\`.
- If it mentions a mess (trash, smells, unclean), include \'"cleanliness"\'.
- If it talks about danger, broken lights, platform chaos, include \'"safety"\'.
- If someone is **threatened or followed**, include \`"harassment"\` even if it's not violent.
- If the issue involves **racial, gender, or disability bias**, include \`"discrimination"\`.
- Use multiple tags if appropriate. For example, a complaint about a rude driver who left early should include:  
  \`["driver_issue", "early_departure", "punctuality"]\`

Input:
"${text}"

Respond ONLY with a JSON array of selected tags.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
    });

    const content = response.choices[0].message.content.trim();

    try {
        const match = content.match(/\[.*?\]/s);
        if (match) {
            const parsed = JSON.parse(match[0]);
            return parsed.filter(tag => allowedTags.includes(tag));
        }
        throw new Error("No valid array found.");
    } catch (err) {
        console.warn("⚠️ Tag parsing fallback used. Raw content:", content);

        return [];
    }
}

module.exports = { tagWithClaude };
