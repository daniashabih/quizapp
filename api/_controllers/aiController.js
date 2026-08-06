const OpenAI = require('openai');
const Question = require('../_models/questionModel');
require('dotenv').config();

const getAIClient = () => {
    let apiKey = process.env.MODAL_PROXY_TOKEN;
    if (!apiKey && process.env.MODAL_PROXY_TOKEN_ID && process.env.MODAL_PROXY_TOKEN_SECRET) {
        apiKey = `${process.env.MODAL_PROXY_TOKEN_ID}.${process.env.MODAL_PROXY_TOKEN_SECRET}`;
    }
    if (!apiKey) {
        apiKey = process.env.OPENAI_API_KEY || 'wk-2at5KeicyEbZKxRBF83xPn';
    }

    const baseURL = process.env.MODAL_BASE_URL || "https://daniyashabih--ep-kimi-k3-server.us-west.modal.direct/v1";

    return new OpenAI({
        baseURL,
        apiKey,
    });
};

const generateQuestions = async (req, res) => {
    console.log('--- AI Question Generation Request (Modal / Kimi-K3) ---');
    console.log('Body:', req.body);

    try {
        const { topic, difficulty = 'beginner', count = 5 } = req.body;

        const client = getAIClient();
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

        console.log(`Sending request to Modal API endpoint (${modelName})...`);
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
        console.log('Raw Content:', content);

        // Sanitize output: remove reasoning tags <think>...</think>
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        // Remove markdown wrappers
        content = content.replace(/^```(?:json)?/gi, '').replace(/```$/g, '').trim();

        // Extract JSON array
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;

        let questions;
        try {
            questions = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('String attempting to parse:', jsonStr);
            throw new Error('Failed to parse AI response into valid JSON questions.');
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('AI returned no valid questions.');
        }

        console.log(`Parsed ${questions.length} questions. Saving to database...`);

        const savedIds = [];
        for (const q of questions) {
            const formattedQuestion = {
                category: q.category || topic,
                question_text: q.question_text || q.question || 'Sample question',
                options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correct_answer: q.correct_answer || (Array.isArray(q.options) ? q.options[0] : 'Option 1'),
                difficulty: q.difficulty || difficulty,
                explanation: q.explanation || ''
            };

            const id = await Question.create(formattedQuestion);
            savedIds.push(id);
        }

        console.log(`Successfully saved ${savedIds.length} questions.`);
        res.json({
            message: `Successfully generated ${savedIds.length} AI questions using Kimi-K3!`,
            count: savedIds.length
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        let errorMessage = error.message || 'Failed to generate questions. Please check Modal API proxy settings or try again.';
        if (error.response?.data?.error?.message) {
            errorMessage = `Modal API Error: ${error.response.data.error.message}`;
        }
        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { generateQuestions };
