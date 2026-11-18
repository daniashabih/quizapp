const { questions, CATEGORY_NAME, SESSION_NUMBER, normalizeQuestionKey } = require('./uploadCombinedSemester2Quiz');

async function syncToLive() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    console.log('================================================================');
    console.log(`  SYNCING ${questions.length} MCQS TO LIVE SERVER (${BASE_URL})`);
    console.log(`  Track: "${CATEGORY_NAME}", Session: ${SESSION_NUMBER}`);
    console.log('================================================================\n');

    // Step 1: Admin Login
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: process.env.ADMIN_PASSWORD || 'AdminPassword123!'
        })
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

    // Step 3: Fetch ALL Existing Questions across all sessions for Category
    const encodedCategory = encodeURIComponent(CATEGORY_NAME);
    const existingRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}`);
    const existingQuestions = existingRes.ok ? await existingRes.json() : [];
    const existingByKey = new Map();
    for (const q of (Array.isArray(existingQuestions) ? existingQuestions : [])) {
        const key = normalizeQuestionKey(q.question_text || q.questionText);
        if (key && !existingByKey.has(key)) {
            existingByKey.set(key, q);
        }
    }
    console.log(`Found ${existingByKey.size} existing question(s) across all sessions of "${CATEGORY_NAME}".`);

    let inserted = 0;
    let moved = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const key = normalizeQuestionKey(q.questionText);
        const existing = existingByKey.get(key);

        if (existing) {
            const existingSession = existing.session || 1;
            const existingExp = existing.explanation || '';
            const targetExp = q.explanation || existingExp;
            const needsMove = existingSession !== SESSION_NUMBER;
            const needsExplanationSync = Boolean(targetExp) && targetExp !== existingExp;

            if (!needsMove && !needsExplanationSync) {
                skipped++;
                continue;
            }

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
                    correct_answer: q.correctAnswer,
                    explanation: targetExp
                })
            });

            if (putRes.ok) {
                if (needsMove) {
                    console.log(`  [${i + 1}/${questions.length}] 🔄 Moved Session ${existingSession} -> Session ${SESSION_NUMBER}: "${q.questionText.substring(0, 45)}..."`);
                    moved++;
                } else {
                    console.log(`  [${i + 1}/${questions.length}] 🔄 Updated explanation: "${q.questionText.substring(0, 45)}..."`);
                    updated++;
                }
                existing.session = SESSION_NUMBER;
            } else {
                const errData = await putRes.text();
                console.error(`  [${i + 1}/${questions.length}] ❌ Failed to update: "${q.questionText.substring(0, 45)}..." - ${errData}`);
                failed++;
            }

            await new Promise(r => setTimeout(r, 50));
            continue;
        }

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
                correct_answer: q.correctAnswer,
                explanation: q.explanation || ''
            })
        });

        if (postRes.ok) {
            console.log(`  [${i + 1}/${questions.length}] ➕ Added: "${q.questionText.substring(0, 45)}..."`);
            inserted++;
            existingByKey.set(key, { session: SESSION_NUMBER });
        } else {
            const errData = await postRes.text();
            console.error(`  [${i + 1}/${questions.length}] ❌ Failed to add: "${q.questionText.substring(0, 45)}..." - ${errData}`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 60));
    }

    // Ensure no leftover questions remain in Session 2+
    for (const q of (Array.isArray(existingQuestions) ? existingQuestions : [])) {
        if ((q.session || 1) !== SESSION_NUMBER) {
            const qId = q.id || q._id;
            const qText = q.question_text || q.questionText || '';
            const putRes = await fetch(`${BASE_URL}/api/questions/${qId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    category: CATEGORY_NAME,
                    session: SESSION_NUMBER,
                    question_text: qText,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                    correct_answer: q.correct_answer || q.correctAnswer,
                    explanation: q.explanation || ''
                })
            });
            if (putRes.ok) {
                console.log(`  🔄 Moved extra question from Session ${q.session} -> Session ${SESSION_NUMBER}: "${qText.substring(0, 45)}..."`);
                moved++;
            }
        }
    }

    // Step 4: Verify Final Counts
    const verifyRes = await fetch(`${BASE_URL}/api/categories`);
    const categories = await verifyRes.json();
    const liveCat = (Array.isArray(categories) ? categories : []).find(
        c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    const sessionsRes = await fetch(`${BASE_URL}/api/questions/sessions?category=${encodedCategory}`);
    const liveSessions = sessionsRes.ok ? await sessionsRes.json() : [];

    const verifyQuestionsRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const verifyQuestions = verifyQuestionsRes.ok ? await verifyQuestionsRes.json() : [];

    console.log('\n================================================================');
    console.log('🎉 SYNC COMPLETE:');
    console.log(`   - Newly Uploaded: ${inserted}`);
    console.log(`   - Moved to Session ${SESSION_NUMBER}: ${moved}`);
    console.log(`   - Updated Explanations: ${updated}`);
    console.log(`   - Unchanged Existing: ${skipped}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Category Name in DB: "${liveCat ? liveCat.name : CATEGORY_NAME}"`);
    console.log(`   - Total Questions on Live Server: ${liveCat ? liveCat.questionCount : verifyQuestions.length}`);
    console.log(`   - Available Sessions: ${JSON.stringify(liveSessions)}`);
    console.log(`   - Verified Session ${SESSION_NUMBER} Questions: ${Array.isArray(verifyQuestions) ? verifyQuestions.length : 0}`);
    console.log('================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

syncToLive().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
