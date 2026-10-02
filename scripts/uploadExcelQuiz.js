const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const CATEGORY_NAME = 'Excel';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "Which formula adds the values in cells A1 through A10?",
        options: [
            "=ADD(A1:A10)",
            "=SUM(A1:A10)",
            "=TOTAL(A1:A10)",
            "=PLUS(A1:A10)"
        ],
        correctAnswer: "=SUM(A1:A10)",
        explanation: "The =SUM(A1:A10) formula is used in Excel to add all numbers in the specified cell range from A1 to A10."
    },
    {
        questionText: "Which keyboard shortcut saves a workbook?",
        options: [
            "Ctrl+P",
            "Ctrl+O",
            "Ctrl+S",
            "Ctrl+N"
        ],
        correctAnswer: "Ctrl+S",
        explanation: "Ctrl+S is the universal shortcut in Excel to save changes to the current workbook."
    },
    {
        questionText: "Which reference stays fixed when a formula is copied to other cells?",
        options: [
            "A1",
            "$A$1",
            "A$1 only",
            "#A1"
        ],
        correctAnswer: "$A$1",
        explanation: "An absolute cell reference uses dollar signs before both the column letter and row number ($A$1) to keep the cell reference fixed when copied."
    },
    {
        questionText: "Which function searches the first column of a table and returns a value from another column in the same row?",
        options: [
            "VLOOKUP",
            "COUNTIF",
            "ROUND",
            "LEN"
        ],
        correctAnswer: "VLOOKUP",
        explanation: "VLOOKUP (Vertical Lookup) searches for a value in the leftmost column of a table array and returns a value in the same row from a specified column."
    },
    {
        questionText: "Which newer function is more flexible than VLOOKUP and replaces it in Microsoft 365?",
        options: [
            "XLOOKUP",
            "HLOOKUP",
            "FIND",
            "MATCHALL"
        ],
        correctAnswer: "XLOOKUP",
        explanation: "XLOOKUP is the modern lookup function introduced in Microsoft 365 that can look up values in any direction (vertically or horizontally) and defaults to an exact match."
    },
    {
        questionText: "Which function counts only cells that contain numbers?",
        options: [
            "COUNTA",
            "COUNTBLANK",
            "COUNTIF",
            "COUNT"
        ],
        correctAnswer: "COUNT",
        explanation: "The COUNT function counts the number of cells in a range that contain numbers, ignoring text, blank cells, and logical values."
    },
    {
        questionText: "Which formula joins the text in A1 and B1 with a space between them?",
        options: [
            "=A1+B1",
            "=A1&\" \"&B1",
            "=JOIN(A1,B1)",
            "=A1,B1"
        ],
        correctAnswer: "=A1&\" \"&B1",
        explanation: "The ampersand (&) is the concatenation operator in Excel; =A1&\" \"&B1 joins text from A1 and B1 separated by a space."
    },
    {
        questionText: "What does =IF(A1>50,\"Pass\",\"Fail\") return when A1 contains 75?",
        options: [
            "Fail",
            "Pass",
            "75",
            "FALSE"
        ],
        correctAnswer: "Pass",
        explanation: "The IF function tests if A1>50. Since 75 is greater than 50 (TRUE), it returns the second argument: \"Pass\"."
    },
    {
        questionText: "Which function counts cells that meet a single condition?",
        options: [
            "SUMIF",
            "COUNTIF",
            "AVERAGEIF",
            "IFERROR"
        ],
        correctAnswer: "COUNTIF",
        explanation: "COUNTIF applies criteria to cells across a range and counts the number of times that single condition is met."
    },
    {
        questionText: "Which Excel tool summarizes and analyzes large data sets by dragging fields into rows, columns and values?",
        options: [
            "Goal Seek",
            "Data Validation",
            "PivotTable",
            "Flash Fill"
        ],
        correctAnswer: "PivotTable",
        explanation: "A PivotTable is an interactive tool that allows users to rapidly group, summarize, and analyze multidimensional datasets by organizing fields into rows, columns, values, and filters."
    },
    {
        questionText: "What does Freeze Panes do?",
        options: [
            "Locks cells from editing",
            "Keeps selected rows/columns visible while scrolling",
            "Prevents formulas from updating",
            "Hides the ribbon"
        ],
        correctAnswer: "Keeps selected rows/columns visible while scrolling",
        explanation: "Freeze Panes keeps selected rows (such as header rows) or columns visible on screen as you scroll through the remainder of the worksheet."
    },
    {
        questionText: "What does the #DIV/0! error mean?",
        options: [
            "Invalid cell reference",
            "A value is not available",
            "A formula tried to divide by zero",
            "Text used in a math formula"
        ],
        correctAnswer: "A formula tried to divide by zero",
        explanation: "The #DIV/0! error occurs when an Excel formula attempts to divide a number by zero or by a cell that is blank."
    },
    {
        questionText: "Which shortcut inserts a line break inside a cell?",
        options: [
            "Ctrl+Enter",
            "Shift+Enter",
            "Alt+Enter",
            "Tab"
        ],
        correctAnswer: "Alt+Enter",
        explanation: "Pressing Alt+Enter while editing text inside an Excel cell adds a new line (line break) within the same cell."
    },
    {
        questionText: "What is Conditional Formatting used for?",
        options: [
            "Changing cell formatting automatically based on rules",
            "Protecting the sheet",
            "Sorting data",
            "Creating macros"
        ],
        correctAnswer: "Changing cell formatting automatically based on rules",
        explanation: "Conditional Formatting dynamically changes the appearance of cells (fill colors, font styles, icon sets) based on conditions or rules you specify."
    },
    {
        questionText: "Which function returns the current date and updates automatically?",
        options: [
            "NOW(A1)",
            "DATE()",
            "TODAY()",
            "CALENDAR()"
        ],
        correctAnswer: "TODAY()",
        explanation: "The TODAY() function takes no arguments and returns the current date, automatically updating whenever the worksheet recalculates."
    },
    {
        questionText: "Which feature restricts the type of data that can be entered in a cell (e.g., a dropdown list)?",
        options: [
            "Data Validation",
            "Text to Columns",
            "Remove Duplicates",
            "Consolidate"
        ],
        correctAnswer: "Data Validation",
        explanation: "Data Validation specifies rules for what data can be entered into a cell, commonly used to create dropdown selection lists or restrict entries to numbers/dates within a range."
    },
    {
        questionText: "Which function calculates the average of cells meeting a condition?",
        options: [
            "AVERAGE",
            "AVERAGEIF",
            "MEDIAN",
            "MODE"
        ],
        correctAnswer: "AVERAGEIF",
        explanation: "AVERAGEIF computes the arithmetic mean for all cells in a range that satisfy a given condition or criteria."
    },
    {
        questionText: "What does the #N/A error typically indicate in a lookup formula?",
        options: [
            "The value was not found",
            "The sheet is protected",
            "The formula is too long",
            "Circular reference"
        ],
        correctAnswer: "The value was not found",
        explanation: "#N/A (No value Available) indicates that a lookup formula such as VLOOKUP, HLOOKUP, MATCH, or XLOOKUP cannot find the target value."
    },
    {
        questionText: "Which chart type is best for showing a trend over time?",
        options: [
            "Pie chart",
            "Line chart",
            "Scatter chart only",
            "Doughnut chart"
        ],
        correctAnswer: "Line chart",
        explanation: "A line chart connects consecutive data points and is the most effective chart type for visualizing changes, patterns, and trends across continuous time periods."
    },
    {
        questionText: "Which function wraps another formula to display a custom value if it returns an error?",
        options: [
            "IFERROR",
            "ISERROR only",
            "ERROR.TYPE",
            "TRYIT"
        ],
        correctAnswer: "IFERROR",
        explanation: "IFERROR catches errors in a formula and returns an alternative result specified by the user (such as 0 or \"Not Found\") instead of displaying an Excel error code."
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
