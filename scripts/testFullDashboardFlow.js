const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');
const Result = require('../api/_models/resultModel');
const {
    getUserDashboard,
    getAdminDashboard,
    getLeaderboard,
    getMyCertificates
} = require('../api/_controllers/dashboardController');

async function testFullFlow() {
    console.log('====================================================');
    console.log('        FULL DASHBOARD INTEGRATION TEST             ');
    console.log('====================================================\n');

    // 1. Get a test user
    const testUser = await prisma.user.findFirst();
    if (!testUser) throw new Error('No user found in MongoDB');
    console.log(`👤 Using user: ${testUser.name} (${testUser.id})`);

    const createMockRes = (setter) => ({
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            setter(data);
            return this;
        }
    });

    // 2. Fetch User Dashboard Before Quiz
    let userDashBefore = null;
    await getUserDashboard({ user: { id: testUser.id } }, createMockRes(d => { userDashBefore = d; }));
    console.log(`📊 Total Quizzes Before: ${userDashBefore.data.stats.totalQuizzes}, Certs: ${userDashBefore.data.stats.certificates}`);

    // 3. Save a real quiz attempt in MongoDB (JavaScript, 90% score, beginner)
    console.log('\n📝 Simulating Quiz Completion: JavaScript - 9/10 (90%) - Expert...');
    const resultId = await Result.create(testUser.id, 'JavaScript', 9, 10, 90, 'expert');
    console.log(`✅ Saved Quiz Result ID: ${resultId}`);

    // 4. Fetch User Dashboard After Quiz
    let userDashAfter = null;
    await getUserDashboard({ user: { id: testUser.id } }, createMockRes(d => { userDashAfter = d; }));
    console.log('\n📊 --- User Dashboard After Quiz ---');
    console.log('Stats:', userDashAfter.data.stats);
    console.log('Recent Attempts:', userDashAfter.data.recentAttempts);
    console.log('Technology Progress:', userDashAfter.data.technologyProgress);
    console.log('Certificates Earned:', userDashAfter.data.certificates);
    console.log('Unlocked Achievements:', userDashAfter.data.achievements.filter(a => a.earned).map(a => a.label));

    // Verify expectations
    if (userDashAfter.data.stats.totalQuizzes !== userDashBefore.data.stats.totalQuizzes + 1) {
        throw new Error('Total quizzes did not increment!');
    }
    if (userDashAfter.data.stats.certificates !== userDashBefore.data.stats.certificates + 1) {
        throw new Error('Certificates did not increment for 90% score!');
    }
    console.log('✅ User Dashboard successfully updated with real quiz data!');

    // 5. Fetch Admin Dashboard After Quiz
    let adminDash = null;
    await getAdminDashboard({ query: { period: '30d' } }, createMockRes(d => { adminDash = d; }));
    console.log('\n🛡️ --- Admin Dashboard After Quiz ---');
    console.log('Admin Stats:', adminDash.data.stats);
    console.log('Popular Technologies:', adminDash.data.popularTechnologies);
    console.log('Recent Attempts Count:', adminDash.data.recentAttempts.length);
    console.log('Recent Attempt in Admin:', adminDash.data.recentAttempts[0]);
    if (adminDash.data.stats.totalAttempts < 1) {
        throw new Error('Admin total attempts did not reflect new attempt!');
    }
    console.log('✅ Admin Dashboard successfully aggregated new attempt!');

    // 6. Fetch Leaderboard
    let leadData = null;
    await getLeaderboard({ query: { timeframe: 'all-time', category: 'All' } }, createMockRes(d => { leadData = d; }));
    console.log('\n🏆 --- Leaderboard ---');
    console.log('Total Ranked Users:', leadData.totalRanked);
    console.log('Rank #1 User:', leadData.leaderboard[0]);
    if (leadData.leaderboard[0].id !== testUser.id || leadData.leaderboard[0].xp < 1000) {
        throw new Error('Leaderboard rank #1 user not reflecting test user XP!');
    }
    console.log('✅ Leaderboard successfully ranked user at top based on real XP!');

    // 7. Fetch Certificates
    let certsData = null;
    await getMyCertificates({ user: { id: testUser.id } }, createMockRes(d => { certsData = d; }));
    console.log('\n📜 --- Certificates ---');
    console.log('Certificates Count:', certsData.certificates.length);
    console.log('Certificate Detail:', certsData.certificates[0]);
    if (certsData.certificates.length < 1) {
        throw new Error('Certificate not found in getMyCertificates!');
    }
    console.log('✅ Certificate successfully retrieved!');

    // 8. Clean up test quiz result from MongoDB
    console.log('\n🧹 Cleaning up test quiz result...');
    await prisma.quizResult.delete({ where: { id: resultId } });
    console.log('✅ Test quiz result deleted.');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED 100%!');
    process.exit(0);
}

testFullFlow().catch(err => {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
});
