const fs = require('fs');
const path = require('path');

async function syncSqlServerSessions() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    const CATEGORY_NAME = 'SQL Server';

    console.log('================================================================');
    console.log(`  UPLOADING SQL SERVER SESSIONS 6 TO 17 TO LIVE SERVER (${BASE_URL})`);
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

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (let s = 6; s <= 17; s++) {
        const jsonFile = path.resolve(__dirname, `sql_server_session${s}.json`);
        if (!fs.existsSync(jsonFile)) {
            console.error(`File missing: ${jsonFile}`);
            continue;
        }

        const sessionData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        const questions = sessionData.questions;
        console.log(`----------------------------------------------------------------`);
        console.log(`📂 Processing Session ${s}: "${sessionData.title}" (${questions.length} Qs)`);
        console.log(`----------------------------------------------------------------`);

        // Fetch existing questions for this session
        const existingRes = await fetch(`${BASE_URL}/api/questions?category=SQL%20Server&session=${s}`);
        const existingQuestions = existingRes.ok ? await existingRes.json() : [];

        const existingTexts = new Set(
            (Array.isArray(existingQuestions) ? existingQuestions : []).map(q => 
                (q.question_text || q.questionText || '').trim().toLowerCase()
            )
        );
        console.log(`  Found ${existingTexts.size} existing question(s) on server for Session ${s}.`);

        let insertedForSession = 0;
        let skippedForSession = 0;
        let failedForSession = 0;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const normText = q.questionText.trim().toLowerCase();

            if (existingTexts.has(normText)) {
                skippedForSession++;
                totalSkipped++;
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
                    session: s,
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer: q.correctAnswer
                })
            });

            if (postRes.ok) {
                insertedForSession++;
                totalInserted++;
                existingTexts.add(normText);
                if (insertedForSession % 15 === 0 || insertedForSession === questions.length) {
                    console.log(`  [${i + 1}/${questions.length}] ➕ Uploaded (${insertedForSession} new in Session ${s})`);
                }
            } else {
                failedForSession++;
                totalFailed++;
                const errData = await postRes.text();
                console.error(`  [${i + 1}/${questions.length}] ❌ Failed: "${q.questionText.substring(0, 40)}..." - ${errData}`);
            }

            // Polite delay between requests
            await new Promise(r => setTimeout(r, 40));
        }

        console.log(`  ✔ Session ${s} Summary: ${insertedForSession} uploaded, ${skippedForSession} skipped, ${failedForSession} failed.`);
    }

    // Final verification
    console.log('\n================================================================');
    console.log('Verifying final SQL Server sessions on live server...');
    const verifySessionsRes = await fetch(`${BASE_URL}/api/questions/sessions?category=SQL%20Server`);
    const verifySessions = verifySessionsRes.ok ? await verifySessionsRes.json() : [];

    const verifyCatRes = await fetch(`${BASE_URL}/api/categories`);
    const cats = verifyCatRes.ok ? await verifyCatRes.json() : [];
    const sqlCat = (Array.isArray(cats) ? cats : []).find(c => c.name.toLowerCase() === 'sql server');

    console.log('🎉 UPLOAD COMPLETE:');
    console.log(`   - Total Newly Uploaded: ${totalInserted}`);
    console.log(`   - Total Skipped (Already existed): ${totalSkipped}`);
    console.log(`   - Total Failed: ${totalFailed}`);
    console.log(`   - Total Questions in SQL Server Category: ${sqlCat ? sqlCat.questionCount : 'unknown'}`);
    console.log(`   - Active Sessions Count: ${Array.isArray(verifySessions) ? verifySessions.length : 0}`);
    console.log('   - Sessions breakdown:');
    (Array.isArray(verifySessions) ? verifySessions : []).forEach(s => {
        console.log(`       • Session ${s.session}: ${s.count} questions`);
    });
    console.log('================================================================\n');
}

syncSqlServerSessions().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
