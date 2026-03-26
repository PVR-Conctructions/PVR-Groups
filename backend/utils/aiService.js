const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');
const supabase = require('../config/supabase');

// ─── Fetch all projects from DB for context ────────────────────────────────
async function getProjectsContext() {
    try {
        const { data } = await supabase
            .from('projects')
            .select('name, title, description, location, status, price, area, units, project_type, configurations, amenities, possession_date, rera_number')
            .limit(20);
        if (!data || data.length === 0) return '';
        return data.map(p => {
            const loc = typeof p.location === 'object' ? (p.location?.address || JSON.stringify(p.location)) : p.location;
            const configs = Array.isArray(p.configurations) ? p.configurations.map(c => `${c.type || ''} (${c.area || ''}sq.ft, ₹${c.price || ''})`).join(', ') : '';
            const amenities = Array.isArray(p.amenities) ? p.amenities.join(', ') : p.amenities || '';
            return `• ${p.name || p.title}: ${p.description?.substring(0, 100)}. Location: ${loc}. Status: ${p.status}. Price: ${p.price}. Area: ${p.area}. Units: ${p.units}. Type: ${p.project_type}. Configurations: ${configs}. Amenities: ${amenities}. Possession: ${p.possession_date || 'TBD'}. RERA: ${p.rera_number || 'N/A'}.`;
        }).join('\n');
    } catch {
        return '';
    }
}

// ─── Build the system prompt ───────────────────────────────────────────────
function buildSystemPrompt(projectsContext) {
    return `You are a friendly, polite and knowledgeable customer service assistant for PVR Constructions — a leading real estate and construction company based in Vijayawada, Andhra Pradesh, India.

Your responsibilities:
- Answer questions about PVR Constructions projects, pricing, amenities, location, and possession dates ONLY based on data provided below.
- Be warm, professional, and polite at ALL times. Always greet with courtesy.
- If a customer mentions a specific project by name, answer using the exact data about that project.
- If you don't know the answer, say "Please contact us directly at +91 98765 43210 or pvrgroupsvijayawada@gmail.com for more details."
- Never invent pricing or details NOT in the data below.
- Keep replies concise and helpful, under 150 words.
- Always use Indian number formatting and ₹ for prices.
- At the end of relevant queries, offer to "Book a Site Visit" or connect via WhatsApp.

LIVE PROJECT DATA:
${projectsContext || 'Project data temporarily unavailable. Please contact us directly.'}

Company Contact:
📞 Phone: +91 98765 43210
📧 Email: pvrgroupsvijayawada@gmail.com
🌐 Website: pvr-groups.vercel.app
🕒 Hours: Monday–Saturday, 9 AM to 7 PM IST`;
}

// ─── Individual AI callers ─────────────────────────────────────────────────
async function askGemini(systemPrompt, userMessage) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('No Gemini key');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(
        `${systemPrompt}\n\nCustomer: ${userMessage}\nAssistant:`
    );
    return result.response.text().trim();
}

async function askGroq(systemPrompt, userMessage) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('No Groq key');
    const groq = new Groq({ apiKey: key });
    const res = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim();
}

async function askOpenAI(systemPrompt, userMessage) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('No OpenAI key');
    const openai = new OpenAI({ apiKey: key });
    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim();
}

async function askClaude(systemPrompt, userMessage) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('No Claude key');
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: key });
    const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
    });
    return msg.content[0]?.text?.trim();
}

// ─── Main fallback function ────────────────────────────────────────────────
async function askAI(userMessage) {
    const projectsContext = await getProjectsContext();
    const systemPrompt = buildSystemPrompt(projectsContext);

    const providers = [
        { name: 'Gemini', fn: () => askGemini(systemPrompt, userMessage) },
        { name: 'Groq', fn: () => askGroq(systemPrompt, userMessage) },
        { name: 'OpenAI', fn: () => askOpenAI(systemPrompt, userMessage) },
        { name: 'Claude', fn: () => askClaude(systemPrompt, userMessage) },
    ];

    for (const provider of providers) {
        try {
            const reply = await provider.fn();
            if (reply) {
                console.log(`✅ AI reply from ${provider.name}`);
                return { reply, provider: provider.name };
            }
        } catch (err) {
            const reason = err.message?.includes('429') ? 'quota exceeded' : err.message?.substring(0, 60);
            console.warn(`⚠️  ${provider.name} failed: ${reason}`);
        }
    }

    // All providers failed — return helpful fallback
    return {
        reply: "Hello! 👋 I'm here to help you with PVR Constructions.\n\nFor immediate assistance, please contact us:\n📞 +91 98765 43210\n📧 pvrgroupsvijayawada@gmail.com\n🕒 Mon-Sat, 9 AM - 7 PM\n\nOur team will be happy to assist you!",
        provider: 'fallback'
    };
}

module.exports = { askAI };
