const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'SEO';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "Which of the following is not an aspect of URL optimization?",
        options: [
            "URL naming",
            "URL size",
            "URL structure",
            "URL Length"
        ],
        correctAnswer: "URL size"
    },
    {
        questionText: "_____ analysis should be done regularly to maintain the health of Website",
        options: [
            "Backlink",
            "Domain Authority",
            "No follow links",
            "Do-follow Link"
        ],
        correctAnswer: "Backlink"
    },
    {
        questionText: "______ refers to optimizing a website for search queries from mobile devices",
        options: [
            "Off page SEO",
            "On-page SEO",
            "Mobile SEO",
            "Mobile Sitemap"
        ],
        correctAnswer: "Mobile SEO"
    },
    {
        questionText: "_____ refers to the exact location of a file or Web",
        options: [
            "Protocol",
            "Domain",
            "Path",
            "Link"
        ],
        correctAnswer: "Path"
    },
    {
        questionText: "Which of the following is not a component of search engine?",
        options: [
            "Web Crawler",
            "Compressed Images",
            "Database",
            "Search Interface"
        ],
        correctAnswer: "Compressed Images"
    },
    {
        questionText: "Which of the following is a dominant leader in Internet searches?",
        options: [
            "Bing",
            "Yahoo",
            "Baidu",
            "Google"
        ],
        correctAnswer: "Google"
    },
    {
        questionText: "When was Google first introduced as a search engine?",
        options: [
            "1990",
            "1994",
            "1998",
            "2004"
        ],
        correctAnswer: "1998"
    },
    {
        questionText: "______ refers to the process of getting links from other Websites to one's own site.",
        options: [
            "Content Audit",
            "Link Building",
            "Content Marketing",
            "Indexing"
        ],
        correctAnswer: "Link Building"
    },
    {
        questionText: "______ determines how data is transferred between the host and Web browser.",
        options: [
            "Protocol",
            "Path",
            "Web address",
            "Domain"
        ],
        correctAnswer: "Protocol"
    },
    {
        questionText: "Which of the following is not an Off-page SEO strategy?",
        options: [
            "Content Marketing",
            "Local SEO",
            "Tag Optimization",
            "Influencer Marketing"
        ],
        correctAnswer: "Tag Optimization"
    },
    {
        questionText: "What can you do by placing a $ before a number in a search query with Google?",
        options: [
            "Find exact match",
            "Find hashtags",
            "Search social media",
            "Search for a price"
        ],
        correctAnswer: "Search for a price"
    },
    {
        questionText: "Which do search engines use to rank the results by most relevant to least relevant?",
        options: [
            "Algorithms",
            "Keywords",
            "Social signals",
            "Cookies"
        ],
        correctAnswer: "Algorithms"
    },
    {
        questionText: "What should Sarah do to ensure that her Web pages are read by Google? (multiple correct)",
        options: [
            "Submit Website in Google Search Console",
            "Index Web pages",
            "Understand different search behaviour patterns",
            "Use the right amount of details"
        ],
        correctAnswer: "Submit Website in Google Search Console"
    },
    {
        questionText: "You want to view estimates on the number of searches a keyword gets. Which one of the following tools will you use?",
        options: [
            "Black hat SEO",
            "Keyword Planner",
            "Sitemaps Report",
            "Index Coverage Report"
        ],
        correctAnswer: "Keyword Planner"
    },
    {
        questionText: "Query or search terms given by the users are called",
        options: [
            "Algorithms",
            "Social Signals",
            "Keywords",
            "Small Touch Elements"
        ],
        correctAnswer: "Keywords"
    },
    {
        questionText: "Google provides a tool called ______ to help users with new keywords.",
        options: [
            "Keyword Planner",
            "Grammarly",
            "SEMrush",
            "Trust Flow"
        ],
        correctAnswer: "Keyword Planner"
    },
    {
        questionText: "SEO is unethical and is created against search engine guidelines",
        options: [
            "Mobile",
            "White Hat",
            "Black Hat",
            "Gray Hat"
        ],
        correctAnswer: "Black Hat"
    }
];

async function seed() {
    console.log('================================================================');
    console.log(`  UPLOADING ${questions.length} MCQS TO: "${CATEGORY_NAME}" (Session ${SESSION_NUMBER})`);
    console.log('================================================================\n');

    try {
        // Step 1: Ensure Category Exists or Reuse Existing
        let category = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: CATEGORY_NAME, mode: 'insensitive' } },
                    { name: { equals: 'Search Engine Optimization', mode: 'insensitive' } }
                ]
            }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME }
            });
            console.log(`✅ Created Category: "${category.name}" (ID: ${category.id})`);
        } else {
            console.log(`✔ Category already exists: "${category.name}" (ID: ${category.id}) - skipped creation.`);
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
        console.log(`   - Category: "${effectiveCategoryName}"`);
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
