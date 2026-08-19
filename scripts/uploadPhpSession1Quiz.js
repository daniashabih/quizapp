const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const prisma = require('../api/_config/prisma');

const CATEGORY_NAME = 'PHP';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "Who is PHP a successor of?",
        options: [
            "HTML/FI Product",
            "PHP/FI Product",
            "ASP/FI Product",
            "JSP/FI Product"
        ],
        correctAnswer: "PHP/FI Product"
    },
    {
        questionText: "In which year does the history of PHP date back to?",
        options: [
            "1990",
            "1994",
            "1995",
            "1999"
        ],
        correctAnswer: "1994"
    },
    {
        questionText: "In which year was PHP version 5.0 released?",
        options: [
            "June 1999",
            "July 2004",
            "2019",
            "2020"
        ],
        correctAnswer: "July 2004"
    },
    {
        questionText: "In which year was PHP 8.0 released?",
        options: [
            "2017",
            "2018",
            "2019",
            "2020"
        ],
        correctAnswer: "2020"
    },
    {
        questionText: "PHP stands for:",
        options: [
            "Personal Home Page",
            "Hypertext Preprocessor",
            "Hyperlink Text Program",
            "High-level Programming"
        ],
        correctAnswer: "Hypertext Preprocessor"
    },
    {
        questionText: "PHP is best described as a:",
        options: [
            "Client-side compiled language",
            "General-purpose, open source, server-side scripting language",
            "Database management system",
            "Markup language"
        ],
        correctAnswer: "General-purpose, open source, server-side scripting language"
    },
    {
        questionText: "Which of the following is NOT a feature of PHP?",
        options: [
            "Runs efficiently on the server-side",
            "Works only on Windows OS",
            "Is free and downloadable from php.net",
            "Supports many databases such as Oracle, MySQL, MS SQL Server"
        ],
        correctAnswer: "Works only on Windows OS"
    },
    {
        questionText: "Which of the following are popular PHP frameworks mentioned in the session?",
        options: [
            "Zend, Laravel, and CodeIgniter",
            "Angular, React, and Vue",
            "Django, Flask, and Rails",
            "Spring, Hibernate, and Struts"
        ],
        correctAnswer: "Zend, Laravel, and CodeIgniter"
    },
    {
        questionText: "Which of the following is NOT an area in which PHP scripts are mainly used?",
        options: [
            "Server-side scripting",
            "Command-line scripting",
            "Writing desktop applications (using PHP-GTK)",
            "Operating system kernel development"
        ],
        correctAnswer: "Operating system kernel development"
    },
    {
        questionText: "Which software package is required for server-side scripting with PHP?",
        options: [
            "XAMPP",
            "Photoshop",
            "Visual Studio",
            "Wireshark"
        ],
        correctAnswer: "XAMPP"
    },
    {
        questionText: "What is the correct tag to start a PHP script block?",
        options: [
            "<php>",
            "<?php",
            "<script php>",
            "<%php"
        ],
        correctAnswer: "<?php"
    },
    {
        questionText: "Which statement is used in PHP to output text, as shown in the Basic PHP Syntax example?",
        options: [
            "print_r",
            "echo",
            "write",
            "display"
        ],
        correctAnswer: "echo"
    },
    {
        questionText: "Which of the following statements about PHP and JavaScript is TRUE?",
        options: [
            "PHP code executes within the browser; JavaScript executes on the server",
            "PHP is a back-end language; JavaScript is used for front-end development",
            "PHP is single-threaded; JavaScript is multi-threaded",
            "Both PHP and JavaScript execute only on the server"
        ],
        correctAnswer: "PHP is a back-end language; JavaScript is used for front-end development"
    },
    {
        questionText: "Which of the following is NOT listed as an enhancement in PHP 8.0?",
        options: [
            "Named arguments",
            "Nullsafe operator",
            "Match expression",
            "Automatic garbage collection introduced for the first time"
        ],
        correctAnswer: "Automatic garbage collection introduced for the first time"
    },
    {
        questionText: "In PHP 8.0, which feature allows you to pass arguments to a function based on the parameter name rather than position?",
        options: [
            "Union types",
            "Named arguments",
            "Attributes",
            "Match expression"
        ],
        correctAnswer: "Named arguments"
    },
    {
        questionText: "Which PHP 8.0 syntax, shown as #[Route(...)], replaced PHPDoc-style annotations (@Route(...)) used in PHP 7.0?",
        options: [
            "Attributes",
            "Traits",
            "Interfaces",
            "Namespaces"
        ],
        correctAnswer: "Attributes"
    },
    {
        questionText: "Constructor property promotion in PHP 8.0 primarily helps to:",
        options: [
            "Reduce boilerplate code for declaring and assigning class properties",
            "Increase the number of required constructor arguments",
            "Remove the need for constructors entirely",
            "Enforce strict typing for all variables"
        ],
        correctAnswer: "Reduce boilerplate code for declaring and assigning class properties"
    },
    {
        questionText: "What does the union types feature in PHP 8.0 allow a property or parameter to do?",
        options: [
            "Accept only a single fixed data type",
            "Accept a value of one of several specified types (e.g., int|float)",
            "Merge two classes into one",
            "Combine two arrays into a union set"
        ],
        correctAnswer: "Accept a value of one of several specified types (e.g., int|float)"
    },
    {
        questionText: "What is the main advantage of the match expression over switch in PHP 8.0?",
        options: [
            "It uses loose comparison (==) instead of strict comparison",
            "It uses strict type comparison (===) and returns a value directly",
            "It cannot handle multiple conditions",
            "It requires a break statement after every case"
        ],
        correctAnswer: "It uses strict type comparison (===) and returns a value directly"
    },
    {
        questionText: "What symbol represents the nullsafe operator introduced in PHP 8.0?",
        options: [
            "??",
            "?->",
            "->?",
            "!->"
        ],
        correctAnswer: "?->"
    },
    {
        questionText: "The nullsafe operator in PHP 8.0 is mainly used to:",
        options: [
            "Avoid multiple nested null checks when accessing chained properties/methods",
            "Convert null values to zero",
            "Declare a variable as nullable",
            "Force a variable to never be null"
        ],
        correctAnswer: "Avoid multiple nested null checks when accessing chained properties/methods"
    },
    {
        questionText: "Which of the following is an improvement under 'Enhanced Error Handling and Type System' in PHP 8.0?",
        options: [
            "Fatal errors are now silenced by the @ operator",
            "Fatal errors are no longer silenced by the @ operator",
            "All errors are converted to warnings",
            "Type checks were removed for arithmetic operators"
        ],
        correctAnswer: "Fatal errors are no longer silenced by the @ operator"
    },
    {
        questionText: "Which new type, introduced in PHP 8.0, allows a parameter, property, or return type to accept any type of value?",
        options: [
            "mixed",
            "union",
            "static",
            "never"
        ],
        correctAnswer: "mixed"
    },
    {
        questionText: "In PHP 8.0, resources for extensions such as OpenSSL, GD, Curl, XML Writer, Sockets, and XML have been replaced with:",
        options: [
            "Union types",
            "Opaque objects",
            "Named arguments",
            "Attributes"
        ],
        correctAnswer: "Opaque objects"
    },
    {
        questionText: "What is the most significant new feature added in PHP 8.0 for performance improvement?",
        options: [
            "Just In Time (JIT) Compiler",
            "Nullsafe operator",
            "Constructor property promotion",
            "Match expression"
        ],
        correctAnswer: "Just In Time (JIT) Compiler"
    },
    {
        questionText: "In earlier (pre-JIT) versions of PHP, what was the main drawback in code execution?",
        options: [
            "The interpreter had to interpret, compile, and execute the code repeatedly for each request",
            "Code could only run once and then had to be rewritten",
            "PHP code executed only in the browser",
            "There was no way to run PHP without a database"
        ],
        correctAnswer: "The interpreter had to interpret, compile, and execute the code repeatedly for each request"
    },
    {
        questionText: "Which PHP feature enables it to generate content dynamically in formats such as HTML, PDF, Text, XML, and CSV?",
        options: [
            "Just In Time compilation",
            "Dynamic content generation capability of PHP",
            "Nullsafe operator",
            "Union types"
        ],
        correctAnswer: "Dynamic content generation capability of PHP"
    },
    {
        questionText: "Which text-processing feature of PHP is mentioned in the session summary?",
        options: [
            "Perl Compatible Regular Expressions (PCRE)",
            "Regular JavaScript Expressions (RJE)",
            "Basic Text Formatter (BTF)",
            "Standard Query Language (SQL)"
        ],
        correctAnswer: "Perl Compatible Regular Expressions (PCRE)"
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
        console.log(`   - Total Session 1 Questions in DB: ${totalCount}`);
        console.log('================================================================\n');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
