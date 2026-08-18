const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'Agile and DevOps';

const questions = [
    {
        questionText: 'Which of the following best defines Software Development Life Cycle (SDLC)?',
        options: [
            'A tool used only for testing software',
            'A process applied to the development of a software product, consisting of a sequence of activities or phases',
            'A programming language used to write applications',
            'A type of hardware used for software deployment'
        ],
        correctAnswer: 'A process applied to the development of a software product, consisting of a sequence of activities or phases',
        difficulty: 'beginner'
    },
    {
        questionText: 'SDLC is applied:',
        options: [
            'Only to build new software projects',
            'Only to enhance existing software',
            'To build new software projects and also to enhance existing software',
            'Only during the testing phase'
        ],
        correctAnswer: 'To build new software projects and also to enhance existing software',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is NOT one of the business requirements that SDLC has to meet?',
        options: [
            'High-quality software systems',
            'Strong management control',
            'Increased productivity',
            'Reduced number of developers'
        ],
        correctAnswer: 'Reduced number of developers',
        difficulty: 'beginner'
    },
    {
        questionText: 'In the early years (1960s) of SDLC evolution, the need was felt for:',
        options: [
            'An analysis and design phase',
            'A testing and deployment phase',
            'A marketing phase',
            'A coding-only phase'
        ],
        correctAnswer: 'An analysis and design phase',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which techniques were complex and not widely used in the evolution of SDLC?',
        options: [
            'Waterfall Model and V-Model',
            'Accurately Defined System (ADS) and Time Automated Grid (TAG)',
            'Agile and Scrum',
            'Data Flow Diagram and ER Diagram'
        ],
        correctAnswer: 'Accurately Defined System (ADS) and Time Automated Grid (TAG)',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Which of the following is NOT a technique used in requirement gathering?',
        options: [
            'Interviewing',
            'Questionnaires',
            'Record Reviews',
            'Code Refactoring'
        ],
        correctAnswer: 'Code Refactoring',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which requirement-gathering technique is ideal when getting responses from a large group, such as workers at a factory site?',
        options: [
            'Interviewing',
            'Questionnaires',
            'Observation',
            'Record Reviews'
        ],
        correctAnswer: 'Questionnaires',
        difficulty: 'beginner'
    },
    {
        questionText: 'A feasibility study is conducted to find out whether the proposed system will be:',
        options: [
            'Possible, Affordable, and Acceptable',
            'Fast, Cheap, and Popular',
            'Coded, Tested, and Deployed',
            'Documented, Reviewed, and Approved'
        ],
        correctAnswer: 'Possible, Affordable, and Acceptable',
        difficulty: 'beginner'
    },
    {
        questionText: 'The requirements gathered and analyzed must be specified in which document?',
        options: [
            'Software Design Document (SDD)',
            'Requirement Specification Document (RSD)',
            'Test Plan Document (TPD)',
            'Project Charter Document (PCD)'
        ],
        correctAnswer: 'Requirement Specification Document (RSD)',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is NOT a content of the Requirement Specification Document (RSD)?',
        options: [
            'Functional and performance requirements of a system',
            'Input-output formats',
            'Design constraints',
            'Source code of the application'
        ],
        correctAnswer: 'Source code of the application',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which design element defines the relationship among the major structural elements of a program?',
        options: [
            'Interface design',
            'Architectural design',
            'Component-level design',
            'Data design'
        ],
        correctAnswer: 'Architectural design',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Which of the following elements is used to provide information necessary to create a design model?',
        options: [
            'Entity Relationship (ER) diagram',
            'Data Flow Diagram (DFD)',
            'Control Flow diagram and Data dictionary',
            'All of the above'
        ],
        correctAnswer: 'All of the above',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Who suggested the three characteristics that serve as a guide for evaluating a good design?',
        options: [
            'McGlaughlin',
            'IEEE',
            'NATO Science Committee',
            'Michael Philips'
        ],
        correctAnswer: 'McGlaughlin',
        difficulty: 'expert'
    },
    {
        questionText: 'Which phase involves the actual coding of a software application, where the product is built from scratch?',
        options: [
            'Testing',
            'Building or Construction',
            'Designing Architecture',
            'Deployment and Maintenance'
        ],
        correctAnswer: 'Building or Construction',
        difficulty: 'beginner'
    },
    {
        questionText: 'Testing in SDLC is also referred to as:',
        options: [
            'Quality Assurance (QA)',
            'Requirement Analysis',
            'System Engineering',
            'Validation Design'
        ],
        correctAnswer: 'Quality Assurance (QA)',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is NOT a type of testing mentioned in the SDLC testing phase?',
        options: [
            'Unit testing',
            'Sanity testing',
            'Regression or stress testing',
            'Predictive testing'
        ],
        correctAnswer: 'Predictive testing',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Maintenance activities in SDLC involve all of the following EXCEPT:',
        options: [
            'Making enhancements to the software',
            'Adapting products to new environments',
            'Correcting problems',
            'Gathering initial requirements from the client'
        ],
        correctAnswer: 'Gathering initial requirements from the client',
        difficulty: 'beginner'
    },
    {
        questionText: 'In the ABC Insurance Co. case study, why was testing proposed to be outsourced to third-party vendors?',
        options: [
            'To increase project cost',
            'To minimize turnaround time and provide accurate test case results',
            'Because the company had no testing requirement',
            'To avoid using the SDLC model altogether'
        ],
        correctAnswer: 'To minimize turnaround time and provide accurate test case results',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Software process models are broadly categorized into:',
        options: [
            'Linear Process Models and Evolutionary Process Models',
            'Agile Models and Waterfall Models only',
            'Testing Models and Design Models',
            'Manual Models and Automated Models'
        ],
        correctAnswer: 'Linear Process Models and Evolutionary Process Models',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Linear process models progress through which sequence of phases?',
        options: [
            'Testing, Design, Coding, Analysis, Support',
            'Analysis, Design, Coding, Testing, Implementation and Support',
            'Coding, Analysis, Testing, Design, Support',
            'Support, Testing, Coding, Design, Analysis'
        ],
        correctAnswer: 'Analysis, Design, Coding, Testing, Implementation and Support',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is an advantage of Linear Process Models?',
        options: [
            'Encourages skipping requirement analysis',
            'Easy to understand and implement, with clear demarcation between phases',
            'Allows unlimited backward movement between phases',
            'Eliminates the need for testing'
        ],
        correctAnswer: 'Easy to understand and implement, with clear demarcation between phases',
        difficulty: 'beginner'
    },
    {
        questionText: 'The Waterfall Model is also known as:',
        options: [
            'The Verification and Validation model',
            'The linear sequential model or \'classic life cycle\'',
            'The iterative model',
            'The spiral model'
        ],
        correctAnswer: 'The linear sequential model or \'classic life cycle\'',
        difficulty: 'beginner'
    },
    {
        questionText: 'In the Waterfall Model, each phase ends in which activity?',
        options: [
            'A verification and validation activity',
            'A budgeting activity',
            'A marketing review',
            'A hiring process'
        ],
        correctAnswer: 'A verification and validation activity',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Which of the following is a drawback of the Waterfall Model?',
        options: [
            'Users can judge the quality of the product only at the end of the development life cycle',
            'It is too flexible for changing requirements',
            'It requires no clear requirements',
            'It cannot be used for smaller projects'
        ],
        correctAnswer: 'Users can judge the quality of the product only at the end of the development life cycle',
        difficulty: 'intermediate'
    },
    {
        questionText: 'The Waterfall Model is most appropriate when:',
        options: [
            'Project requirements are unclear and constantly changing',
            'The project requirements are clear, fixed, and very well documented',
            'There are no resources available for the project',
            'The problem definition keeps changing frequently'
        ],
        correctAnswer: 'The project requirements are clear, fixed, and very well documented',
        difficulty: 'beginner'
    },
    {
        questionText: 'The V-Model is an extension of which model?',
        options: [
            'Spiral Model',
            'Waterfall Model',
            'Agile Model',
            'Prototype Model'
        ],
        correctAnswer: 'Waterfall Model',
        difficulty: 'beginner'
    },
    {
        questionText: 'In the V-Model, validation can be expressed by which query?',
        options: [
            '\'Are you building it right?\'',
            '\'Are you building the right thing?\'',
            '\'Is the budget sufficient?\'',
            '\'Is the team experienced enough?\''
        ],
        correctAnswer: '\'Are you building the right thing?\'',
        difficulty: 'intermediate'
    },
    {
        questionText: 'In the V-Model diagram, what does the left side of the \'V\' represent?',
        options: [
            'Integration of parts and their validation',
            'The decomposition of requirements and creation of system specifications',
            'The final deployment of the software',
            'The customer\'s acceptance criteria only'
        ],
        correctAnswer: 'The decomposition of requirements and creation of system specifications',
        difficulty: 'intermediate'
    },
    {
        questionText: 'Which of the following is a disadvantage of the V-Model?',
        options: [
            'It provides multiple early prototypes of the software',
            'It is very flexible in adjusting scope',
            'Little flexibility and adjusting scope is difficult and expensive',
            'It has no specific deliverables for each phase'
        ],
        correctAnswer: 'Little flexibility and adjusting scope is difficult and expensive',
        difficulty: 'intermediate'
    },
    {
        questionText: 'A major shortfall of linear models is that they:',
        options: [
            'Consist of dependent phases executed sequentially with no feedback loops',
            'Allow continuous feedback at every stage',
            'Are only used for evolutionary development',
            'Do not require any acceptance testing'
        ],
        correctAnswer: 'Consist of dependent phases executed sequentially with no feedback loops',
        difficulty: 'intermediate'
    },
    {
        questionText: 'According to IEEE, software is defined as:',
        options: [
            'Only the computer hardware components',
            'A collection of computer programs, procedures, rules, and associated documentation and data',
            'A single executable file',
            'A network protocol used for data transfer'
        ],
        correctAnswer: 'A collection of computer programs, procedures, rules, and associated documentation and data',
        difficulty: 'intermediate'
    },
    {
        questionText: 'The term \'Software Engineering\' was coined at a conference sponsored by:',
        options: [
            'IEEE Committee in the USA',
            'NATO Science Committee in Europe in 1960',
            'ISO Committee in Asia',
            'ACM Committee in Canada'
        ],
        correctAnswer: 'NATO Science Committee in Europe in 1960',
        difficulty: 'expert'
    },
    {
        questionText: 'Which of the following is NOT a component of software as defined by IEEE?',
        options: [
            'Instructions or computer programs',
            'Data structures',
            'Documentation',
            'Physical hardware casing'
        ],
        correctAnswer: 'Physical hardware casing',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is a characteristic that makes software different from other engineered products?',
        options: [
            'Software is manufactured on an assembly line',
            'Software is malleable and does not \'wear out\' in the traditional sense',
            'Software cannot be modified once developed',
            'Software always improves in reliability without maintenance'
        ],
        correctAnswer: 'Software is malleable and does not \'wear out\' in the traditional sense',
        difficulty: 'intermediate'
    },
    {
        questionText: 'In the failure rate vs. time curve for software (idealized), what causes the failure rate to spike periodically?',
        options: [
            'Hardware wear and tear',
            'Introduction of new defects due to changes/maintenance requests',
            'Power outages',
            'Reduction in the number of users'
        ],
        correctAnswer: 'Introduction of new defects due to changes/maintenance requests',
        difficulty: 'expert'
    },
    {
        questionText: 'Which of the following best explains why most software is custom-built rather than assembled from existing components (traditionally)?',
        options: [
            'Software components could not historically be ordered as reusable parts like hardware digital components',
            'Software is always cheaper to build from scratch',
            'Reusable software components do not exist at all',
            'Custom-built software has no maintenance requirement'
        ],
        correctAnswer: 'Software components could not historically be ordered as reusable parts like hardware digital components',
        difficulty: 'expert'
    },
    {
        questionText: 'Software can be broadly classified into which two categories?',
        options: [
            'Application Software and System Software',
            'Open Source and Closed Source',
            'Paid Software and Free Software',
            'Local Software and Cloud Software'
        ],
        correctAnswer: 'Application Software and System Software',
        difficulty: 'beginner'
    },
    {
        questionText: 'Which of the following is an example of System Software?',
        options: [
            'Web browser',
            'Office software',
            'Operating system drivers, linkers, and debuggers',
            'Video games'
        ],
        correctAnswer: 'Operating system drivers, linkers, and debuggers',
        difficulty: 'beginner'
    },
    {
        questionText: 'According to the effort distribution within phases of a software process, which activity consumes the highest percentage of effort?',
        options: [
            'Requirements (10%)',
            'Design (20%)',
            'Coding (20%)',
            'Testing and Maintenance (50%)'
        ],
        correctAnswer: 'Testing and Maintenance (50%)',
        difficulty: 'expert'
    },
    {
        questionText: 'Which property of a software process refers to the ability to produce high-quality software at low cost?',
        options: [
            'Scalability',
            'Optimality',
            'Predictability',
            'Maintainability'
        ],
        correctAnswer: 'Optimality',
        difficulty: 'expert'
    }
];

