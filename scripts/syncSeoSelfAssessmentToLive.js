const fs = require('fs');
const path = require('path');

const sessionData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'seo_self_assessment.json'), 'utf8'));
const CATEGORY_NAME = sessionData.category;
const SESSION_NUMBER = sessionData.session || 1;
const questions = sessionData.questions;

async function syncToLive() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO LIVE SERVER (${BASE_URL})`);
    console.log(`  Track: "${CATEGORY_NAME}", Assessment: "Self Assessment" (Session: ${SESSION_NUMBER})`);
    console.log('================================================================\n');

    // Step 1: Admin Login
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPassword123!' })
    });

    if (!loginRes.ok) {
        throw new Error(`Admin login failed with status ${loginRes.status}`);
    }

    const { token } = await loginRes.json();
    console.log('✅ Admin login successful.\n');

    // Step 2: Ensure Category Exists
    console.log(`Checking category "${CATEGORY_NAME}" on live server...`);
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const existingCats = catRes.ok ? await catRes.json() : [];
    const catExists = (Array.isArray(existingCats) ? existingCats : []).some(
        c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    if (!catExists) {
        console.log(`Creating category "${CATEGORY_NAME}"...`);
        const createCatRes = await fetch(`${BASE_URL}/api/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ name: CATEGORY_NAME })
        });
        if (createCatRes.ok) {
            console.log(`✅ Category "${CATEGORY_NAME}" created successfully.\n`);
        } else {
            console.warn(`⚠️ Category creation response: ${createCatRes.status} (will auto-create on question insert)\n`);
        }
    } else {
        console.log(`✔ Category "${CATEGORY_NAME}" already exists.\n`);
    }

    // Step 3: Fetch Existing Questions for Category & Session 1
    const encodedCategory = encodeURIComponent(CATEGORY_NAME);
    const existingRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const existingQuestions = existingRes.ok ? await existingRes.json() : [];
    
    // Map of normalized question text to question object
    const existingMap = new Map();
    (Array.isArray(existingQuestions) ? existingQuestions : []).forEach(q => {
        const text = (q.question_text || q.questionText || '').trim().toLowerCase();
        if (text) existingMap.set(text, q);
    });
    console.log(`Found ${existingMap.size} existing question(s) on server in "${CATEGORY_NAME}" for Self Assessment.`);

    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const normalizedText = q.questionText.trim().toLowerCase();
        const existing = existingMap.get(normalizedText);

        if (existing) {
            // Update existing question to ensure verified answer and explanation
            const qId = existing.id || existing._id;
            const putRes = await fetch(`${BASE_URL}/api/questions/${qId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    category: CATEGORY_NAME,
                    session: SESSION_NUMBER,
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer: q.correctAnswer
                })
            });

            if (putRes.ok) {
                console.log(`  [${i + 1}/${questions.length}] 🔄 Updated verified answer: "${q.questionText.substring(0, 45)}..." -> "${q.correctAnswer}"`);
                updated++;
            } else {
                console.warn(`  [${i + 1}/${questions.length}] ⚠️ Update returned ${putRes.status}, keeping existing`);
            }
        } else {
            // Insert new question
            const postRes = await fetch(`${BASE_URL}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    category: CATEGORY_NAME,
                    session: SESSION_NUMBER,
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer: q.correctAnswer
                })
            });

            if (postRes.ok) {
                console.log(`  [${i + 1}/${questions.length}] ➕ Added new question: "${q.questionText.substring(0, 45)}..." -> "${q.correctAnswer}"`);
                inserted++;
                existingMap.set(normalizedText, q);
            } else {
                const errData = await postRes.text();
                console.error(`  [${i + 1}/${questions.length}] ❌ Failed to add: "${q.questionText.substring(0, 45)}..." - ${errData}`);
                failed++;
            }
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 60));
    }

    // Step 4: Verify Final Counts
    const verifyQuestionsRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const verifyQuestions = verifyQuestionsRes.ok ? await verifyQuestionsRes.json() : [];

    console.log('\n================================================================');
    console.log('🎉 UPLOAD & VERIFICATION COMPLETE:');
    console.log(`   - Newly Inserted: ${inserted}`);
    console.log(`   - Verified & Updated: ${updated}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Total Self Assessment Questions on Live Server: ${Array.isArray(verifyQuestions) ? verifyQuestions.length : 0}`);
    console.log('================================================================\n');
}

syncToLive().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
