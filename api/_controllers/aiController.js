const OpenAI = require('openai');
const Question = require('../_models/questionModel');
require('dotenv').config();

const getAIClient = (modalToken, modalSecret) => {
    let apiKey = '';

    if (modalToken && modalToken.trim()) {
        apiKey = modalToken.trim();
    } else if (modalSecret && modalSecret.trim()) {
        const tokenId = (process.env.MODAL_PROXY_TOKEN_ID || 'wk-2at5KeicyEbZKxRBF83xPn').trim();
        let cleanSecret = modalSecret.trim();
        if (!cleanSecret.startsWith('ws-')) {
            cleanSecret = `ws-${cleanSecret}`;
        }
        apiKey = `${tokenId}.${cleanSecret}`;
    } else {
        if (process.env.MODAL_PROXY_TOKEN && process.env.MODAL_PROXY_TOKEN.includes('.ws-')) {
            apiKey = process.env.MODAL_PROXY_TOKEN.trim();
        } else if (process.env.MODAL_PROXY_TOKEN_ID && process.env.MODAL_PROXY_TOKEN_SECRET) {
            apiKey = `${process.env.MODAL_PROXY_TOKEN_ID.trim()}.${process.env.MODAL_PROXY_TOKEN_SECRET.trim()}`;
        } else {
            apiKey = (process.env.MODAL_PROXY_TOKEN || 'wk-2at5KeicyEbZKxRBF83xPn').trim();
        }
    }

    const baseURL = process.env.MODAL_BASE_URL || "https://daniyashabih--ep-kimi-k3-server.us-west.modal.direct/v1";

    return {
        client: new OpenAI({ baseURL, apiKey }),
        apiKey,
        baseURL
    };
};

const generateQuestions = async (req, res) => {
    console.log('--- AI Question Generation Request (Modal / Kimi-K3) ---');
    console.log('Body:', req.body);

    const { topic, difficulty = 'beginner', count = 5, modalToken, modalSecret } = req.body;

    if (!topic || !topic.trim()) {
        return res.status(400).json({ message: 'Topic is required for generating quiz questions.' });
    }

    const { client, apiKey, baseURL } = getAIClient(modalToken, modalSecret);
    const modelName = process.env.MODAL_MODEL_NAME || "moonshotai/Kimi-K3";

    // Check if proxy secret is provided
    if (!apiKey.includes('.ws-')) {
        return res.status(400).json({
            message: 'Proxy Auth Required: Please enter your Modal Proxy Secret (ws-<secret>) or full token (wk-<id>.ws-<secret>) in the AI Generator options below.'
        });
    }

    try {
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

        console.log(`Sending request to Modal API endpoint (${baseURL}, model: ${modelName})...`);
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

        console.log('Modal API Response received.');
        let content = completion.choices[0]?.message?.content || '';

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
            throw new Error('Failed to parse AI response into valid JSON questions.');
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('AI returned no valid questions.');
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
            message: `Successfully generated ${savedIds.length} AI questions using Kimi-K3!`,
            count: savedIds.length
        });

    } catch (error) {
        console.error('AI Generation Error:', error);

        let errorMessage = error.message || 'Failed to generate questions. Please check Modal API proxy settings.';

        if (error.status === 401 || error.response?.status === 401 || errorMessage.toLowerCase().includes('proxy auth required') || errorMessage.toLowerCase().includes('401')) {
            errorMessage = 'Proxy Auth Required: Please enter your Modal secret (ws-<secret>) or full token (wk-<id>.ws-<secret>) in the AI Generator form.';
        } else if (error.response?.data?.error?.message) {
            errorMessage = `Modal API Error: ${error.response.data.error.message}`;
        }

        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { generateQuestions };