async function uploadQuiz() {
    console.log('====================================================');
    console.log(`  UPLOADING QUIZ TO CATEGORY: "${CATEGORY_NAME}"   `);
    console.log('====================================================\n');

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

        // Step 2: Upload Questions (skip duplicates if identical questionText exists in same category)
        let inserted = 0;
        let skipped = 0;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const existing = await prisma.question.findFirst({
                where: {
                    category: effectiveCategoryName,
                    questionText: q.questionText
                }
            });

            if (!existing) {
                await prisma.question.create({
                    data: {
                        category: effectiveCategoryName,
                        questionText: q.questionText,
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        difficulty: q.difficulty || 'beginner'
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] ➕ Inserted: "${q.questionText.substring(0, 50)}..."`);
                inserted++;
            } else {
                // Update options/correctAnswer/difficulty in case it exists
                await prisma.question.update({
                    where: { id: existing.id },
                    data: {
                        options: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        difficulty: q.difficulty || 'beginner'
                    }
                });
                console.log(`  [${i + 1}/${questions.length}] 🔄 Updated existing: "${q.questionText.substring(0, 50)}..."`);
                skipped++;
            }
        }

        console.log('\n====================================================');
        console.log(`🎉 UPLOAD SUMMARY for "${effectiveCategoryName}":`);
        console.log(`   - Total Questions Processed: ${questions.length}`);
        console.log(`   - Newly Inserted: ${inserted}`);
        console.log(`   - Updated Existing: ${skipped}`);
        console.log('====================================================\n');

    } catch (err) {
        console.error('❌ Error uploading quiz:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

uploadQuiz();
