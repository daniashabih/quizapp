const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const CATEGORY_NAME = 'Power BI';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "Which language is used to create measures and calculated columns in Power BI?",
        options: [
            "M",
            "DAX",
            "SQL",
            "Python"
        ],
        correctAnswer: "DAX"
    },
    {
        questionText: "Which tool is used to clean and transform data before loading it into the model?",
        options: [
            "Power Query Editor",
            "Model view",
            "Report view",
            "Q&A visual"
        ],
        correctAnswer: "Power Query Editor"
    },
    {
        questionText: "What is the file extension of a Power BI Desktop report?",
        options: [
            ".pbit",
            ".xlsx",
            ".pbix",
            ".pbids"
        ],
        correctAnswer: ".pbix"
    },
    {
        questionText: "Which view in Power BI Desktop is used to create and manage relationships between tables?",
        options: [
            "Report view",
            "Data view",
            "Table view",
            "Model view"
        ],
        correctAnswer: "Model view"
    },
    {
        questionText: "Which language is used by Power Query to define transformation steps?",
        options: [
            "M",
            "DAX",
            "VBA",
            "MDX"
        ],
        correctAnswer: "M"
    },
    {
        questionText: "Which DAX function changes the filter context of a calculation?",
        options: [
            "SUMX",
            "CALCULATE",
            "RELATED",
            "FORMAT"
        ],
        correctAnswer: "CALCULATE"
    },
    {
        questionText: "What is the most common relationship cardinality in a Power BI data model?",
        options: [
            "One-to-many",
            "Many-to-many",
            "One-to-one",
            "Many-to-none"
        ],
        correctAnswer: "One-to-many"
    },
    {
        questionText: "Which DAX function returns the number of unique values in a column?",
        options: [
            "COUNT",
            "COUNTROWS",
            "DISTINCTCOUNT",
            "COUNTA"
        ],
        correctAnswer: "DISTINCTCOUNT"
    },
    {
        questionText: "Which storage mode loads a copy of the data into the Power BI in-memory model?",
        options: [
            "DirectQuery",
            "Live Connection",
            "Composite",
            "Import"
        ],
        correctAnswer: "Import"
    },
    {
        questionText: "Which visual is best for showing a trend over time?",
        options: [
            "Line chart",
            "Treemap",
            "Card",
            "Slicer"
        ],
        correctAnswer: "Line chart"
    },
    {
        questionText: "What is the main purpose of a slicer?",
        options: [
            "Create relationships",
            "Filter other visuals interactively",
            "Refresh data",
            "Publish reports"
        ],
        correctAnswer: "Filter other visuals interactively"
    },
    {
        questionText: "Which schema design is recommended for Power BI data models?",
        options: [
            "Flat single table only",
            "Snowflake with many levels",
            "Star schema",
            "Network schema"
        ],
        correctAnswer: "Star schema"
    },
    {
        questionText: "What does Row-Level Security (RLS) do?",
        options: [
            "Speeds up refresh",
            "Restricts data access for users based on roles",
            "Encrypts the .pbix file",
            "Limits the number of rows imported"
        ],
        correctAnswer: "Restricts data access for users based on roles"
    },
    {
        questionText: "Which component is needed to refresh on-premises data sources in the Power BI Service?",
        options: [
            "Power BI Mobile",
            "On-premises data gateway",
            "Power BI Report Builder",
            "Dataflow"
        ],
        correctAnswer: "On-premises data gateway"
    },
    {
        questionText: "What is a Power BI dashboard?",
        options: [
            "A multi-page report",
            "A single page of pinned visuals from one or more reports",
            "A Power Query script",
            "A data model"
        ],
        correctAnswer: "A single page of pinned visuals from one or more reports"
    },
    {
        questionText: "Which visual lets users ask questions in natural language?",
        options: [
            "Key influencers",
            "Decomposition tree",
            "Q&A",
            "Smart narrative"
        ],
        correctAnswer: "Q&A"
    },
    {
        questionText: "Where do teams collaborate on reports, dashboards and datasets in the Power BI Service?",
        options: [
            "Workspace",
            "Gateway",
            "Slicer",
            "Bookmark"
        ],
        correctAnswer: "Workspace"
    },
    {
        questionText: "How does a measure differ from a calculated column?",
        options: [
            "A measure is stored per row; a column is not",
            "A measure is calculated at query time; a column is computed at refresh and stored",
            "They are identical",
            "A measure can only use M"
        ],
        correctAnswer: "A measure is calculated at query time; a column is computed at refresh and stored"
    },
    {
        questionText: "Which DAX function retrieves a value from a related table on the 'one' side of a relationship?",
        options: [
            "RELATED",
            "LOOKUPVALUE only",
            "VALUES",
            "ALL"
        ],
        correctAnswer: "RELATED"
    },
    {
        questionText: "Which feature saves a specific state of a report page, including filters and visibility?",
        options: [
            "Bookmarks",
            "Themes",
            "Tooltips",
            "Parameters"
        ],
        correctAnswer: "Bookmarks"
    }
];

async function seed() {
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO: "${CATEGORY_NAME}" (Session ${SESSION_NUMBER})`);
    console.log('================================================================\n');

    let prisma;
    try {
        prisma = require('../api/_config/prisma');

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
        if (prisma) {
            await prisma.$disconnect();
        }
    }
}

if (require.main === module) {
    seed();
}

module.exports = { questions, CATEGORY_NAME, SESSION_NUMBER, seed };
