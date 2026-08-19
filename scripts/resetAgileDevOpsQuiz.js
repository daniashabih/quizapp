const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'Agile and DevOps';
const SESSION_NUMBER = 1;

const new32Questions = [
    {
        questionText: "In which decade did electronic computers first evolve?",
        options: ["1920s", "1940s", "1960s", "1980s"],
        correctAnswer: "1940s"
    },
    {
        questionText: "The term 'Software Engineering' was coined at a conference sponsored by which organization?",
        options: ["IEEE", "ACM", "NATO Science Committee", "ISO"],
        correctAnswer: "NATO Science Committee"
    },
    {
        questionText: "In which year was the term 'Software Engineering' coined?",
        options: ["1940", "1950", "1960", "1970"],
        correctAnswer: "1960"
    },
    {
        questionText: "As per IEEE, software engineering is the application of a systematic, disciplined, quantifiable approach to the development, operation, and maintenance of:",
        options: ["Hardware", "Software", "Networks", "Databases"],
        correctAnswer: "Software"
    },
    {
        questionText: "As per IEEE, software is defined as a collection of computer programs, procedures, rules, and associated:",
        options: ["Hardware and devices", "Documentation and data", "Networks and servers", "Users and clients"],
        correctAnswer: "Documentation and data"
    },
    {
        questionText: "Which of the following is NOT listed as a component of software?",
        options: ["Instructions or computer programs", "Data structures", "Documentation", "Hardware circuits"],
        correctAnswer: "Hardware circuits"
    },
    {
        questionText: "Which component of software stores information required by programs to work upon or process?",
        options: ["Documentation", "Data structures", "Instructions", "Procedures"],
        correctAnswer: "Data structures"
    },
    {
        questionText: "Which of the following is NOT mentioned as a reason for the need for software?",
        options: ["A market trend or requirement", "A business essential", "A legal requirement", "A hardware limitation"],
        correctAnswer: "A hardware limitation"
    },
    {
        questionText: "Development of software is best described as:",
        options: ["A one-time activity", "An ongoing process", "A purely manual task", "A hardware assembly process"],
        correctAnswer: "An ongoing process"
    },
    {
        questionText: "The fundamental objectives of a software process are:",
        options: ["Speed and cost", "Optimality and scalability", "Design and testing", "Coding and debugging"],
        correctAnswer: "Optimality and scalability"
    },
    {
        questionText: "The ability of a process to produce high-quality software at low cost is called:",
        options: ["Scalability", "Predictability", "Optimality", "Maintainability"],
        correctAnswer: "Optimality"
    },
    {
        questionText: "The ability of a process to be applicable for large software projects is called:",
        options: ["Optimality", "Scalability", "Predictability", "Reusability"],
        correctAnswer: "Scalability"
    },
    {
        questionText: "Which of the following is NOT one of the important properties of a software process?",
        options: ["Predictability", "Maintainability", "Defect Removal and Prevention", "Portability"],
        correctAnswer: "Portability"
    },
    {
        questionText: "According to the effort distribution table, which activity consumes the highest percentage of effort in a software process?",
        options: ["Requirements (10%)", "Design (20%)", "Coding (20%)", "Testing and Maintenance (50%)"],
        correctAnswer: "Testing and Maintenance (50%)"
    },
    {
        questionText: "According to the programmer activity distribution table, which activity takes up the highest percentage of a programmer's time?",
        options: ["Writing Programs (13%)", "Reading Programs and manuals (16%)", "Job Communication (32%)", "Others including personal (39%)"],
        correctAnswer: "Others including personal (39%)"
    },
    {
        questionText: "If an error is corrected only after coding, what is the typical impact on cost?",
        options: ["Cost decreases", "Cost remains unchanged", "Cost increases, since both design and code must be changed", "No impact on the project"],
        correctAnswer: "Cost increases, since both design and code must be changed"
    },
    {
        questionText: "A process must be improved to satisfy goals such as:",
        options: ["Increasing team size only", "Quality improvement and cost reduction", "Reducing documentation", "Avoiding customer feedback"],
        correctAnswer: "Quality improvement and cost reduction"
    },
    {
        questionText: "The product of software engineering is referred to as a:",
        options: ["Hardware system", "Software system", "Network system", "Manufacturing unit"],
        correctAnswer: "Software system"
    },
    {
        questionText: "Software as a product is different from other engineered products mainly because it is:",
        options: ["A physical entity", "A logical entity", "A mechanical entity", "An electrical entity"],
        correctAnswer: "A logical entity"
    },
    {
        questionText: "Which statement about software is TRUE?",
        options: ["Software is manufactured, not engineered", "Software is developed or engineered, not manufactured", "Software wears out like hardware", "Software cannot be modified once built"],
        correctAnswer: "Software is developed or engineered, not manufactured"
    },
    {
        questionText: "For software, manufacturing is best described as:",
        options: ["A complex assembly process", "A trivial process of duplication", "An expensive fabrication process", "Not possible at all"],
        correctAnswer: "A trivial process of duplication"
    },
    {
        questionText: "The characteristic that allows software to be modified easily, setting it apart from products like cars and ovens, is called:",
        options: ["Reusability", "Malleability", "Portability", "Reliability"],
        correctAnswer: "Malleability"
    },
    {
        questionText: "Unlike hardware, software does NOT:",
        options: ["Get developed", "Get maintained", "Wear out", "Get tested"],
        correctAnswer: "Wear out"
    },
    {
        questionText: "In the hardware failure-rate curve, the initial period of high failure rate is known as:",
        options: ["Wear-out period", "Infant mortality", "Steady state", "Maintenance phase"],
        correctAnswer: "Infant mortality"
    },
    {
        questionText: "In the software failure-rate curve, what happens to the failure rate as a new change is requested before the curve returns to steady state?",
        options: ["It remains flat", "It drops to zero", "It spikes again", "It becomes negative"],
        correctAnswer: "It spikes again"
    },
    {
        questionText: "Over time, due to continuous change requests, the minimum failure rate level of software tends to:",
        options: ["Stay exactly the same", "Decrease steadily", "Rise, causing software to deteriorate", "Disappear completely"],
        correctAnswer: "Rise, causing software to deteriorate"
    },
    {
        questionText: "Most software today is built using object-oriented technology components mainly to promote:",
        options: ["Hardware assembly", "Software reusability", "Manual coding", "Increased failure rate"],
        correctAnswer: "Software reusability"
    },
    {
        questionText: "Software can be broadly classified into which two categories?",
        options: ["Application software and System software", "Open source and Closed source", "Freeware and Shareware", "Web software and Desktop software"],
        correctAnswer: "Application software and System software"
    },
    {
        questionText: "Software designed to allow the user to complete a specific task, such as Web browsers or office software, is called:",
        options: ["System Software", "Application Software", "Utility Software", "Firmware"],
        correctAnswer: "Application Software"
    },
    {
        questionText: "Software that sits directly on top of a computer's hardware components and enables it to function, such as operating systems and device drivers, is called:",
        options: ["Application Software", "System Software", "Middleware", "Antivirus Software"],
        correctAnswer: "System Software"
    },
    {
        questionText: "Which of the following is an example of System Software (Operating System)?",
        options: ["Antivirus", "Linux", "File Manager", "Screen Saver"],
        correctAnswer: "Linux"
    },
    {
        questionText: "Which of the following is an example of Utility Software under System Software?",
        options: ["Windows XP", "Unix", "Antivirus", "Mac OS X"],
        correctAnswer: "Antivirus"
    }
];

