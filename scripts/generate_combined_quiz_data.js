const fs = require('fs');
const path = require('path');

const CATEGORY_NAME = 'PHP, XML JSON, Laravel, MySQL, JavaScript';
const SESSION_NUMBER = 1;

const questions = [
    {
        questionText: "_______ functions in SQL are the numeric functions that are used to perform calculations by taking input values as arguments.",
        options: ["Numerical", "NULL", "Mathematical", "Date/Time"],
        correctAnswer: "Mathematical"
    },
    {
        questionText: "The _____ FUNCTION command is used to remove a function (if it exists) from the database.",
        options: ["DISC", "DROP", "SUBDATE", "REGEXP_INSTR"],
        correctAnswer: "DROP"
    },
    {
        questionText: "_____ clause is used in SELECT statements to define filter conditions for a group of rows.",
        options: ["HIDDEN", "HAD", "HAVE_TO", "HAVING"],
        correctAnswer: "HAVING"
    },
    {
        questionText: "In which of the following ways does the replication topology manager help?",
        options: ["Store topology and its status", "Lets GUI, CUI, API to check status and perform required operations", "Supports automatic failure of master", "All of these"],
        correctAnswer: "All of these"
    },
    {
        questionText: "In _______ partitioning, data distribution is done on the basis of predefined number of partitions.",
        options: ["List", "Hash", "Range", "Key"],
        correctAnswer: "Hash"
    },
    {
        questionText: "Only after a _____ operation is performed in a particular transaction, changes of the respective can be read or seen by other transaction.",
        options: ["COMMIT", "CONSTANT", "DONE", "FINAL"],
        correctAnswer: "COMMIT"
    },
    {
        questionText: "Which MySQL Database backup is created by copying the database files?",
        options: ["Logical backup by using MySQLdump", "Partial backup", "Physical backup", "Hot backup"],
        correctAnswer: "Physical backup"
    },
    {
        questionText: "The _____ is used to select all the rows from the table.",
        options: ["Dollar symbol", "Hash symbol", "Question mark", "Asterisk symbol"],
        correctAnswer: "Asterisk symbol"
    },
    {
        questionText: "Which keyword is used to retrieve records by checking the possible values from a given column?",
        options: ["CHECK", "CALC", "IN", "GAIN"],
        correctAnswer: "IN"
    },
    {
        questionText: "A _____ clause with a single expression fetches unique values from one column.",
        options: ["BETWEEN", "DISTINCT", "SELECT", "EXP"],
        correctAnswer: "DISTINCT"
    },
    {
        questionText: "Which feature is used to combine and retrieve data from more than one table?",
        options: ["MySQL JOIN", "MySQL LINK", "MySQL RET", "MySQL ADD"],
        correctAnswer: "MySQL JOIN"
    },
    {
        questionText: "When subqueries are used along with JOINS, the subquery is written using the _____ clause.",
        options: ["SET", "ATTACH", "WITH", "FROM"],
        correctAnswer: "FROM"
    },
    {
        questionText: "Which is the default JOIN clause?",
        options: ["CROSS JOIN", "SELF JOIN", "INNER JOIN", "OUTER JOIN"],
        correctAnswer: "INNER JOIN"
    },
    {
        questionText: "A ___ is a nested query inside another query.",
        options: ["Setquery", "Subquery", "Onequery", "Nestquery"],
        correctAnswer: "Subquery"
    },
    {
        questionText: "Which single row operator checks values less than the values returned by the subquery?",
        options: ["Less Than (<)", "Equal To (=)", "More Than (>)", "Less Than Equal To (<=)"],
        correctAnswer: "Less Than (<)"
    },
    {
        questionText: "Which multiple row operator returns the values less than the highest value of the list returned by the subquery?",
        options: [">ALL", ">ANY", "<ALL", "<ANY"],
        correctAnswer: "<ANY"
    },
    {
        questionText: "_______ in MySQL can be defined as a program that performs independent operations.",
        options: ["Functions", "Programmes", "Application", "Management"],
        correctAnswer: "Functions"
    },
    {
        questionText: "________ is an example of social media.",
        options: ["Printed newsletter", "Television", "Radio", "Podcast"],
        correctAnswer: "Podcast"
    },
    {
        questionText: "______ was one of the first social media websites backed by advertisements.",
        options: ["LunarStorm", "LinkedIn", "Six Degrees", "Facebook"],
        correctAnswer: "Six Degrees"
    },
    {
        questionText: "Twitter is responsible for introducing __________.",
        options: ["Live streaming", "Use of hashtag", "Use of paid advertising", "Use of pinboards"],
        correctAnswer: "Use of hashtag"
    },
    {
        questionText: "_______ is used to deliver more value to customers.",
        options: ["Customer Relationship Management", "Brand Management", "Customer Engagement", "Customer Responsibility Management"],
        correctAnswer: "Customer Engagement"
    },
    {
        questionText: "A _____ contains your basic details and picture, which can be viewed by your friends.",
        options: ["Live page", "Account settings", "Profile page", "Security settings"],
        correctAnswer: "Profile page"
    },
    {
        questionText: "Which of the following can be changed during digital transformation?",
        options: ["Business processes", "Business model", "Business strategies", "All of these"],
        correctAnswer: "All of these"
    },
    {
        questionText: "Which of the following requirement must be fulfilled before a digital strategy is formed?",
        options: ["Mapping customer expectations", "Finalizing the capital budget", "Choosing the right security program", "Installing good workforce practices"],
        correctAnswer: "Mapping customer expectations"
    },
    {
        questionText: "What is data about data called?",
        options: ["Organic data", "Metadata", "Inorganic data", "Crucial data"],
        correctAnswer: "Metadata"
    },
    {
        questionText: "While merging two branches in Git, the branch to which the merge is happening is called ______ branch.",
        options: ["Receiving", "Updated", "Merging", "New"],
        correctAnswer: "Receiving"
    },
    {
        questionText: "How many sub mechanisms are there in the synchronization mechanism of Git?",
        options: ["One", "Two", "Five", "Four"],
        correctAnswer: "Two"
    },
    {
        questionText: "A user's work in Git iterates over three states. Which of the following is one of them?",
        options: ["Committed", "Modified", "Staged", "All of these"],
        correctAnswer: "All of these"
    },
    {
        questionText: "______ refers to the process of obtaining a copy of an existing Git repository.",
        options: ["Committing", "Editing", "Deleting", "Cloning"],
        correctAnswer: "Cloning"
    },
    {
        questionText: "________ is a process that creates a copy of the repository from the server into the user's own account.",
        options: ["Pulling", "Forking", "Committing", "Versioning"],
        correctAnswer: "Forking"
    },
    {
        questionText: "Identify types of GitHub Pages sites. (Select all that apply)",
        options: ["Project", "User", "Organization", "Project, User, and Organization"],
        correctAnswer: "Project, User, and Organization"
    },
    {
        questionText: "Identify which one of the following is not a reason for version control.",
        options: ["Managing several copies of files", "Allowing easy collaboration", "Increasing the speed of execution of project files", "Maintaining history"],
        correctAnswer: "Increasing the speed of execution of project files"
    },
    {
        questionText: "______ partitioning splits the table into multiple tables with only few columns from the original table.",
        options: ["Straight", "Diagonal", "Vertical", "Horizontal"],
        correctAnswer: "Vertical"
    },
    {
        questionText: "_______ refers to the performance increase of any given system.",
        options: ["Excellence", "Effectiveness", "Efficiency", "Optimization"],
        correctAnswer: "Optimization"
    },
    {
        questionText: "What is the time taken for the database to respond to any query referred to as?",
        options: ["Employment Time", "Execution Time", "Time Travel", "Working Mechanism"],
        correctAnswer: "Execution Time"
    },
    {
        questionText: "______ in DBMS is the process of improving the performance of data storage resources.",
        options: ["Storage management", "Secret management", "Storage system", "Sharing data"],
        correctAnswer: "Storage management"
    },
    {
        questionText: "_______ allows the central processing unit of the server to access the data without using other devices?",
        options: ["Tertiary storage", "Secondary storage", "Primary storage or memory", "Master storage"],
        correctAnswer: "Primary storage or memory"
    },
    {
        questionText: "Which of the following are the benefits of optimization of a query?",
        options: ["Improves the speed at which queries execute", "Aids in management process", "Reduces cost or price of hardware", "All of these"],
        correctAnswer: "All of these"
    },
    {
        questionText: "Which query provides the time duration of query execution?",
        options: ["Appear_ALL", "Showcase Data", "show profiles", "Share Profiles"],
        correctAnswer: "show profiles"
    },
    {
        questionText: "Arrange the following stages involved in MySQL Replication process:\n1. Slaves should be in connection with the master and ready to retrieve the data.\n2. All operations related to databases should be copied to the master's binary log.\n3. Application of the binary log to its real log is then taken care of by the slave.\n4. The slave servers get the master's binary log.",
        options: ["3, 4, 2, and 1", "1, 3, 4, and 2", "4, 1, 2, and 3", "2, 1, 4, and 3"],
        correctAnswer: "2, 1, 4, and 3"
    },
    {
        questionText: "Which of the following are the uses of partitioning? (Select all that apply)",
        options: [
            "Improves quality of data",
            "Queries cannot run faster",
            "Stores huge data in a single table",
            "Provides a mechanism for dividing data by usage pattern and stores huge data in multiple tables"
        ],
        correctAnswer: "Provides a mechanism for dividing data by usage pattern and stores huge data in multiple tables"
    },
    {
        questionText: "XML inherited DTDs from _____ which is an international standard for markup languages.",
        options: ["troff and TEX", "GML", "SGML", "HTML"],
        correctAnswer: "SGML"
    },
    {
        questionText: "Match the following (minOccurs, maxOccurs) with the number of times the element can occur:\n\nLeft:\nA1) 0,1\nA2) 1,1\nA3) 0,*\nA4) 1,*\n\nMatches:\nB1) 0 or 1\nB2) At least once\nB3) 1\nB4) Infinite",
        options: [
            "A1-B1, A2-B3, A3-B4, A4-B2",
            "A1-B2, A2-B1, A3-B3, A4-B4",
            "A1-B3, A2-B4, A3-B1, A4-B2",
            "A1-B4, A2-B2, A3-B1, A4-B3"
        ],
        correctAnswer: "A1-B1, A2-B3, A3-B4, A4-B2"
    },
    {
        questionText: "Match the Column:\n\nLeft:\nA1) fractionDigits\nA2) Enumeration\nA3) whiteSpace\nA4) pattern\n\nMatches:\nB1) Specifies an allowable value in an enumerated list.\nB2) Restrict string types.\nB3) Specifies the number of fractional digits in a numeric type.\nB4) Specifies how whitespace should be treated within the type.",
        options: [
            "A1-B3, A2-B1, A3-B4, A4-B2",
            "A1-B1, A2-B3, A3-B2, A4-B4",
            "A1-B4, A2-B2, A3-B1, A4-B3",
            "A1-B2, A2-B4, A3-B3, A4-B1"
        ],
        correctAnswer: "A1-B3, A2-B1, A3-B4, A4-B2"
    },
    {
        questionText: "Which of the following does the code below represent?\n\n<xs:complexType name=\"Books\">\n <xs:simpleContent>\n <xs:extension base=\"xs:string\">\n <xs:attribute name=\"BookCode\" type=\"xs:positiveInteger\"/>\n </xs:extension>\n </xs:simpleContent>\n</xs:complexType>",
        options: ["Empty Elements", "Mixed", "Only Elements", "Only Text"],
        correctAnswer: "Only Text"
    },
    {
        questionText: "Which of the following MIME types is the unofficial one for JSON?",
        options: ["text/Json", "document/Json", "JavaScript/Json", "application/Json"],
        correctAnswer: "application/Json"
    },
    {
        questionText: "Which of the following is a drawback of a document-oriented database?",
        options: ["Tight coupling", "Abstraction between logical and physical data", "Normalization", "Partial document navigation"],
        correctAnswer: "Normalization"
    },
    {
        questionText: "Which of the following functions resolves the XSS and CSRF issues?",
        options: ["jsoneval()", "jsonparse()", "jsonstring()", "jsonify()"],
        correctAnswer: "jsonparse()"
    },
    {
        questionText: "A series of zero or more Unicode characters within double quotes, with backslash escapes, is termed as _____.",
        options: ["Array", "String", "Object", "Number"],
        correctAnswer: "String"
    },
    {
        questionText: "Which of the following Gson methods are useful for implementing JSON? (Select all that apply)",
        options: ["json_encode()", "json_decode()", "Both toJson() and fromJson()", "json_encode() and json_decode()"],
        correctAnswer: "Both toJson() and fromJson()"
    },
    {
        questionText: "Which pane displays the contents of the selected file?",
        options: ["Source Panel", "File Navigator Pane", "Code Editor Pane", "JavaScript Debugging Pane"],
        correctAnswer: "Code Editor Pane"
    },
    {
        questionText: "Which tab allows verification of values of variables?",
        options: ["Script Tab", "Debugger Tab", "Multi Line Mode Tab", "Style Editor Tab"],
        correctAnswer: "Debugger Tab"
    },
    {
        questionText: "What is the purpose of using an API?",
        options: [
            "To retain functional code quality while reducing the size",
            "To help import a complex functionality into a code",
            "To compile and transcode JavaScript",
            "To check form values and send alerts to the browser"
        ],
        correctAnswer: "To help import a complex functionality into a code"
    },
    {
        questionText: "What type of API provides an improved user experience and performance?",
        options: [
            "Simple Object Access Protocol API",
            "Representational State Transfer API",
            "Remote Procedure Call API",
            "Responsive API"
        ],
        correctAnswer: "Representational State Transfer API"
    },
    {
        questionText: "Which are the commonly used methods to fetch the content of an HTML element?",
        options: [
            "document.getElementById, getElementsByTagName",
            "JSON.parse(), document.removeChild(element)",
            "document.createElement(element), element.style.property = new style, element.setAttribute(attribute, value), getElementsByTagName",
            "None of these"
        ],
        correctAnswer: "document.getElementById, getElementsByTagName"
    },
    {
        questionText: "There are many APIs built on top of JavaScript that can deal with _____, _____ and _____ of DOM.",
        options: ["text, events, and objects", "tools, routines, and protocols", "events, routines, and objects", "tools, objects, and protocols"],
        correctAnswer: "events, routines, and objects"
    },
    {
        questionText: "What are the different types of messages displayed in the Web Console of Firefox's Web Developer?",
        options: [
            "Network Requests, JavaScript and CSS Error Messages, Security Errors and Warnings",
            "Logged messages, Web page's JavaScript, Breakpoints",
            "Network Requests, Debug Messages, Web page's JavaScript",
            "Logged messages, Debug Messages, Breakpoints"
        ],
        correctAnswer: "Network Requests, JavaScript and CSS Error Messages, Security Errors and Warnings"
    },
    {
        questionText: "Which of these is the correct code to check if the Web Worker feature is supported by the browser?",
        options: [
            "if (typeof(Worker) !== 'undefined') { /* use Web Worker */ } else { alert(\"Web workers are not supported by this Browser!\"); }",
            "if (Worker) { alert(\"Web workers is supported by this Browser!\") } else { alert(\"Web workers are not supported by this Browser!\"); }",
            "if (Worker === 'undefined') { alert(\"Web workers are not supported by this Browser!\"); return; } else { /* do something */ }",
            "if (Worker === null) { alert(\"Web workers are not supported by this Browser!\"); return; } else { /* do something */ }"
        ],
        correctAnswer: "if (typeof(Worker) !== 'undefined') { /* use Web Worker */ } else { alert(\"Web workers are not supported by this Browser!\"); }"
    },
    {
        questionText: "Rearrange the steps to depict how server-side scripts process requests from a user.\nA. The Web server processes the user request.\nB. The user makes a request from the browser.\nC. The DB is queried and the result is sent back to the server.\nD. The Web server passes the request to DB.\nE. The output is displayed in the browser for the user.",
        options: ["B, A, D, C, E", "A, E, B, C, D", "C, E, D, A, B", "D, A, E, B, C"],
        correctAnswer: "B, A, D, C, E"
    },
    {
        questionText: "Match the Regular expression patterns with their uses:\n\nLeft:\nA1) Brackets\nA2) Metacharacters\nA3) Quantifiers\n\nMatches:\nB1) Searches the match at the beginning of the word.\nB2) Specifies the number of occurrences for particular pattern.\nB3) Searches range of character between the brackets",
        options: [
            "A1-B3, A2-B1, A3-B2",
            "A1-B1, A2-B2, A3-B3",
            "A1-B2, A2-B3, A3-B1",
            "A1-B3, A2-B2, A3-B1"
        ],
        correctAnswer: "A1-B3, A2-B1, A3-B2"
    },
    {
        questionText: "Which of these is the correct code to create a class with attributes year of language and creator of that language?",
        options: [
            "function language(year, name) { this.year = year; this.creator = name; } var Visual_Basic = new language(1991, \"Alan Cooper\"); var Eiffel = new language(1983, \"Anders Hejlsberg\"); console.log(Visual_Basic.creator)",
            "function language(year, name) { year = year; creator = name; } var Visual_Basic = new language(1991, \"Alan Cooper\"); var Eiffel = new language(1983, \"Anders Hejlsberg\"); console.log(Visual_Basic.creator)",
            "function Language(year, name) { this.year = year; this.creator = name; } var Visual_Basic = new language(1991, \"Alan Cooper\"); var Eiffel = new language(1983, \"Anders Hejlsberg\"); console.log(creator)",
            "function (year) { this.year = year, this.creator = name; } var Visual_Basic = new language(1991, Alan Cooper); var Eiffel = new language(1983, Anders Hejlsberg); console.log(Visual_Basic.creator)"
        ],
        correctAnswer: "function language(year, name) { this.year = year; this.creator = name; } var Visual_Basic = new language(1991, \"Alan Cooper\"); var Eiffel = new language(1983, \"Anders Hejlsberg\"); console.log(Visual_Basic.creator)"
    },
    {
        questionText: "What is the Git equivalent of a locally created folder on a user's computer?",
        options: ["Repository", "Folder", "File", "Sub folder"],
        correctAnswer: "Repository"
    },
    {
        questionText: "Which of the following is at the heart of Git's version control process?",
        options: ["Branching", "A series of snapshots", "Locality", "All of these"],
        correctAnswer: "A series of snapshots"
    },
    {
        questionText: "What is essentially a connection established with an entity on a different machine?",
        options: ["Branch", "Repository", "Remote", "Directory"],
        correctAnswer: "Remote"
    },
    {
        questionText: "_________ maintains particulars of changes made to a file or set of files over a period of time.",
        options: ["Websites", "Internet protocol", "Search engine", "Version Control Systems"],
        correctAnswer: "Version Control Systems"
    },
    {
        questionText: "Which branch is responsible for controlling the entire workflow?",
        options: ["Sub branch", "Master Branch", "Lower branch", "Major branch"],
        correctAnswer: "Master Branch"
    },
    {
        questionText: "What is the Git equivalent of the MS-Word 'Save' command?",
        options: ["Commit", "Update", "Delete", "Save"],
        correctAnswer: "Commit"
    },
    {
        questionText: "Which of the following is an advantage of Git?",
        options: ["Provides implicit backup", "Brings along security", "Is free and open source", "All of these"],
        correctAnswer: "All of these"
    },
    {
        questionText: "The _________ revolution brought about a huge change in entrepreneurship.",
        options: ["Green", "White", "Industrial", "Golden"],
        correctAnswer: "Industrial"
    },
    {
        questionText: "Based on ownership, entrepreneurship can be classified into ___ types.",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: "Three"
    },
    {
        questionText: "A partnership deed contains details about ______.",
        options: [
            "The amount of stock purchased",
            "The names of prospective business clients",
            "The names and details of the partners",
            "The names of the business services and products"
        ],
        correctAnswer: "The names and details of the partners"
    },
    {
        questionText: "A group of people working together towards a similar goal or cause is called _____.",
        options: ["Team", "Business enterprise", "Entrepreneurship", "Organization"],
        correctAnswer: "Team"
    },
    {
        questionText: "Team norms are the ground rules by which team members operate _____.",
        options: ["Within their organization", "Within their team", "With external vendors", "With all office staff"],
        correctAnswer: "Within their team"
    },
    {
        questionText: "Which of the following is a strategy used in team collaborations?",
        options: ["Using right tools and techniques", "Never conducting impromptu meetings", "Closed communication between the team members", "Avoiding fun activities"],
        correctAnswer: "Using right tools and techniques"
    },
    {
        questionText: "Which of the following is true for digitally transforming processes?",
        options: [
            "It is optional and depends on the type of business.",
            "Hybrid IT services will be impacted.",
            "It results in accelerating workflows.",
            "It results in a less scalable environment."
        ],
        correctAnswer: "It results in accelerating workflows."
    },
    {
        questionText: "MySQL is based on _____ architecture.",
        options: ["Hierarchical", "Network", "Client/Server", "Object-Oriented"],
        correctAnswer: "Client/Server"
    },
    {
        questionText: "Which key is used to maintain uniqueness in the table?",
        options: ["Candidate", "Composite", "Foreign", "Primary"],
        correctAnswer: "Primary"
    },
    {
        questionText: "A _____ is a skeleton structure or logical configuration of a database.",
        options: ["Database schema", "Database system", "Database command", "Database Language"],
        correctAnswer: "Database schema"
    },
    {
        questionText: "Which DDL command is used to restructure the database, table, and database objects?",
        options: ["CREATE", "ALTER", "DROP", "TRUNCATE"],
        correctAnswer: "ALTER"
    },
    {
        questionText: "What is the use of the SELECT command in MySQL?",
        options: ["To insert the records into the table", "To modify data in a table", "To fetch or retrieve records from tables", "To delete all records"],
        correctAnswer: "To fetch or retrieve records from tables"
    },
    {
        questionText: "Which of the following are the disadvantages of the Object-Oriented Data Model?",
        options: [
            "It creates complexity and increases the cost",
            "It is not a universally agreed data model",
            "Lack of security support",
            "All of these"
        ],
        correctAnswer: "All of these"
    },
    {
        questionText: "_______ refers to storing data twice or duplicating data.",
        options: ["Drop", "Foreign Key", "Redundancy", "Index"],
        correctAnswer: "Redundancy"
    },
    {
        questionText: "What are the advantages of the Hierarchical Model?",
        options: [
            "Has limitations in representing the relationships",
            "Natural method of implementing records and their relationship",
            "Overall data model for the enterprise cannot be shown using this model",
            "Data integrity is not observed"
        ],
        correctAnswer: "Natural method of implementing records and their relationship"
    },
    {
        questionText: "The database table will be in the _____ if it contains two or more independent entities with different values in each entity.",
        options: ["3NF", "BCNF", "4NF", "6NF"],
        correctAnswer: "4NF"
    },
    {
        questionText: "The following are steps to create Internal DTDs. Arrange them in order:\n1. Declare all the possible elements.\n2. Declare all the possible element attributes.\n3. Set the attribute data types and values.\n4. Declare all the possible entities.\n5. Set the order in which elements must appear.\n6. Specify the permissible element children, if any.",
        options: ["1, 2, 3, 4, 5, 6", "2, 3, 5, 4, 1, 6", "1, 6, 5, 2, 3, 4", "5, 3, 6, 1, 2, 4"],
        correctAnswer: "1, 6, 5, 2, 3, 4"
    },
    {
        questionText: "Which of the following functions converts a JavaScript value into a JSON string?",
        options: ["JSON.string()", "JSON.stringify()", "JSON.tovalue()", "JSON.Jconvert()"],
        correctAnswer: "JSON.stringify()"
    },
    {
        questionText: "Which of the following PHP functions decodes JSON structures?",
        options: ["php_decode", "json_decode", "php_json_decode", "pi_decode"],
        correctAnswer: "json_decode"
    },
    {
        questionText: "Which of the following objects is used to read a JSON file and display its contents in the browser?",
        options: ["XMLJSONRequest", "HTTPJSONRequest", "XMLHttpRequest", "JSONHttpRequest"],
        correctAnswer: "XMLHttpRequest"
    },
    {
        questionText: "Which of the following keywords is used to create an object?",
        options: ["object", "New", "new", "class"],
        correctAnswer: "new"
    },
    {
        questionText: "__________ data type is used in a script wherever required to perform a task repeatedly.",
        options: ["Booleans", "Functions", "Strings", "Objects"],
        correctAnswer: "Functions"
    },
    {
        questionText: "What is the feature of a variable?",
        options: [
            "A variable must be declared before using it.",
            "A variable requires an application to process requests.",
            "A variable is used to download embedded scripts.",
            "A variable is simple and user friendly."
        ],
        correctAnswer: "A variable must be declared before using it."
    },
    {
        questionText: "Which among these predefined properties does RegExp have?",
        options: ["Pattern only", "Matcher and Madrid", "Pattern and Matcher", "Pattern and Madrid"],
        correctAnswer: "Pattern only"
    },
    {
        questionText: "What has 'name:value' pairs separated by a comma?",
        options: ["RegExp", "Object Literal", "Madrid", "Metacharacters"],
        correctAnswer: "Object Literal"
    },
    {
        questionText: "Identify the language from which JSON is derived.",
        options: ["JavaScript", "PHP", "C", "ECMAScript"],
        correctAnswer: "JavaScript"
    },
    {
        questionText: "JSON _____ specifies the rules that define the structure of a JSON document.",
        options: ["Schema", "Comments", "Metadata", "Hyper Schema"],
        correctAnswer: "Schema"
    },
    {
        questionText: "Which of the following JSON data structures can be sorted?",
        options: ["Dictionary", "Map", "Object", "Array"],
        correctAnswer: "Array"
    },
    {
        questionText: "Which of the following string types is used to represent a page break especially while printing, and as a part of text value or a URL respectively?",
        options: ["Form feed, Carriage return", "Reverse solidus, solidus", "Form feed, Solidus", "Form feed, Reverse solidus"],
        correctAnswer: "Form feed, Solidus"
    },
    {
        questionText: "Which of the following are valid JSON statements?",
        options: ["{}", "{\"p\":\", \"p\":\"q\"}", "{\"p\": [] \"x\":1}", "{1:\"X\", \"X\":1}"],
        correctAnswer: "{}"
    },
    {
        questionText: "Which of the following are characteristics of the object data type? (Select all that apply)",
        options: [
            "It is enclosed in square brackets []",
            "It is an ordered sequential array of values",
            "Key/value pairs are separated by semicolons (;)",
            "Non-sequential (unordered) set of key/value pairs enclosed in curly braces {} separated by commas with colon after keys"
        ],
        correctAnswer: "Non-sequential (unordered) set of key/value pairs enclosed in curly braces {} separated by commas with colon after keys"
    },
    {
        questionText: "Match the following:\n\nLeft:\nA1) List\nA2) Set\nA3) Map\nA4) Schema\n\nMatches:\nB1) Accepts data in the form of key and value pairs and each key is distinct.\nB2) Sets attributes to be used by the next transaction.\nB3) The elements follow a defined order and copies or duplicates are allowed.\nB4) Specifies the rules that define the structure of a JSON document.",
        options: [
            "A1-B3, A2-B2, A3-B1, A4-B4",
            "A1-B1, A2-B3, A3-B4, A4-B2",
            "A1-B2, A2-B1, A3-B3, A4-B4",
            "A1-B4, A2-B2, A3-B1, A4-B3"
        ],
        correctAnswer: "A1-B3, A2-B2, A3-B1, A4-B4"
    },
    {
        questionText: "An _____ in XML is a placeholder that consists of a name and a value.",
        options: ["DTD", "ELEMENT", "ENTITY", "Root element"],
        correctAnswer: "ENTITY"
    },
    {
        questionText: "Match the following (1,2,3,4) with (a,b,c,d):\n1. <xsl:template match=\"Greeting\">\n2. <xsl:template match=\"P//EM\">\n3. <xsl:template match=\"/\">\n4. <xsl:template match=\"Product\"> ... <xsl:apply-templates select=\"@Units\"/>\n\na) Matching by ancestry\nb) Matching by attribute\nc) Matching by name\nd) Matching by root",
        options: ["a-1, b-2, c-3, d-4", "a-1, b-3, c-2, d-4", "a-4, b-3, c-2, d-1", "a-2, b-4, c-1, d-3"],
        correctAnswer: "a-2, b-4, c-1, d-3"
    },
    {
        questionText: "_______ refers to adherence to basic XML syntax rules while _______ refers to adherence to the DTDs too.",
        options: ["Validity, Well-formed", "Well-formed, Validity", "Internal DTDs, Validity", "Well-formed, Internal DTDs"],
        correctAnswer: "Well-formed, Validity"
    },
    {
        questionText: "Which of the following does the syntax <!ELEMENT element-name (child-name*)> represent?",
        options: ["Only One Occurrence", "Minimum One Occurrence", "Zero or More Occurrences", "Zero or One Occurrences"],
        correctAnswer: "Zero or More Occurrences"
    },
    {
        questionText: "The _______ tool is an automation tool that helps to create models, views, and controllers pre-filled with a template.",
        options: ["command", "artisan", "PHP Dependency", "Framework"],
        correctAnswer: "artisan"
    },
    {
        questionText: "The ______ file in Windows is the first file that is referenced when the operating system tries to resolve a domain name.",
        options: ["hosts", "local", "public", ".yaml"],
        correctAnswer: "hosts"
    },
    {
        questionText: "_________ is an essential feature in Laravel that enables all application requests to direct towards its respective controller.",
        options: ["SSH", "Unit Testing", "Routing", "Migration System"],
        correctAnswer: "Routing"
    },
    {
        questionText: "Laravel recommends the use of ____ when writing codes.",
        options: ["Models", "Views", "Script", "Keys"],
        correctAnswer: "Models"
    },
    {
        questionText: "The _____ method uses the URI, two arguments, and the closure function that is executed in response to the URI.",
        options: ["put", "push", "get", "set"],
        correctAnswer: "get"
    },
    {
        questionText: "_______ helps in implementing CRUD operations.",
        options: ["Routes", "Eloquent ORM", "Operators", "DB query builder class"],
        correctAnswer: "Eloquent ORM"
    },
    {
        questionText: "Which of the following statements is TRUE?\n(1) The code folder inside the Homestead directory and the Homestead environment are the same.\n(2) By default, Laravel has a Route class, which has only one method to handle each type of HTTP request.",
        options: ["Both 1 and 2", "Only 2", "None of these", "Only 1"],
        correctAnswer: "None of these"
    },
    {
        questionText: "_____ refers to the concept of sending records in blocks.",
        options: ["Validation", "Pagination", "Routing", "Authentication"],
        correctAnswer: "Pagination"
    },
    {
        questionText: "The basic contents of a Web application are written in the _______.",
        options: ["template engine", "local file", "master template", "public folder"],
        correctAnswer: "template engine"
    },
    {
        questionText: "A ______ is a case where the attributes of a model are blindly updated.",
        options: ["Attribute", "Mass Assignment", "Static Controller", "Mighty Model"],
        correctAnswer: "Mass Assignment"
    },
    {
        questionText: "Match the following:\n\nLeft:\nA1) PHP\nA2) Composer\nA3) VirtualBox\nA4) Vagrant\nA5) GitBash\nA6) Homestead\n\nMatches:\nB1) Used to generate SSH Keys.\nB2) An automation tool for building and managing virtual machine environments.\nB3) A virtual environment that provides resource to efficiently code web applications in Laravel.\nB4) A dependency management tool for PHP.\nB5) Should be installed on the Windows host operating system to use Composer.\nB6) A free and open source hypervisor that allows running guest VMs.",
        options: [
            "A1-B5, A2-B4, A3-B6, A4-B2, A5-B1, A6-B3",
            "A1-B4, A2-B5, A3-B6, A4-B2, A5-B1, A6-B3",
            "A1-B5, A2-B4, A3-B2, A4-B6, A5-B3, A6-B1",
            "A1-B1, A2-B2, A3-B3, A4-B4, A5-B5, A6-B6"
        ],
        correctAnswer: "A1-B5, A2-B4, A3-B6, A4-B2, A5-B1, A6-B3"
    },
    {
        questionText: "The acronym for Hypertext Processor is _____.",
        options: ["HP", "PHP", "HTTP", "HTML"],
        correctAnswer: "PHP"
    },
    {
        questionText: "A ____ is a basic templating structure that is used to develop, test, and deploy applications rapidly and efficiently.",
        options: ["Template Engine", "Web Engine", "Framework", "Script"],
        correctAnswer: "Framework"
    },
    {
        questionText: "_________ is a development model that includes rapid prototyping.",
        options: ["Rapid Action Program", "Laravel Framework", "Templating", "Rapid Application Development"],
        correctAnswer: "Rapid Application Development"
    },
    {
        questionText: "The ____ directory includes the code that collates all files spread throughout the directory and runs the application.",
        options: ["bootstrap", "app", "config", "routes"],
        correctAnswer: "bootstrap"
    }
];

