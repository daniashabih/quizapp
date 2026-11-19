const { questions, CATEGORY_NAME, SESSION_NUMBER } = require('./uploadMaterialUiMongoDbReactJsQuiz');

async function syncToLive() {
    if (!questions || questions.length === 0) {
        console.log(`ℹ️ No Session ${SESSION_NUMBER} questions remaining for "${CATEGORY_NAME}" (merged into Session 1).`);
        return;
    }

    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO LIVE SERVER (${BASE_URL})`);
    console.log(`  Track: "${CATEGORY_NAME}", Session: ${SESSION_NUMBER}`);
    console.log('================================================================\n');

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
            console.warn(`⚠️ Category creation response: ${createCatRes.status}\n`);
        }
    } else {
        console.log(`✔ Category "${CATEGORY_NAME}" already exists.\n`);
    }

    const encodedCategory = encodeURIComponent(CATEGORY_NAME);
    const existingRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}`);
    const existingQuestions = existingRes.ok ? await existingRes.json() : [];

    const getKey = (q) => {
        return String(q.question_text || q.questionText || '')
            .trim()
            .toLowerCase()
            .replace(/_+/g, '_')
            .replace(/\s+/g, ' ');
    };

    const existingKeys = new Set(
        (Array.isArray(existingQuestions) ? existingQuestions : []).map(getKey)
    );
    console.log(`Found ${existingKeys.size} existing question(s) already on server across all sessions of "${CATEGORY_NAME}".`);

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const key = getKey(q);

        if (existingKeys.has(key)) {
            console.log(`  [${i + 1}/${questions.length}] ⏭ Skipped existing: "${q.questionText.substring(0, 45)}..."`);
            skipped++;
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
            existingKeys.add(key);
        } else {
            const errData = await postRes.text();
            console.error(`  [${i + 1}/${questions.length}] ❌ Failed: "${q.questionText.substring(0, 45)}..." - ${errData}`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 60));
    }

    const verifyRes = await fetch(`${BASE_URL}/api/categories`);
    const categories = await verifyRes.json();
    const liveCat = (Array.isArray(categories) ? categories : []).find(
        c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    const verifyQuestionsRes = await fetch(`${BASE_URL}/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const verifyQuestions = verifyQuestionsRes.ok ? await verifyQuestionsRes.json() : [];

    console.log('\n================================================================');
    console.log('🎉 UPLOAD COMPLETE:');
    console.log(`   - Newly Uploaded: ${inserted}`);
    console.log(`   - Previously Existing: ${skipped}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Category Name in DB: "${liveCat ? liveCat.name : CATEGORY_NAME}"`);
    console.log(`   - Total Questions on Live Server: ${liveCat ? liveCat.questionCount : verifyQuestions.length}`);
    console.log(`   - Available Sessions: ${liveCat && liveCat.sessions ? liveCat.sessions.join(', ') : [SESSION_NUMBER].join(', ')}`);
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
