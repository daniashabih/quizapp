const fs = require('fs');
const path = require('path');

async function syncToLive() {
    console.log('================================================================');
    console.log('  UPLOADING 54 MCQS TO LIVE SERVER (https://hangbug.vercel.app)');
    console.log('================================================================\n');

    const content = fs.readFileSync(path.resolve(__dirname, 'uploadSqlServerSession1Quiz.js'), 'utf8');
    const match = content.match(/const questions = (\[[\s\S]*?\]);\s*async function seed/);
    if (!match) throw new Error('Could not find questions array');
    const questions = eval(match[1]);

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

    // Step 2: Fetch Existing Questions for Category & Session
    const existingRes = await fetch('https://hangbug.vercel.app/api/questions?category=SQL%20Server&session=1');
    const existingQuestions = existingRes.ok ? await existingRes.json() : [];
    const existingTexts = new Set(
        (Array.isArray(existingQuestions) ? existingQuestions : []).map(q => (q.question_text || q.questionText || '').trim().toLowerCase())
    );
    console.log(`Found ${existingTexts.size} existing question(s) already on server.`);

    let inserted = 0;
    let skipped = 0;

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
                category: 'SQL Server',
                session: 1,
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
        }

        // Small delay to be polite to the serverless function
        await new Promise(r => setTimeout(r, 80));
    }

    // Step 3: Verify Final Counts
    const verifyRes = await fetch('https://hangbug.vercel.app/api/categories');
    const categories = await verifyRes.json();
    const sqlCat = (Array.isArray(categories) ? categories : []).find(c => c.name.toLowerCase() === 'sql server');

    console.log('\n================================================================');
    console.log('🎉 UPLOAD COMPLETE:');
    console.log(`   - Newly Uploaded: ${inserted}`);
    console.log(`   - Previously Existing: ${skipped}`);
    console.log(`   - Total on Live Server: ${sqlCat ? sqlCat.questionCount : 'unknown'}`);
    console.log(`   - Available Sessions: ${sqlCat && sqlCat.sessions ? sqlCat.sessions.join(', ') : 'none'}`);
    console.log('================================================================\n');
}

syncToLive().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
