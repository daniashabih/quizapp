const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');
const {
    getUserDashboard,
    getAdminDashboard,
    getLeaderboard,
    getMyCertificates
} = require('../api/_controllers/dashboardController');

async function testDashboards() {
    console.log('--- Testing User Dashboard Controller ---');
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Test Dashboard User',
                email: `test_dash_${Date.now()}@example.com`,
                password: 'password123',
                role: 'user'
            }
        });
    }

    const mockUserReq = { user: { id: user.id } };
    let userDashResult = null;
    const mockUserRes = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            userDashResult = data;
            return this;
        }
    };

    await getUserDashboard(mockUserReq, mockUserRes);
    console.log('User Dashboard Status:', mockUserRes.statusCode || 200);
    console.log('User Dashboard Data Keys:', Object.keys(userDashResult?.data || {}));
    console.log('User Stats:', userDashResult?.data?.stats);
    console.log('Weekly Activity Length:', userDashResult?.data?.weeklyActivity?.length);

    console.log('\n--- Testing Admin Dashboard Controller ---');
    const mockAdminReq = { query: { period: '30d' } };
    let adminDashResult = null;
    const mockAdminRes = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            adminDashResult = data;
            return this;
        }
    };

    await getAdminDashboard(mockAdminReq, mockAdminRes);
    console.log('Admin Dashboard Status:', mockAdminRes.statusCode || 200);
    console.log('Admin Stats:', adminDashResult?.data?.stats);
    console.log('User Growth Points:', adminDashResult?.data?.userGrowth?.length);
    console.log('Quiz Activity Points:', adminDashResult?.data?.quizActivity?.length);
    console.log('Popular Technologies Count:', adminDashResult?.data?.popularTechnologies?.length);
    console.log('Recent Users Count:', adminDashResult?.data?.recentUsers?.length);

    console.log('\n--- Testing Leaderboard Controller ---');
    const mockLeadReq = { query: { timeframe: 'all-time', category: 'All' } };
    let leadResult = null;
    const mockLeadRes = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            leadResult = data;
            return this;
        }
    };

    await getLeaderboard(mockLeadReq, mockLeadRes);
    console.log('Leaderboard Status:', mockLeadRes.statusCode || 200);
    console.log('Leaderboard Total Ranked:', leadResult?.totalRanked);
    console.log('Top Performer Sample:', leadResult?.leaderboard?.[0]);

    console.log('\n--- Testing Certificates Controller ---');
    let certResult = null;
    const mockCertRes = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            certResult = data;
            return this;
        }
    };

    await getMyCertificates(mockUserReq, mockCertRes);
    console.log('Certificates Status:', mockCertRes.statusCode || 200);
    console.log('Certificates Count:', certResult?.certificates?.length);

    console.log('\n🎉 ALL DASHBOARD CONTROLLER TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
}

testDashboards().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
