const fs = require('fs');
const path = require('path');

async function syncAllSeoSessions() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    const CATEGORY_NAME = 'SEO';

    console.log('================================================================');
    console.log(`  UPLOADING ALL 8 SEO SESSIONS (442 MCQs) TO LIVE SERVER (${BASE_URL})`);
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

    // Step 2: Ensure Category Exists and is Enabled
    console.log(`Checking category "${CATEGORY_NAME}" on live server...`);
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const existingCats = catRes.ok ? await catRes.json() : [];
    const seoCat = (Array.isArray(existingCats) ? existingCats : []).find(
        c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase()
    );

    if (!seoCat) {
        console.log(`Creating category "${CATEGORY_NAME}"...`);
        await fetch(`${BASE_URL}/api/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ name: CATEGORY_NAME, isEnabled: true })
        });
        console.log(`✅ Category "${CATEGORY_NAME}" created.\n`);
    } else {
        console.log(`✔ Category "${CATEGORY_NAME}" found (ID: ${seoCat.id}, current questions: ${seoCat.questionCount || 0}).\n`);
    }

    // Step 3: Check and clear old existing questions in SEO category
    console.log('Checking for old unorganized or corrupted questions in category SEO...');
    const existingQRes = await fetch(`${BASE_URL}/api/questions?category=${encodeURIComponent(CATEGORY_NAME)}`);
    const existingQs = existingQRes.ok ? await existingQRes.json() : [];
    console.log(`Found ${existingQs.length} existing question(s) currently in category "${CATEGORY_NAME}".`);

    // Load clean session questions into lookup sets
    const newQuestionsMap = new Map();
    for (let s = 1; s <= 8; s++) {
        const jsonFile = path.resolve(__dirname, `seo_session${s}.json`);
        if (fs.existsSync(jsonFile)) {
            const sData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            newQuestionsMap.set(s, new Set(sData.questions.map(q => q.questionText.trim().toLowerCase())));
        }
    }

    const toDelete = [];
    for (const q of existingQs) {
        const qTextNorm = (q.question_text || q.questionText || '').trim().toLowerCase();
        const qSession = q.session || 1;
        const isClean = newQuestionsMap.has(qSession) && newQuestionsMap.get(qSession).has(qTextNorm);
        if (!isClean) {
            toDelete.push(q);
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} outdated/corrupted question(s)...`);
        const BATCH_SIZE = 8;
        let deletedCount = 0;
        for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
            const batch = toDelete.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async q => {
                const qId = q.id || q._id;
                try {
                    await fetch(`${BASE_URL}/api/questions/${qId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    deletedCount++;
                } catch (e) {
                    console.error('Delete error for', qId, e.message);
                }
            }));
            if (deletedCount % 40 === 0 || deletedCount === toDelete.length) {
                console.log(`  🗑 Deleted ${deletedCount}/${toDelete.length}...`);
            }
            await new Promise(r => setTimeout(r, 50));
        }
        console.log(`✅ Cleanup complete. Deleted ${deletedCount} question(s).\n`);
    } else {
        console.log(`✔ No outdated questions needed removal.\n`);
    }

    // Step 4: Upload Sessions 1 through 8
    let grandTotalUploaded = 0;
    let grandTotalSkipped = 0;
    let grandTotalFailed = 0;

    for (let s = 1; s <= 8; s++) {
        const jsonFile = path.resolve(__dirname, `seo_session${s}.json`);
        if (!fs.existsSync(jsonFile)) {
            console.error(`❌ File missing: ${jsonFile}`);
            continue;
        }

        const sessionData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        const questions = sessionData.questions;

        console.log(`----------------------------------------------------------------`);
        console.log(`📂 Uploading ${sessionData.title} (${questions.length} questions)...`);
        console.log(`----------------------------------------------------------------`);

        // Check already present questions for this session
        const currentSessionRes = await fetch(`${BASE_URL}/api/questions?category=${encodeURIComponent(CATEGORY_NAME)}&session=${s}`);
        const currentSessionQs = currentSessionRes.ok ? await currentSessionRes.json() : [];
        const existingInSession = new Set(
            (Array.isArray(currentSessionQs) ? currentSessionQs : []).map(q => (q.question_text || q.questionText || '').trim().toLowerCase())
        );

        let insertedForSession = 0;
        let skippedForSession = 0;
        let failedForSession = 0;

        const UPLOAD_BATCH_SIZE = 5;
        for (let i = 0; i < questions.length; i += UPLOAD_BATCH_SIZE) {
            const batch = questions.slice(i, i + UPLOAD_BATCH_SIZE);
            await Promise.all(batch.map(async q => {
                const normText = q.questionText.trim().toLowerCase();
                if (existingInSession.has(normText)) {
                    skippedForSession++;
                    grandTotalSkipped++;
                    return;
                }

                try {
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
                        grandTotalUploaded++;
                        existingInSession.add(normText);
                    } else {
                        failedForSession++;
                        grandTotalFailed++;
                        const errText = await postRes.text();
                        console.error(`  ❌ Failed: "${q.questionText.substring(0, 35)}..." - ${errText}`);
                    }
                } catch (err) {
                    failedForSession++;
                    grandTotalFailed++;
                    console.error(`  ❌ Network error: "${q.questionText.substring(0, 35)}..." - ${err.message}`);
                }
            }));

            if (insertedForSession % 15 === 0 || (i + UPLOAD_BATCH_SIZE) >= questions.length) {
                console.log(`  ➕ Progress Session ${s}: ${insertedForSession} uploaded, ${skippedForSession} skipped...`);
            }

            // Polite delay between batches
            await new Promise(r => setTimeout(r, 60));
        }

        console.log(`✔ Session ${s} Completed: ${insertedForSession} added, ${skippedForSession} skipped, ${failedForSession} failed.\n`);
    }

    // Step 5: Final Verification
    console.log('================================================================');
    console.log('  FINAL VERIFICATION');
    console.log('================================================================\n');

    const finalSessionsRes = await fetch(`${BASE_URL}/api/questions/sessions?category=${encodeURIComponent(CATEGORY_NAME)}`);
    const finalSessions = finalSessionsRes.ok ? await finalSessionsRes.json() : [];

    const finalCatsRes = await fetch(`${BASE_URL}/api/categories`);
    const finalCats = finalCatsRes.ok ? await finalCatsRes.json() : [];
    const finalSeo = (Array.isArray(finalCats) ? finalCats : []).find(c => c.name.toLowerCase() === CATEGORY_NAME.toLowerCase());

    console.log(`Total SEO Questions on Server: ${finalSeo ? finalSeo.questionCount : 'unknown'}`);
    console.log(`Available Sessions on Server:`);
    if (Array.isArray(finalSessions)) {
        finalSessions.forEach(sess => {
            console.log(`   - Session ${sess.session}: ${sess.count} questions`);
        });
    }

    console.log('\n================================================================');
    console.log('🎉 SYNC COMPLETE:');
    console.log(`   - Grand Total Uploaded: ${grandTotalUploaded}`);
    console.log(`   - Grand Total Skipped: ${grandTotalSkipped}`);
    console.log(`   - Grand Total Failed: ${grandTotalFailed}`);
    console.log('================================================================\n');
}

syncAllSeoSessions().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
