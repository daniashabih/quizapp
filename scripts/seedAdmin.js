const bcrypt = require('bcryptjs');
const prisma = require('../api/_config/prisma');

async function seedAdmin() {
    try {
        console.log('Seeding admin user into database...');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'AdminPassword123!';
        const adminName = 'System Admin';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Check if admin user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            // Update existing user to admin role and set password
            const updated = await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    name: adminName,
                    password: hashedPassword,
                    role: 'admin'
                }
            });
            console.log(`✅ Admin user updated in database (ID: ${updated.id})`);
        } else {
            // Create new admin user
            const created = await prisma.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin'
                }
            });
            console.log(`✅ Admin user created in database (ID: ${created.id})`);
        }

        console.log('\n=============================================');
        console.log('       ADMIN CREDENTIALS CONFIGURED           ');
        console.log('=============================================');
        console.log(` Email:    ${adminEmail}`);
        console.log(` Password: ${adminPassword}`);
        console.log(` Role:     admin`);
        console.log('=============================================\n');

    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
        process.exit(1);
    }
}

seedAdmin();
