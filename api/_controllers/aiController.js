const OpenAI = require('openai');
const Question = require('../_models/questionModel');
require('dotenv').config();

const DEFAULT_SECRET = 'sk-PAkM8pWxJPlIJEjcG31uFGxIhepIY7dTYcszJeCcuyCFRENz';
const DEFAULT_TOKEN_ID = 'wk-2at5KeicyEbZKxRBF83xPn';

const getAIClientConfig = (modalToken, modalSecret) => {
    let secret = (modalSecret || process.env.MODAL_PROXY_TOKEN_SECRET || process.env.OPENAI_API_KEY || DEFAULT_SECRET).trim();
    let tokenId = (modalToken || process.env.MODAL_PROXY_TOKEN_ID || DEFAULT_TOKEN_ID).trim();

    let fullApiKey = '';
    if (modalToken && modalToken.includes('.')) {
        fullApiKey = modalToken.trim();
    } else if (secret.includes('.')) {
        fullApiKey = secret;
    } else {
        fullApiKey = `${tokenId}.${secret}`;
    }

    const modalBaseURL = process.env.MODAL_BASE_URL || "https://daniyashabih--ep-kimi-k3-server.us-west.modal.direct/v1";

    return {
        fullApiKey,
        rawSecret: secret,
        tokenId,
        modalBaseURL
    };
};

const generateQuestions = async (req, res) => {
    console.log('--- AI Question Generation Request ---');
    console.log('Body:', req.body);

    const { topic, difficulty = 'beginner', count = 5, modalToken, modalSecret } = req.body;

    if (!topic || !topic.trim()) {
        return res.status(400).json({ message: 'Topic is required for generating quiz questions.' });
    }

    const { fullApiKey, rawSecret, tokenId, modalBaseURL } = getAIClientConfig(modalToken, modalSecret);

    const systemPrompt = "You are a concise technical assistant that generates technical quiz questions. Output ONLY valid JSON arrays with no surrounding conversational text or markdown code blocks.";
    const userPrompt = `
        Create ${count} multiple-choice quiz questions about "${topic}" for a ${difficulty} level developer.
        Return ONLY a valid JSON array of objects with this structure:
        [
            {
                "category": "${topic}",
                "question_text": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "difficulty": "${difficulty}",
                "explanation": "Short explanation of why Option A is correct."
            }
        ]
        Do not include markdown tags like \`\`\`json. Output ONLY the JSON array.
    `;

    let completion = null;
    let attemptedEndpoints = [];

    // Keys to try on Modal endpoint
    const modalKeyCandidates = Array.from(new Set([
        fullApiKey,
        `${tokenId}.${rawSecret}`,
        rawSecret,
        `${DEFAULT_TOKEN_ID}.${DEFAULT_SECRET}`,
        DEFAULT_SECRET
    ]));

    for (const key of modalKeyCandidates) {
        if (!key) continue;
        try {
            console.log(`Attempting Modal Endpoint (${modalBaseURL}) with candidate key prefix: ${key.substring(0, 15)}...`);
            const client = new OpenAI({ baseURL: modalBaseURL, apiKey: key });
            completion = await client.chat.completions.create({
                model: process.env.MODAL_MODEL_NAME || "moonshotai/Kimi-K3",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 2048,
                top_p: 0.95,
                stream: false,
            });

            if (completion?.choices?.[0]?.message?.content) {
                console.log('✅ Success with Modal endpoint!');
                break;
            }
        } catch (err) {
            console.warn(`Modal attempt failed:`, err.message);
            attemptedEndpoints.push(`Modal (${err.message})`);
        }
    }

    // Attempt 2: Fallback to standard OpenAI API endpoint if rawSecret or process.env has sk- key and Modal failed
    if (!completion && (rawSecret.startsWith('sk-') || DEFAULT_SECRET.startsWith('sk-'))) {
        const openAIKey = rawSecret.startsWith('sk-') ? rawSecret : DEFAULT_SECRET;
        try {
            console.log('Attempting OpenAI standard endpoint (api.openai.com) with model "gpt-4o-mini"...');
            const client = new OpenAI({ apiKey: openAIKey });
            completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 2048,
            });
            if (completion?.choices?.[0]?.message?.content) {
                console.log('✅ Success with OpenAI standard endpoint!');
            }
        } catch (err) {
            console.warn('OpenAI standard endpoint failed:', err.message);
            attemptedEndpoints.push(`OpenAI (${err.message})`);
        }
    }

    if (!completion || !completion.choices?.[0]?.message?.content) {
        return res.status(500).json({
            message: `Failed to generate questions. ${attemptedEndpoints.join('; ')}`
        });
    }

    let content = completion.choices[0].message.content || '';

    // Sanitize output
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    content = content.replace(/^```(?:json)?/gi, '').replace(/```$/g, '').trim();

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    let questions;
    try {
        questions = JSON.parse(jsonStr);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Content:', jsonStr);
        return res.status(500).json({ message: 'Failed to parse AI response into valid JSON questions.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(500).json({ message: 'AI returned no valid questions.' });
    }

    const savedIds = [];
    for (const q of questions) {
        const formattedQuestion = {
            category: q.category || topic,
            question_text: q.question_text || q.question || 'Sample question',
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: q.correct_answer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
            difficulty: q.difficulty || difficulty,
            explanation: q.explanation || ''
        };

        const id = await Question.create(formattedQuestion);
        savedIds.push(id);
    }

    res.json({
        message: `Successfully generated ${savedIds.length} AI questions!`,
        count: savedIds.length
    });
};

module.exports = { generateQuestions };