const data = {
    category: CATEGORY_NAME,
    session: SESSION_NUMBER,
    title: "Session 1: Full-Stack Web Development & DBMS (MySQL, Web/JS, XML & JSON, Laravel, PHP)",
    totalQuestions: questions.length,
    questions
};

fs.writeFileSync(path.resolve(__dirname, 'php_xml_json_laravel_mysql_javascript_session1.json'), JSON.stringify(data, null, 2), 'utf-8');
console.log(`Saved ${questions.length} questions to scripts/php_xml_json_laravel_mysql_javascript_session1.json`);

const escapeCsv = (val) => '"' + String(val || '').replace(/"/g, '""') + '"';
const csvRows = ['category,session,question_text,option1,option2,option3,option4,correct_answer'];
for (const q of questions) {
    csvRows.push([
        escapeCsv(CATEGORY_NAME),
        SESSION_NUMBER,
        escapeCsv(q.questionText),
        escapeCsv(q.options[0] || ''),
        escapeCsv(q.options[1] || ''),
        escapeCsv(q.options[2] || ''),
        escapeCsv(q.options[3] || ''),
        escapeCsv(q.correctAnswer)
    ].join(','));
}
fs.writeFileSync(path.resolve(__dirname, 'php_xml_json_laravel_mysql_javascript_session1.csv'), csvRows.join('\n'), 'utf-8');
console.log(`Saved ${questions.length} questions to scripts/php_xml_json_laravel_mysql_javascript_session1.csv`);
