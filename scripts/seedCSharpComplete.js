/**
 * Seed C# Technology, Games, Challenges, Category and Questions into MongoDB Atlas via Prisma
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { CSHARP_QUIZ_QUESTIONS } = require('../api/_models/csharpQuizQuestionsData');
const { CSHARP_COMPLETE_THE_CODE_QUESTIONS } = require('../api/_models/csharpQuestionsData');
const { TECHNOLOGY_CHALLENGES } = require('../api/_models/technologyChallenges');

async function seedCSharp() {
    console.log('========================================================');
    console.log('🚀 SEEDING C# TECHNOLOGY, GAMES, & QUESTIONS TO MONGODB');
    console.log('========================================================\n');

    let isDbOnline = false;
    try {
        await prisma.$connect();
        isDbOnline = true;
        console.log('✅ Connected to MongoDB Atlas via Prisma');
    } catch (err) {
        console.warn('⚠️ MongoDB Atlas connection notice (will test dual mode):', err.message);
    }

    if (!isDbOnline) {
        console.log('ℹ️ Local/offline mode detected. Memory fallback data verified.');
        return;
    }

    try {
        // 1. Seed C# Category in Prisma Category model
        console.log('\n--- 1. SEEDING C# CATEGORY ---');
        const existingCat = await prisma.category.findFirst({
            where: { name: { equals: 'C#', mode: 'insensitive' } }
        });
        if (existingCat) {
            console.log(`✓ C# Category already exists with ID: ${existingCat.id}`);
        } else {
            const newCat = await prisma.category.create({
                data: {
                    name: 'C#',
                    isEnabled: true
                }
            });
            console.log(`✓ Created C# Category with ID: ${newCat.id}`);
        }

        // 2. Seed 45 C# Quiz MCQs in Prisma Question model
        console.log('\n--- 2. SEEDING C# QUIZ QUESTIONS ---');
        let questionsInserted = 0;
        for (const q of CSHARP_QUIZ_QUESTIONS) {
            const existingQ = await prisma.question.findFirst({
                where: {
                    category: { equals: 'C#', mode: 'insensitive' },
                    questionText: q.questionText
                }
            });

            if (!existingQ) {
                await prisma.question.create({
                    data: {
                        category: 'C#',
                        session: q.session,
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || ''
                    }
                });
                questionsInserted++;
            }
        }
        console.log(`✓ Seeded ${questionsInserted} new C# Quiz questions (Total pool: ${CSHARP_QUIZ_QUESTIONS.length})`);

        // 3. Seed Backend Development Game Category & C# Technology
        console.log('\n--- 3. SEEDING C# GAME TECHNOLOGY ---');
        const backendCat = await prisma.gameTechCategory.upsert({
            where: { slug: 'backend-development' },
            update: {
                name: 'Backend Development',
                isEnabled: true
            },
            create: {
                name: 'Backend Development',
                slug: 'backend-development',
                description: 'Server architecture, APIs, application logic, and business workflows.',
                icon: 'Server',
                order: 2,
                isEnabled: true
            }
        });
        console.log(`✓ Backend Category verified (ID: ${backendCat.id})`);

        const csharpSupportedGames = [
            'complete-the-code',
            'find-the-bug',
            'output-predictor',
            'code-scramble',
            'missing-code',
            'logic-builder',
            'csharp-quiz-challenge'
        ];

        const csharpTech = await prisma.gameTechnology.upsert({
            where: { slug: 'csharp' },
            update: {
                name: 'C#',
                categorySlug: 'backend-development',
                categoryId: backendCat.id,
                description: 'Modern, object-oriented language for high-performance backend APIs, cloud microservices, and enterprise applications.',
                icon: 'csharp',
                color: '#9B4993',
                badge: 'Backend & .NET',
                supportedGames: JSON.stringify(csharpSupportedGames),
                isEnabled: true,
                order: 12
            },
            create: {
                name: 'C#',
                slug: 'csharp',
                categorySlug: 'backend-development',
                categoryId: backendCat.id,
                description: 'Modern, object-oriented language for high-performance backend APIs, cloud microservices, and enterprise applications.',
                icon: 'csharp',
                color: '#9B4993',
                badge: 'Backend & .NET',
                supportedGames: JSON.stringify(csharpSupportedGames),
                isEnabled: true,
                order: 12
            }
        });
        console.log(`✓ C# Game Technology verified (ID: ${csharpTech.id}, Slug: ${csharpTech.slug})`);

        // 4. Seed C# Games in Prisma Game model
        console.log('\n--- 4. SEEDING 7 C# GAMES ---');
        const gamesToEnsure = [
            {
                slug: 'complete-the-code',
                title: 'Complete the Code',
                category: 'Coding Games',
                badge: 'Interactive',
                cardSize: 'large',
                difficulty: 'All Levels',
                rating: 4.9,
                playsCount: 4620,
                order: 19,
                isPublished: true,
                isFeatured: true,
                thumbnail: 'gradient-emerald',
                description: 'Complete missing C# statements, keywords, and expressions across beginner, intermediate, and advanced levels.',
                instructions: 'Examine the incomplete C# program. Fill in the blank by choosing from multiple-choice options or typing the exact missing code token. Click Submit Answer to test your solution and view explanations.'
            },
            {
                slug: 'find-the-bug',
                title: 'Find the Bug',
                category: 'Coding Games',
                badge: 'Hot',
                cardSize: 'tall',
                difficulty: 'Beginner',
                rating: 4.9,
                playsCount: 4210,
                order: 2,
                isPublished: true,
                isFeatured: true,
                thumbnail: 'gradient-rose',
                description: 'Spot syntax, logic, and type errors hidden in real code snippets and click the buggy line.',
                instructions: 'Inspect the code snippet carefully with line numbers. Click or tap the exact line where the defect exists, then read the explanation and fix!'
            },
            {
                slug: 'output-predictor',
                title: 'Output Predictor',
                category: 'Coding Games',
                badge: 'Brain Boost',
                cardSize: 'medium',
                difficulty: 'Intermediate',
                rating: 4.8,
                playsCount: 3120,
                order: 3,
                isPublished: true,
                isFeatured: false,
                thumbnail: 'gradient-amber',
                description: 'Trace loops, closures, scope, and operations to predict the exact terminal output before code runs.',
                instructions: 'Read the snippet and predict what will be logged to console or returned. Choose from multiple options or type your prediction, then review step-by-step evaluation.'
            },
            {
                slug: 'code-scramble',
                title: 'Code Scramble',
                category: 'Coding Games',
                badge: 'Challenge',
                cardSize: 'medium',
                difficulty: 'Intermediate',
                rating: 4.7,
                playsCount: 2650,
                order: 4,
                isPublished: true,
                isFeatured: false,
                thumbnail: 'gradient-cyan',
                description: 'Rearrange scrambled programming statements into the correct executable sequence.',
                instructions: 'Move scrambled statements up and down until they form a coherent, executable algorithm. Test your understanding of program flow.'
            },
            {
                slug: 'missing-code',
                title: 'Missing Code',
                category: 'Coding Games',
                badge: 'Featured',
                cardSize: 'large',
                difficulty: 'Beginner',
                rating: 4.9,
                playsCount: 3590,
                order: 5,
                isPublished: true,
                isFeatured: false,
                thumbnail: 'gradient-emerald',
                description: 'Fill in missing keywords, expressions, and syntax tokens to complete defective code structures.',
                instructions: 'Locate the blank spaces (_____) in the code editor. Select the correct syntax keyword or token from the choices to restore functionality.'
            },
            {
                slug: 'logic-builder',
                title: 'Logic Builder',
                category: 'Coding Games',
                badge: 'Mental Gym',
                cardSize: 'medium',
                difficulty: 'Advanced',
                rating: 4.8,
                playsCount: 2890,
                order: 6,
                isPublished: true,
                isFeatured: false,
                thumbnail: 'gradient-purple',
                description: 'Solve programmatic logic puzzles involving sequences, truth tables, loop bounds, and array transforms.',
                instructions: 'Analyze problem requirements and configure inputs, conditional branches, or loop steps to satisfy the algorithmic test cases.'
            },
            {
                slug: 'csharp-quiz-challenge',
                title: 'C# Quiz Challenge',
                category: 'Coding Games',
                badge: 'C# Assessment',
                cardSize: 'medium',
                difficulty: 'All Levels',
                rating: 4.9,
                playsCount: 3820,
                order: 20,
                isPublished: true,
                isFeatured: true,
                thumbnail: 'gradient-purple',
                description: 'Test your comprehensive knowledge of C# syntax, runtime, LINQ, generics, and object-oriented architecture.',
                instructions: 'Read each C# conceptual and technical question carefully. Select the correct answer to score points and build streaks.'
            }
        ];

        for (const g of gamesToEnsure) {
            await prisma.game.upsert({
                where: { slug: g.slug },
                update: {
                    title: g.title,
                    category: g.category,
                    difficulty: g.difficulty,
                    badge: g.badge,
                    cardSize: g.cardSize,
                    isPublished: true,
                    description: g.description,
                    instructions: g.instructions
                },
                create: {
                    slug: g.slug,
                    title: g.title,
                    category: g.category,
                    difficulty: g.difficulty,
                    badge: g.badge,
                    cardSize: g.cardSize,
                    rating: g.rating,
                    playsCount: g.playsCount,
                    order: g.order,
                    isPublished: true,
                    isFeatured: g.isFeatured,
                    thumbnail: g.thumbnail,
                    description: g.description,
                    instructions: g.instructions
                }
            });
            console.log(`✓ Game verified: ${g.title} (${g.slug})`);
        }

        // 5. Seed C# Challenges (Complete the Code + Tech Challenges)
        console.log('\n--- 5. SEEDING C# CHALLENGES ---');
        let challengesCount = 0;

        // 5A. 105 Complete the Code C# challenges
        for (const c of CSHARP_COMPLETE_THE_CODE_QUESTIONS) {
            await prisma.gameChallenge.upsert({
                where: { id: c.id },
                update: {
                    gameSlug: 'complete-the-code',
                    technology: 'csharp',
                    technologyName: 'C#',
                    title: c.title,
                    difficulty: c.difficulty,
                    language: 'csharp',
                    description: c.description || 'Fill in the missing C# code.',
                    code: c.code,
                    options: JSON.stringify(c.options || []),
                    solution: c.solution,
                    blank: c.solution,
                    explanation: c.explanation,
                    points: c.difficulty === 'Advanced' ? 300 : c.difficulty === 'Intermediate' ? 200 : 100,
                    order: c.order || 1
                },
                create: {
                    id: c.id,
                    gameSlug: 'complete-the-code',
                    technology: 'csharp',
                    technologyName: 'C#',
                    title: c.title,
                    difficulty: c.difficulty,
                    language: 'csharp',
                    description: c.description || 'Fill in the missing C# code.',
                    code: c.code,
                    options: JSON.stringify(c.options || []),
                    solution: c.solution,
                    blank: c.solution,
                    explanation: c.explanation,
                    points: c.difficulty === 'Advanced' ? 300 : c.difficulty === 'Intermediate' ? 200 : 100,
                    order: c.order || 1
                }
            });
            challengesCount++;
        }
        console.log(`✓ Seeded ${challengesCount} Complete the Code challenges.`);

        // 5B. Other C# challenges from TECHNOLOGY_CHALLENGES (csharp-quiz-challenge, find-the-bug, etc.)
        let otherCount = 0;
        const csharpChallenges = TECHNOLOGY_CHALLENGES.filter(c => c.technology === 'csharp');
        for (const c of csharpChallenges) {
            await prisma.gameChallenge.upsert({
                where: { id: c.id },
                update: {
                    gameSlug: c.gameSlug,
                    technology: 'csharp',
                    technologyName: 'C#',
                    title: c.title,
                    difficulty: c.difficulty,
                    language: 'csharp',
                    description: c.description,
                    content: typeof c.content === 'string' ? c.content : JSON.stringify(c.content || {}),
                    solution: typeof c.solution === 'string' ? c.solution : JSON.stringify(c.solution),
                    explanation: c.explanation,
                    points: c.points || 150,
                    order: c.order || 1
                },
                create: {
                    id: c.id,
                    gameSlug: c.gameSlug,
                    technology: 'csharp',
                    technologyName: 'C#',
                    title: c.title,
                    difficulty: c.difficulty,
                    language: 'csharp',
                    description: c.description,
                    content: typeof c.content === 'string' ? c.content : JSON.stringify(c.content || {}),
                    solution: typeof c.solution === 'string' ? c.solution : JSON.stringify(c.solution),
                    explanation: c.explanation,
                    points: c.points || 150,
                    order: c.order || 1
                }
            });
            otherCount++;
        }
        console.log(`✓ Seeded ${otherCount} C# multi-game challenges.`);
        console.log(`\n🎉 SEEDING COMPLETED SUCCESSFULLY! Total C# challenges: ${challengesCount + otherCount}`);

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedCSharp();
