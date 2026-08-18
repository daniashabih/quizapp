const bcrypt = require('bcryptjs');
const prisma = require('../api/_config/prisma');

async function seedAdmin() {
    try {
        console.log('Seeding default users into database...');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'AdminPassword123!';
        const adminName = 'System Admin';

        const userEmail = 'user@example.com';
        const userPassword = 'password';
        const userName = 'Demo Candidate';

        const salt = await bcrypt.genSalt(10);
        const hashedAdminPass = await bcrypt.hash(adminPassword, salt);
        const hashedUserPass = await bcrypt.hash(userPassword, salt);

        // Seed Admin User
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
        let adminId;
        if (existingAdmin) {
            const updated = await prisma.user.update({
                where: { email: adminEmail },
                data: { name: adminName, password: hashedAdminPass, role: 'admin' }
            });
            adminId = updated.id;
            console.log(`✅ Admin user updated in database (ID: ${adminId})`);
        } else {
            const created = await prisma.user.create({
                data: { name: adminName, email: adminEmail, password: hashedAdminPass, role: 'admin' }
            });
            adminId = created.id;
            console.log(`✅ Admin user created in database (ID: ${adminId})`);
        }

        // Seed Demo Candidate User
        const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
        let userId;
        if (existingUser) {
            const updated = await prisma.user.update({
                where: { email: userEmail },
                data: { name: userName, password: hashedUserPass, role: 'candidate' }
            });
            userId = updated.id;
            console.log(`✅ Demo candidate updated in database (ID: ${userId})`);
        } else {
            const created = await prisma.user.create({
                data: { name: userName, email: userEmail, password: hashedUserPass, role: 'candidate' }
            });
            userId = created.id;
            console.log(`✅ Demo candidate created in database (ID: ${userId})`);
        }

        console.log('\n=============================================');
        console.log('       DEFAULT CREDENTIALS CONFIGURED          ');
        console.log('=============================================');
        console.log(` Admin:     ${adminEmail} (Pass: ${adminPassword}, ID: ${adminId})`);
        console.log(` Candidate: ${userEmail} (Pass: ${userPassword}, ID: ${userId})`);
        console.log('=============================================\n');

    } catch (error) {
        console.error('❌ Failed to seed default users:', error);
        process.exit(1);
    }
}

seedAdmin();
