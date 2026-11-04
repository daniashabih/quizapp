const fs = require('fs');
const path = require('path');

async function mergeAllSeoToSelfAssessment() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    console.log('================================================================');
    console.log('  MERGING ALL SEO QUESTIONS INTO ONE SINGLE "SELF ASSESSMENT"');
    console.log(`  Target Server: ${BASE_URL}`);
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

    // Step 2: Fetch All Sessions for SEO
    console.log('Checking existing SEO sessions on live server...');
    const sessionsRes = await fetch(`${BASE_URL}/api/questions/sessions?category=SEO`);
    const initialSessions = sessionsRes.ok ? await sessionsRes.json() : [];
    console.log('Initial SEO sessions:', initialSessions);

    // Step 3: Fetch Questions in Session 2 (and any other sessions > 1)
    const otherSessions = (Array.isArray(initialSessions) ? initialSessions : []).filter(s => s.session !== 1);
    let totalMoved = 0;

    for (const s of otherSessions) {
        console.log(`\nFetching questions from SEO Session ${s.session} (${s.count} questions)...`);
        const qRes = await fetch(`${BASE_URL}/api/questions?category=SEO&session=${s.session}`);
        if (!qRes.ok) {
            console.error(`Failed to fetch questions for session ${s.session}`);
            continue;
        }

        const questions = await qRes.json();
        console.log(`Moving ${questions.length} questions from Session ${s.session} -> Session 1 (Self Assessment)...`);

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qId = q.id || q._id;
            const qText = q.question_text || q.questionText || '';

            const updateRes = await fetch(`${BASE_URL}/api/questions/${qId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    category: 'SEO',
                    session: 1,
                    question_text: qText,
                    options: q.options,
                    correct_answer: q.correct_answer || q.correctAnswer
                })
            });

            if (updateRes.ok) {
                totalMoved++;
                if (totalMoved % 10 === 0 || totalMoved === questions.length) {
                    console.log(`  [${i + 1}/${questions.length}] 🔄 Moved: "${qText.substring(0, 45)}..." to Self Assessment`);
                }
            } else {
                console.warn(`  [${i + 1}/${questions.length}] ❌ Failed to update question ${qId}: ${updateRes.status}`);
            }

            // Polite delay
            await new Promise(r => setTimeout(r, 40));
        }
    }

    // Step 4: Verify Final State
    const finalSessionsRes = await fetch(`${BASE_URL}/api/questions/sessions?category=SEO`);
    const finalSessions = finalSessionsRes.ok ? await finalSessionsRes.json() : [];

    const finalQuestionsRes = await fetch(`${BASE_URL}/api/questions?category=SEO&session=1`);
    const finalQuestions = finalQuestionsRes.ok ? await finalQuestionsRes.json() : [];

    console.log('\n================================================================');
    console.log('🎉 MERGE COMPLETE:');
    console.log(`   - Total Questions Moved to Self Assessment: ${totalMoved}`);
    console.log(`   - Final Available Sessions on Server:`, finalSessions);
    console.log(`   - Total Questions in "Self Assessment" (Session 1): ${finalQuestions.length}`);
    console.log('================================================================\n');

    // Step 5: Save Combined Local Files
    console.log('Updating local seo_self_assessment.json and csv with all 189 questions...');
    const combinedData = {
        category: "SEO",
        session: 1,
        title: "SEO Self Assessment",
        totalQuestions: finalQuestions.length,
        questions: finalQuestions.map(q => ({
            questionText: q.question_text || q.questionText,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctAnswer: q.correct_answer || q.correctAnswer
        }))
    };

    fs.writeFileSync(
        path.resolve(__dirname, 'seo_self_assessment.json'),
        JSON.stringify(combinedData, null, 2),
        'utf8'
    );

    // CSV format
    const csvRows = ['category,session,question_text,option1,option2,option3,option4,correct_answer'];
    for (const q of combinedData.questions) {
        const escapeCsv = (str) => {
            const s = String(str || '').replace(/"/g, '""');
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
        };
        const opt = q.options || [];
        csvRows.push([
            'SEO',
            1,
            escapeCsv(q.questionText),
            escapeCsv(opt[0] || ''),
            escapeCsv(opt[1] || ''),
            escapeCsv(opt[2] || ''),
            escapeCsv(opt[3] || ''),
            escapeCsv(q.correctAnswer)
        ].join(','));
    }

    fs.writeFileSync(
        path.resolve(__dirname, 'seo_self_assessment.csv'),
        csvRows.join('\n'),
        'utf8'
    );

    console.log('✅ Local files updated successfully.');
}

mergeAllSeoToSelfAssessment().catch(err => {
    console.error('Fatal error during merge:', err);
    process.exit(1);
});
