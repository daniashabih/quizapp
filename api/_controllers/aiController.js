const OpenAI = require('openai');
const Question = require('../_models/questionModel');
require('dotenv').config();

let openaiClient = null;

const getOpenAIClient = () => {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API Key not configured');
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
};

const generateQuestions = async (req, res) => {
    console.log('--- AI Generation Request Received ---');
    console.log('Body:', req.body);

    try {
        const { topic, count = 5, session = 1 } = req.body;
        const sessionNum = parseInt(session, 10) || 1;

        if (!process.env.OPENAI_API_KEY) {
            console.error('Missing OpenAI API Key');
            return res.status(500).json({ message: 'OpenAI API Key not configured' });
        }

        const openai = getOpenAIClient();

        const prompt = `
            Create ${count} multiple-choice quiz questions about ${topic}.
            Return ONLY a valid JSON array of objects with this structure:
            [
                {
                    "category": "${topic}",
                    "session": ${sessionNum},
                    "question_text": "Question here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "Option A"
                }
            ]
            Do not include any markdown formatting like \`\`\`json. Just the raw JSON array.
        `;

        console.log('Sending request to OpenAI...');
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        console.log('OpenAI Response received');
        const content = completion.choices[0].message.content.trim();
        console.log('Raw Content:', content);

        // Clean up markdown if present (sometimes GPT adds it anyway)
        const jsonStr = content.replace(/^```json/, '').replace(/```$/, '').trim();

        let questions;
        try {
            questions = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('String attempting to parse:', jsonStr);
            throw new Error('Failed to parse AI response. Try again.');
        }

        console.log(`Parsed ${questions.length} questions. Saving to DB...`);

        // Save to database (skipping duplicates across the category)
        const savedIds = [];
        const seenNorm = new Set();
        let skippedDuplicates = 0;

        for (const q of questions) {
            const targetCategory = q.category || topic;
            const normText = Question.normalizeQuestionText(q.question_text);
            if (!normText || seenNorm.has(normText)) {
                skippedDuplicates++;
                continue;
            }
            const existingDuplicate = await Question.findDuplicate({
                category: targetCategory,
                question_text: q.question_text
            });
            if (existingDuplicate) {
                skippedDuplicates++;
                continue;
            }
            const id = await Question.create({
                ...q,
                category: targetCategory,
                session: sessionNum
            });
            seenNorm.add(normText);
            savedIds.push(id);
        }

        console.log('All non-duplicate questions saved successfully.');
        res.json({
            message: skippedDuplicates > 0
                ? `Successfully generated ${savedIds.length} questions (${skippedDuplicates} duplicate(s) skipped)`
                : `Successfully generated ${savedIds.length} questions`,
            count: savedIds.length,
            skipped: skippedDuplicates
        });

    } catch (error) {
        console.error('AI Generation Error:', error);

        let errorMessage = 'Failed to generate questions. Check API Key or try again.';

        if (error.response) {
            // OpenAI API error
            errorMessage = `OpenAI API Error: ${error.response.data.error.message}`;
            console.error('OpenAI Error details:', error.response.data);
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({ message: errorMessage });
    }
};

module.exports = { generateQuestions };
