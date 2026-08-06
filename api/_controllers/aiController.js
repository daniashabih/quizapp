const OpenAI = require('openai');
const Question = require('../_models/questionModel');
require('dotenv').config();

const DEFAULT_SECRET = 'sk-PAkM8pWxJPlIJEjcG31uFGxIhepIY7dTYcszJeCcuyCFRENz';
const DEFAULT_TOKEN_ID = 'wk-2at5KeicyEbZKxRBF83xPn';

const buildModalCandidates = (modalToken, modalSecret) => {
    const candidates = [];

    const rawSecret = (modalSecret || process.env.MODAL_PROXY_TOKEN_SECRET || process.env.OPENAI_API_KEY || DEFAULT_SECRET).trim();
    const rawTokenId = (modalToken || process.env.MODAL_PROXY_TOKEN_ID || DEFAULT_TOKEN_ID).trim();

    let cleanTokenId = rawTokenId;
    if (!cleanTokenId.startsWith('wk-') && !cleanTokenId.includes('.')) {
        cleanTokenId = `wk-${cleanTokenId}`;
    }

    if (rawSecret.includes('.')) {
        candidates.push(rawSecret);
        const parts = rawSecret.split('.');
        const id = parts[0];
        const sec = parts.slice(1).join('.');
        if (sec && !sec.startsWith('ws-')) {
            if (sec.startsWith('sk-')) {
                candidates.push(`${id}.ws-${sec.slice(3)}`);
            }
            candidates.push(`${id}.ws-${sec}`);
        }
    }

    if (rawSecret.startsWith('ws-')) {
        candidates.push(`${cleanTokenId}.${rawSecret}`);
    } else if (rawSecret.startsWith('sk-')) {
        // Modal Proxy expects ws-<secret>
        candidates.push(`${cleanTokenId}.ws-${rawSecret.slice(3)}`);
        candidates.push(`${cleanTokenId}.ws-${rawSecret}`);
        candidates.push(`${cleanTokenId}.${rawSecret}`);
    } else {
        candidates.push(`${cleanTokenId}.ws-${rawSecret}`);
        candidates.push(`${cleanTokenId}.${rawSecret}`);
    }

    // Default env fallback
    if (process.env.MODAL_PROXY_TOKEN) {
        candidates.push(process.env.MODAL_PROXY_TOKEN.trim());
    }

    return {
        candidates: Array.from(new Set(candidates.filter(Boolean))),
        rawSecret,
        rawTokenId
    };
};

const generateQuestions = async (req, res) => {
    console.log('--- AI Question Generation Request ---');
    console.log('Body:', req.body);

    const { topic, difficulty = 'beginner', count = 5, modalToken, modalSecret } = req.body;

    if (!topic || !topic.trim()) {
        return res.status(400).json({ message: 'Topic is required for generating quiz questions.' });
    }

    const { candidates, rawSecret } = buildModalCandidates(modalToken, modalSecret);
    const modalBaseURL = process.env.MODAL_BASE_URL || "https://daniyashabih--ep-kimi-k3-server.us-west.modal.direct/v1";
    const modelName = process.env.MODAL_MODEL_NAME || "moonshotai/Kimi-K3";

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

    let content = null;
    let successfulSource = '';

    // Attempt 1: Modal Proxy Candidates (with auto ws- conversion)
    for (const key of candidates) {
        try {
            console.log(`Trying Modal Proxy key: ${key.substring(0, 18)}...`);
            const client = new OpenAI({ baseURL: modalBaseURL, apiKey: key });
            const completion = await client.chat.completions.create({
                model: modelName,
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
                content = completion.choices[0].message.content;
                successfulSource = 'Modal Kimi-K3';
                console.log('✅ Success with Modal Proxy!');
                break;
            }
        } catch (err) {
            console.warn(`Modal attempt failed for key ${key.substring(0, 18)}...:`, err.message);
        }
    }

    // Attempt 2: Standard OpenAI API if rawSecret is valid OpenAI key
    if (!content && (rawSecret.startsWith('sk-') || DEFAULT_SECRET.startsWith('sk-'))) {
        const keysToTry = Array.from(new Set([rawSecret, DEFAULT_SECRET].filter(k => k.startsWith('sk-'))));
        for (const openAIKey of keysToTry) {
            try {
                console.log('Trying OpenAI standard API...');
                const client = new OpenAI({ apiKey: openAIKey });
                const completion = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 2048,
                });
                if (completion?.choices?.[0]?.message?.content) {
                    content = completion.choices[0].message.content;
                    successfulSource = 'OpenAI gpt-4o-mini';
                    console.log('✅ Success with OpenAI!');
                    break;
                }
            } catch (err) {
                console.warn('OpenAI API attempt failed:', err.message);
            }
        }
    }

    // Attempt 3: Gemini REST API fallback
    if (!content && process.env.GEMINI_API_KEY) {
        try {
            console.log('Trying Gemini REST API fallback...');
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                    }]
                })
            });
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                content = text;
                successfulSource = 'Gemini 2.5 Flash';
                console.log('✅ Success with Gemini API!');
            }
        } catch (err) {
            console.warn('Gemini API attempt failed:', err.message);
        }
    }

    if (!content) {
        return res.status(500).json({
            message: `Could not connect to Modal Proxy endpoint. Please verify your Modal proxy token/secret (format: wk-<id>.ws-<secret>).`
        });
    }

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
        message: `Successfully generated ${savedIds.length} AI questions using ${successfulSource}!`,
        count: savedIds.length
    });
};

module.exports = { generateQuestions };
