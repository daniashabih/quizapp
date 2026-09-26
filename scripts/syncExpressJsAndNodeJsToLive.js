const { questions, CATEGORY_NAME, SESSION_NUMBER } = require('./uploadExpressJsAndNodeJsSession1Quiz');

async function syncToLive() {
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO LIVE SERVER (https://hangbug.vercel.app)`);
    console.log(`  Track: "${CATEGORY_NAME}", Session: ${SESSION_NUMBER}`);
    console.log('================================================================\n');

    // Step 1: Admin Login
    console.log('Logging in as Admin...');
    const loginRes = await fetch('https://hangbug.vercel.app/api/auth/login', {
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
    const catRes = await fetch('https://hangbug.vercel.app/api/categories');
    const existingCats = catRes.ok ? await catRes.json() : [];
    const catExists = (Array.isArray(existingCats) ? existingCats : []).some(
        c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    if (!catExists) {
        console.log(`Creating category "${CATEGORY_NAME}"...`);
        const createCatRes = await fetch('https://hangbug.vercel.app/api/categories', {
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

    // Step 3: Fetch Existing Questions for Category & Session
    const encodedCategory = encodeURIComponent(CATEGORY_NAME);
    const existingRes = await fetch(`https://hangbug.vercel.app/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const existingQuestions = existingRes.ok ? await existingRes.json() : [];
    const existingTexts = new Set(
        (Array.isArray(existingQuestions) ? existingQuestions : []).map(q => (q.question_text || q.questionText || '').trim().toLowerCase())
    );
    console.log(`Found ${existingTexts.size} existing question(s) already on server.`);

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const normalizedText = q.questionText.trim().toLowerCase();

        if (existingTexts.has(normalizedText)) {
            console.log(`  [${i + 1}/${questions.length}] ⏭ Skipped existing: "${q.questionText.substring(0, 45)}..."`);
            skipped++;
            continue;
        }

        const postRes = await fetch('https://hangbug.vercel.app/api/questions', {
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
            console.log(`  [${i + 1}/${questions.length}] ➕ Added: "${q.questionText.substring(0, 45)}..."`);
            inserted++;
            existingTexts.add(normalizedText);
        } else {
            const errData = await postRes.text();
            console.error(`  [${i + 1}/${questions.length}] ❌ Failed to add: "${q.questionText.substring(0, 45)}..." - ${errData}`);
            failed++;
        }

        // Small polite delay
        await new Promise(r => setTimeout(r, 80));
    }

    // Step 4: Verify Final Counts
    const verifyRes = await fetch('https://hangbug.vercel.app/api/categories');
    const categories = await verifyRes.json();
    const liveCat = (Array.isArray(categories) ? categories : []).find(c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase());

    const verifyQuestionsRes = await fetch(`https://hangbug.vercel.app/api/questions?category=${encodedCategory}&session=${SESSION_NUMBER}`);
    const verifyQuestions = verifyQuestionsRes.ok ? await verifyQuestionsRes.json() : [];

    console.log('\n================================================================');
    console.log('🎉 UPLOAD COMPLETE:');
    console.log(`   - Newly Uploaded: ${inserted}`);
    console.log(`   - Previously Existing: ${skipped}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Category Name in DB: "${liveCat ? liveCat.name : CATEGORY_NAME}"`);
    console.log(`   - Total Questions on Live Server: ${liveCat ? liveCat.questionCount : verifyQuestions.length}`);
    console.log(`   - Available Sessions: ${liveCat && liveCat.sessions ? liveCat.sessions.join(', ') : [SESSION_NUMBER].join(', ')}`);
    console.log(`   - Verified Fetched Questions: ${Array.isArray(verifyQuestions) ? verifyQuestions.length : 0}`);
    console.log('================================================================\n');
}

syncToLive().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
