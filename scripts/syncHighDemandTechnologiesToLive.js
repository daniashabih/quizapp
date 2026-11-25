const {
    HIGH_DEMAND_TECH_NAMES,
    getHighDemandPackName,
    getHighDemandPack
} = require('../api/_models/techQuestions');
const { normalizeQuestionText } = require('../api/_models/questionModel');

function parseTargetCategories() {
    const arg = process.argv.find(a => a.startsWith('--tech='));
    if (!arg) return HIGH_DEMAND_TECH_NAMES;
    const raw = arg.slice('--tech='.length).split(',').map(s => s.trim()).filter(Boolean);
    const resolved = raw.map(r => getHighDemandPackName(r)).filter(Boolean);
    return resolved.length > 0 ? Array.from(new Set(resolved)) : HIGH_DEMAND_TECH_NAMES;
}

async function syncToLive() {
    const BASE_URL = process.env.LIVE_API_URL || 'https://www.hangbug.com';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running sync.');
        process.exit(1);
    }

    const targets = parseTargetCategories();
    console.log('================================================================');
    console.log(`  SYNCING ${targets.length} HIGH-DEMAND TECH PACKS TO ${BASE_URL}`);
    console.log('================================================================\n');

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });

    if (!loginRes.ok) {
        throw new Error(`Admin login failed with status ${loginRes.status}`);
    }
    const { token } = await loginRes.json();
    console.log('✅ Admin authentication successful.\n');

    // Try fast server-side seed-high-demand endpoint first
    const seedRes = await fetch(`${BASE_URL}/api/admin/questions/seed-high-demand`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ categories: targets, onlyEmpty: false })
    });

    if (seedRes.ok) {
        const result = await seedRes.json();
        console.log(`✅ ${result.message}`);
        for (const row of (result.resultsByCategory || [])) {
            console.log(`   - ${row.category}: inserted ${row.inserted}, skipped ${row.skipped}`);
        }
        return;
    }

    console.log('ℹ Falling back to per-question /api/questions sync...');
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const techName of targets) {
        const pack = getHighDemandPack(techName);
        if (!pack.length) continue;

        const existingRes = await fetch(`${BASE_URL}/api/questions?category=${encodeURIComponent(techName)}`);
        const existingList = existingRes.ok ? await existingRes.json() : [];
        const seen = new Set(
            (Array.isArray(existingList) ? existingList : []).map(q =>
                normalizeQuestionText(q.question_text || q.questionText)
            )
        );

        let inserted = 0;
        let skipped = 0;
        for (const q of pack) {
            const key = normalizeQuestionText(q.questionText);
            if (seen.has(key)) {
                skipped++;
                continue;
            }
            const postRes = await fetch(`${BASE_URL}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: techName,
                    session: q.session,
                    session_title: q.sessionTitle,
                    topic: q.topic,
                    difficulty: q.difficulty,
                    question_text: q.questionText,
                    options: q.options,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation
                })
            });
            if (postRes.ok) {
                inserted++;
                seen.add(key);
            } else if (postRes.status === 409) {
                skipped++;
            } else {
                console.warn(`   ⚠ Failed (${postRes.status}) for ${techName}: ${q.questionText.slice(0, 50)}`);
            }
        }
        totalInserted += inserted;
        totalSkipped += skipped;
        console.log(`  ✅ ${techName}: inserted ${inserted}, skipped ${skipped}`);
    }

    console.log(`\n🎉 Sync complete: ${totalInserted} inserted, ${totalSkipped} skipped.`);
}

syncToLive().catch(err => {
    console.error('❌ Live sync failed:', err);
    process.exit(1);
});
