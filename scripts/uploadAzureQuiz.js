const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'Azure';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "_______ can be used as a means for automating the deployment process of .NET applications.",
        options: [
            "Containers",
            "Windows Containers",
            "Program Containers",
            "XML Containers"
        ],
        correctAnswer: "Windows Containers"
    },
    {
        questionText: "_______ was the first framework to be included with WCF.",
        options: [
            ".NET Framework 3.0",
            ".NET Framework 2.0",
            "ASP.NET Web API",
            "XML Web Framework"
        ],
        correctAnswer: ".NET Framework 3.0"
    },
    {
        questionText: "Each endpoint consists of ___ properties.",
        options: [
            "Three",
            "One",
            "Four",
            "Six"
        ],
        correctAnswer: "Four"
    },
    {
        questionText: "Which HTTP request header specifies the period in seconds for which the server has to use the identical connection for HTTP communication?",
        options: [
            "Host",
            "Accept",
            "Connection",
            "Keep Alive"
        ],
        correctAnswer: "Keep Alive"
    },
    {
        questionText: "The _______ request header specifies the content type, also known as Multipurpose Internet Mail Extensions (MIME) type that the request expects as response.",
        options: [
            "Accept",
            "Host",
            "Connection",
            "Keep-Alive"
        ],
        correctAnswer: "Accept"
    },
    {
        questionText: "Which of the following represents HTTPClient class methods?",
        options: [
            "GetAsync PostAsync PutAsync DeleteAsync",
            "GetAsync PublicAsync PutAsync DeleteAsync",
            "GetAsync PublicAsync PutAsync EnterAsync",
            "SetAsync PublicAsync PutAsync EnterAsync"
        ],
        correctAnswer: "GetAsync PostAsync PutAsync DeleteAsync"
    },
    {
        questionText: "Match the Http requests against their descriptions:\n\nAnswer Descriptions:\n1) Requests the server to delete a resource.\n2) Requests the server that the target resource should process the data contained in the request.\n3) Requests the server to retrieve a resource.\n4) Requests the server to create or update a request.\n\nSub-Questions:\na) Get\nb) Put\nc) Post\nd) Delete",
        options: [
            "a-3, b-4, c-2, d-1",
            "a-3, b-2, c-4, d-1",
            "a-1, b-4, c-2, d-3",
            "a-4, b-3, c-1, d-2"
        ],
        correctAnswer: "a-3, b-4, c-2, d-1"
    },
    {
        questionText: "Which of the following Azure App Service supports integrating with SaaS and enterprise applications?",
        options: [
            "Azure Logic Apps",
            "API Apps",
            "Web Apps",
            "Mobile Apps"
        ],
        correctAnswer: "Azure Logic Apps"
    },
    {
        questionText: "Which method of routing is used in ASP.NET MVC for selection of an action?",
        options: [
            "HTTP",
            "URI",
            "EGP",
            "BGP"
        ],
        correctAnswer: "URI"
    },
    {
        questionText: "Advanced Settings, such as debugging and remote debugging are also available under _______",
        options: [
            "Web Settings",
            "Client",
            "Website",
            "AppSettings"
        ],
        correctAnswer: "Web Settings"
    },
    {
        questionText: "ASP.NET Web API refers to a framework that allows producing _______ services easily.",
        options: [
            "HTTP",
            "HTML",
            "XML",
            "Java"
        ],
        correctAnswer: "HTTP"
    },
    {
        questionText: "Which key can be used to enable or disable Parameter descriptions?",
        options: [
            "Ctrl",
            "Alt",
            "F1",
            "F5"
        ],
        correctAnswer: "F1"
    },
    {
        questionText: "Identify the best practices that can be determined with Microsoft Azure Identity and authentication:\nA. Centralized enterprise directory\nB. Block legacy authentication\nC. Signature updates\nD. Modern password protection",
        options: [
            "A, B, and C",
            "B, C, and D",
            "A, B, and D",
            "A, C, and D"
        ],
        correctAnswer: "A, B, and D"
    }
];

async function seed() {
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO: "${CATEGORY_NAME}" (Session ${SESSION_NUMBER})`);
    console.log('================================================================\n');

    try {
        // Step 1: Ensure Category Exists
        let category = await prisma.category.findFirst({
            where: {
                name: { equals: CATEGORY_NAME, mode: 'insensitive' }
            }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME }
            });
            console.log(`✅ Created Category: "${category.name}" (ID: ${category.id})`);
        } else {
            console.log(`✔ Found Category: "${category.name}" (ID: ${category.id})`);
        }

        const effectiveCategoryName = category.name;

        // Step 2: Insert / Upsert Questions
        let inserted = 0;
        let updated = 0;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const existing = await prisma.question.findFirst({
                where: {
                    category: effectiveCategoryName,
                    session: SESSION_NUMBER,
                    questionText: q.questionText
                }
            });

            if (!existing) {
                await prisma.question.create({
                    data: {
                        category: effectiveCategoryName,
                        session: SESSION_NUMBER,
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] ➕ Inserted: "${q.questionText.substring(0, 50)}..."`);
                inserted++;
            } else {
                await prisma.question.update({
                    where: { id: existing.id },
                    data: {
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        session: SESSION_NUMBER
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] 🔄 Updated: "${q.questionText.substring(0, 50)}..."`);
                updated++;
            }
        }

        const totalCount = await prisma.question.count({
            where: {
                category: effectiveCategoryName,
                session: SESSION_NUMBER
            }
        });

        console.log('\n================================================================');
        console.log(`🎉 COMPLETED:`);
        console.log(`   - Track: "${effectiveCategoryName}"`);
        console.log(`   - Session: ${SESSION_NUMBER}`);
        console.log(`   - Newly Inserted: ${inserted}`);
        console.log(`   - Updated Existing: ${updated}`);
        console.log(`   - Total Session ${SESSION_NUMBER} Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