async function resetAgileQuestions() {
    console.log('================================================================');
    console.log(`  RESETTING "${CATEGORY_NAME}" TO ONLY THE 32 NEW QUESTIONS`);
    console.log('================================================================\n');

    try {
        // 1. Ensure category exists
        let category = await prisma.category.findFirst({
            where: { name: { equals: CATEGORY_NAME, mode: 'insensitive' } }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME }
            });
            console.log(`✅ Created Category: "${category.name}"`);
        } else {
            console.log(`✔ Found Category: "${category.name}"`);
        }

        const effectiveCategoryName = category.name;

        // 2. Delete ALL existing questions under "Agile and DevOps" (and any variations)
        const deletedResult = await prisma.question.deleteMany({
            where: {
                OR: [
                    { category: { equals: CATEGORY_NAME, mode: 'insensitive' } },
                    { category: { equals: 'Agile & DevOps', mode: 'insensitive' } },
                    { category: { equals: 'Agile - Paradigm Shift in SDLC', mode: 'insensitive' } }
                ]
            }
        });
        console.log(`🗑️ Deleted ${deletedResult.count} previous questions.`);

        // 3. Insert the 32 new questions
        for (let i = 0; i < new32Questions.length; i++) {
            const q = new32Questions[i];
            await prisma.question.create({
                data: {
                    category: effectiveCategoryName,
                    session: SESSION_NUMBER,
                    questionText: q.questionText,
                    options: JSON.stringify(q.options),
                    correctAnswer: q.correctAnswer
                }
            });
            console.log(`  [${i + 1}/${new32Questions.length}] ➕ Inserted: "${q.questionText.substring(0, 50)}..."`);
        }

        // 4. Verify total count
        const totalCount = await prisma.question.count({
            where: {
                category: { equals: effectiveCategoryName, mode: 'insensitive' }
            }
        });

        console.log('\n================================================================');
        console.log(`🎉 SUCCESS:`);
        console.log(`   - Track: "${effectiveCategoryName}"`);
        console.log(`   - Session: ${SESSION_NUMBER}`);
        console.log(`   - Total Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error resetting questions:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetAgileQuestions();
