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
const SESSION_NUMBER = 5;

const questions = [
    {
        questionText: "What software development methodology uses very little planning and relies on parallel prototype development?",
        options: [
            "Waterfall Model",
            "Rapid Application Development (RAD)",
            "V-Model",
            "Spiral Model"
        ],
        correctAnswer: "Rapid Application Development (RAD)"
    },
    {
        questionText: "In RAD, several prototypes representing functional modules are developed using which concept?",
        options: [
            "Sequential development",
            "Parallelism",
            "Single-threaded development",
            "Waterfall staging"
        ],
        correctAnswer: "Parallelism"
    },
    {
        questionText: "Which of the following is NOT one of the three main objectives of the RAD process?",
        options: [
            "Timely and speedy delivery of a working application",
            "Helping the customer identify requirements properly",
            "Meeting customer requirements accurately using prototypes and iterations",
            "Eliminating the need for customer involvement"
        ],
        correctAnswer: "Eliminating the need for customer involvement"
    },
    {
        questionText: "The RAD lifecycle includes which series of phases?",
        options: [
            "Plan, Design, Code, Test",
            "Analysis, Design, Construct, and Test",
            "Requirement, Coding, Deployment",
            "Initiation, Execution, Closure"
        ],
        correctAnswer: "Analysis, Design, Construct, and Test"
    },
    {
        questionText: "In the RAD phase diagram, how many separate teams typically work in parallel?",
        options: [
            "One",
            "Two",
            "Three",
            "Four"
        ],
        correctAnswer: "Three"
    },
    {
        questionText: "Which RAD phase designs the business model of the developed product and identifies information flow between business functions?",
        options: [
            "Data Modeling",
            "Business Modeling",
            "Process Modeling",
            "Application Generation"
        ],
        correctAnswer: "Business Modeling"
    },
    {
        questionText: "In which RAD phase is information gathered during business analysis reviewed in terms of data objects involved in the business?",
        options: [
            "Business Modeling",
            "Data Modeling",
            "Testing and Turnover",
            "Application Generation"
        ],
        correctAnswer: "Data Modeling"
    },
    {
        questionText: "Which RAD phase implements identified data objects to achieve the identified information flow in the business?",
        options: [
            "Process Modeling",
            "Data Modeling",
            "Business Modeling",
            "Testing and Turnover"
        ],
        correctAnswer: "Process Modeling"
    },
    {
        questionText: "In which RAD phase are actual prototypes of the actual systems built by implementing identified process and data models?",
        options: [
            "Business Modeling",
            "Process Modeling",
            "Application Generation",
            "Testing and Turnover"
        ],
        correctAnswer: "Application Generation"
    },
    {
        questionText: "RAD is most applicable when there is a need to develop a system as:",
        options: [
            "A single monolithic release",
            "A set of working modules delivered in increments",
            "A one-time waterfall delivery",
            "A purely theoretical model"
        ],
        correctAnswer: "A set of working modules delivered in increments"
    },
    {
        questionText: "Which of the following resources is essential for successful application of the RAD model?",
        options: [
            "Low budget and unskilled staff",
            "Skilled manpower with strong business knowledge",
            "No customer involvement",
            "Sequential-only development tools"
        ],
        correctAnswer: "Skilled manpower with strong business knowledge"
    },
    {
        questionText: "Which of the following is an advantage of the RAD model?",
        options: [
            "Higher dependency on technical skills to identify requirements",
            "The project manager can estimate costs accurately",
            "Not suitable for projects with low cost",
            "Requires highly skilled manpower"
        ],
        correctAnswer: "The project manager can estimate costs accurately"
    },
    {
        questionText: "Which of the following is listed as a disadvantage of the RAD model?",
        options: [
            "Time taken to build the project is reduced",
            "Components ready for the repository need not be tested again",
            "Rapid development sometimes compromises quality parameters such as standardization and reliability",
            "There is strong participation by the customer"
        ],
        correctAnswer: "Rapid development sometimes compromises quality parameters such as standardization and reliability"
    },
    {
        questionText: "Component-based development is best described as a variation on general application development in which:",
        options: [
            "The application is built from a single indivisible module",
            "The application is built from discrete executable components developed and deployed relatively independently",
            "No reuse of components is ever possible",
            "Components must always be developed by a single team"
        ],
        correctAnswer: "The application is built from discrete executable components developed and deployed relatively independently"
    },
    {
        questionText: "What provides the technical framework for a component-based process model in software engineering?",
        options: [
            "Object technologies",
            "Manual coding standards only",
            "Waterfall documentation",
            "Spreadsheet modeling"
        ],
        correctAnswer: "Object technologies"
    },
    {
        questionText: "Which of the following is an advantage of component-based development described as allowing a runtime component to work independently?",
        options: [
            "Reusable",
            "Flexible",
            "Cost and time-efficient",
            "Easy to maintain"
        ],
        correctAnswer: "Flexible"
    },
    {
        questionText: "Which advantage of component-based development refers to a component being usable across different programming languages and operating systems?",
        options: [
            "Flexible",
            "Reusable",
            "Easy to maintain",
            "Cost and time-efficient"
        ],
        correctAnswer: "Reusable"
    },
    {
        questionText: "Which improving-business-process activity involves removing unnecessary and redundant steps and reducing variety in processes?",
        options: [
            "Integration",
            "Transformation",
            "Simplification",
            "Modularization"
        ],
        correctAnswer: "Simplification"
    },
    {
        questionText: "Which improving-business-process activity requires combining unconnected processes into a larger coordinated process?",
        options: [
            "Simplification",
            "Integration",
            "Transformation",
            "Weaving"
        ],
        correctAnswer: "Integration"
    },
    {
        questionText: "Which improving-business-process activity involves disassembling components and putting them together in a different way to transform the business process?",
        options: [
            "Simplification",
            "Integration",
            "Transformation",
            "Aspect weaving"
        ],
        correctAnswer: "Transformation"
    },
    {
        questionText: "Which of the following is listed under 'Improving Software' benefits of component-based development?",
        options: [
            "Greater functionality can be delivered faster by using already existing components",
            "Software becomes impossible to test",
            "A single GUI cannot be used across standard components",
            "Reliability decreases when requirements are fully implemented by components"
        ],
        correctAnswer: "Greater functionality can be delivered faster by using already existing components"
    },
    {
        questionText: "Which of the following is listed as a disadvantage of component-based development?",
        options: [
            "Building the environment that fits the components is challenging",
            "Components are always fully reusable with no setup needed",
            "Standards governing middleware are always sufficient",
            "It is always possible to find the best fit components for requirements"
        ],
        correctAnswer: "Building the environment that fits the components is challenging"
    },
    {
        questionText: "Aspect-Oriented Software Development (AOSD) primarily involves breaking down a software system into components known as:",
        options: [
            "Objects",
            "Modules",
            "Classes only",
            "Threads"
        ],
        correctAnswer: "Modules"
    },
    {
        questionText: "AOSD focuses on the identification, specification, and representation of:",
        options: [
            "Cross-cutting concerns and their modularization into separate functional units",
            "Only database schemas",
            "Only user interface layouts",
            "Only network protocols"
        ],
        correctAnswer: "Cross-cutting concerns and their modularization into separate functional units"
    },
    {
        questionText: "In AOSD terminology, what is a 'Concern'?",
        options: [
            "A programming error",
            "Any demand, requirement, or expectation on a software system by any stakeholder",
            "A type of compiler",
            "A testing tool"
        ],
        correctAnswer: "Any demand, requirement, or expectation on a software system by any stakeholder"
    },
    {
        questionText: "In AOSD, what is an 'Aspect'?",
        options: [
            "A module that contains a concern",
            "A single line of code",
            "A database table",
            "A testing framework"
        ],
        correctAnswer: "A module that contains a concern"
    },
    {
        questionText: "In AOSD, a 'Join Point' is best defined as:",
        options: [
            "A merge conflict in version control",
            "A well-defined point in the program's execution where an aspect is invoked",
            "A point where two databases connect",
            "A UI button click event only"
        ],
        correctAnswer: "A well-defined point in the program's execution where an aspect is invoked"
    },
    {
        questionText: "In AOSD, a 'Pointcut' refers to:",
        options: [
            "A specifically defined subset of join points",
            "The entire program execution",
            "A single variable declaration",
            "A compiler error location"
        ],
        correctAnswer: "A specifically defined subset of join points"
    },
    {
        questionText: "In AOSD, the 'Advice Body' refers to:",
        options: [
            "Code that is executed when a join point is reached",
            "The documentation for an aspect",
            "A UML diagram",
            "A test case template"
        ],
        correctAnswer: "Code that is executed when a join point is reached"
    },
    {
        questionText: "Which of the following is listed as an advantage of AOSD?",
        options: [
            "Increased modularity",
            "Reduced efficiency",
            "Security risks involving aspects",
            "Lack of a formalized process"
        ],
        correctAnswer: "Increased modularity"
    },
    {
        questionText: "Which of the following is listed as a disadvantage of AOSD?",
        options: [
            "Increased maintainability",
            "Increased reusability",
            "Lack of UML support and systematic methods of testing",
            "Reduction in the size of the code"
        ],
        correctAnswer: "Lack of UML support and systematic methods of testing"
    },
    {
        questionText: "When choosing a process model, organizations typically define a standard process that:",
        options: [
            "Cannot be changed under any circumstances",
            "Describes a sequence of activities or tasks but allows tailoring to suit a particular project",
            "Applies only to hardware projects",
            "Eliminates the need for prior project experience"
        ],
        correctAnswer: "Describes a sequence of activities or tasks but allows tailoring to suit a particular project"
    },
    {
        questionText: "'Tailoring' in the context of process model selection is defined as:",
        options: [
            "Writing new code from scratch every time",
            "The process of adjusting an organization's standard process to suit the particular business or technical needs of a project",
            "Removing all documentation from a project",
            "A synonym for outsourcing development"
        ],
        correctAnswer: "The process of adjusting an organization's standard process to suit the particular business or technical needs of a project"
    },
    {
        questionText: "With respect to which factors may a process be tailored, according to the slides?",
        options: [
            "Scope, formality, frequency, and granularity",
            "Color scheme, font, and layout",
            "Marketing budget and branding",
            "Office location and working hours"
        ],
        correctAnswer: "Scope, formality, frequency, and granularity"
    },
    {
        questionText: "Which of the following is NOT listed as a factor to consider when tailoring a process?",
        options: [
            "Skill level of the team",
            "Peak team size",
            "Criticality of the application",
            "Employee's favorite programming language"
        ],
        correctAnswer: "Employee's favorite programming language"
    },
    {
        questionText: "Web Engineering is best described as:",
        options: [
            "A rigid, non-adaptable waterfall process",
            "An adaptable and incremental (evolutionary) process",
            "A process used only for database design",
            "A process that ignores customer evaluation"
        ],
        correctAnswer: "An adaptable and incremental (evolutionary) process"
    },
    {
        questionText: "Web Engineering is populated by a set of framework activities that occur for all business-critical WebApp projects:",
        options: [
            "Only for large, complex projects",
            "Only for small projects",
            "Regardless of the size or complexity",
            "Only when a customer requests them"
        ],
        correctAnswer: "Regardless of the size or complexity"
    },
    {
        questionText: "Which of the following is one of the framework activities of Web Engineering listed in the slides?",
        options: [
            "Formulation",
            "Compilation",
            "Deprecation",
            "Outsourcing"
        ],
        correctAnswer: "Formulation"
    },
    {
        questionText: "Which framework activity in Web Engineering involves gathering and analyzing the WebApp's requirements before design begins?",
        options: [
            "Page generation and testing",
            "Analysis",
            "Customer evaluation only",
            "Weaving"
        ],
        correctAnswer: "Analysis"
    },
    {
        questionText: "Which of the following is the correct full list order of framework activities for Web Engineering as presented in the slides?",
        options: [
            "Formulation, Planning, Analysis, Modeling, Page generation and testing, Customer evaluation",
            "Testing, Planning, Formulation, Analysis, Modeling, Evaluation",
            "Modeling, Formulation, Testing, Planning, Analysis, Evaluation",
            "Planning, Formulation, Modeling, Analysis, Evaluation, Testing"
        ],
        correctAnswer: "Formulation, Planning, Analysis, Modeling, Page generation and testing, Customer evaluation"
    }
];

async function seed() {
    console.log('================================================================');
    console.log(`  SEEDING QUIZ: "${CATEGORY_NAME}" - Session ${SESSION_NUMBER}  `);
    console.log('================================================================\n');

    try {
        // Step 1: Ensure Category Exists
        let category = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: CATEGORY_NAME, mode: 'insensitive' } },
                    { name: { equals: 'Agile and Devops', mode: 'insensitive' } },
                    { name: { equals: 'Agile & DevOps', mode: 'insensitive' } }
                ]
            }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: CATEGORY_NAME }
            });
            console.log(`✅ Created Category: "${category.name}" (ID: ${category.id})`);
        } else {
            console.log(`✔ Found Existing Category: "${category.name}" (ID: ${category.id})`);
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
