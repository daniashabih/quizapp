/**
 * Comprehensive Session-Wise Question Bank for C# (15 Sessions, 713 Questions)
 * Category: C#
 */

const CSHARP_QUIZ_SESSIONS = {
    "1": "Getting Started with C#",
    "2": "Variables and Data Types",
    "3": "Statements and Operators",
    "4": "Programming Constructs and Arrays",
    "5": "Classes and Methods",
    "6": "Inheritance and Polymorphism",
    "7": "Abstract Classes and Interfaces",
    "8": "Properties, Indexers, and Record Types",
    "9": "Namespaces and Exception Handling",
    "10": "Events, Delegates, and Collections",
    "11": "Generics and Iterators",
    "12": "Advanced Concepts in C#",
    "13": "New Features of C# 9.0",
    "14": ".NET Core Development and the Future",
    "15": "GUI/Desktop Apps with C#"
};

const CSHARP_QUIZ_QUESTIONS = [
    {
        "id": "csharp_s01_q001",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The .NET Framework is primarily an infrastructure used to",
        "options": [
            "compile only C++ programs",
            "design hardware circuits",
            "build, deploy, and run applications and services using .NET technologies",
            "manage only database servers"
        ],
        "correctAnswer": "build, deploy, and run applications and services using .NET technologies",
        "explanation": "The correct answer is C) build, deploy, and run applications and services using .NET technologies. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q002",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which two basic technologies is the .NET Framework platform based on for communication of data?",
        "options": [
            "XML and the suite of Internet protocols",
            "JSON and FTP only",
            "HTML and CSS",
            "SQL and ODBC"
        ],
        "correctAnswer": "XML and the suite of Internet protocols",
        "explanation": "The correct answer is A) XML and the suite of Internet protocols. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q003",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which of the following is a key feature of XML?",
        "options": [
            "It replaces HTTP",
            "It is a compiled language",
            "It can only be used on Windows",
            "It separates actual data from presentation"
        ],
        "correctAnswer": "It separates actual data from presentation",
        "explanation": "The correct answer is D) It separates actual data from presentation. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q004",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "In the .NET Framework, source code is first compiled into",
        "options": [
            "native code directly",
            "CIL (formerly MSIL) stored in an assembly",
            "HTML",
            "Java bytecode"
        ],
        "correctAnswer": "CIL (formerly MSIL) stored in an assembly",
        "explanation": "The correct answer is B) CIL (formerly MSIL) stored in an assembly. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q005",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The former name of CIL was",
        "options": [
            "JIT",
            "CLS",
            "MSIL",
            "DLR"
        ],
        "correctAnswer": "MSIL",
        "explanation": "The correct answer is C) MSIL. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q006",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "CIL code is converted into native code at run time by the",
        "options": [
            "Visual Studio IDE",
            "Class Library",
            "Windows Registry",
            "Common Language Runtime (CLR)"
        ],
        "correctAnswer": "Common Language Runtime (CLR)",
        "explanation": "The correct answer is D) Common Language Runtime (CLR). (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q007",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The two core components of the .NET Framework are",
        "options": [
            "the CLS and the DLR",
            "the CLR and the .NET Framework class library",
            "ASP.NET and ADO.NET",
            "WPF and WCF"
        ],
        "correctAnswer": "the CLR and the .NET Framework class library",
        "explanation": "The correct answer is B) the CLR and the .NET Framework class library. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q008",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Applications that run under the control of the CLR are called",
        "options": [
            "script code",
            "managed code",
            "native code",
            "unmanaged code"
        ],
        "correctAnswer": "managed code",
        "explanation": "The correct answer is B) managed code. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q009",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which of the following is NOT a function of the CLR?",
        "options": [
            "Designing the user interface layout",
            "Code safety verification",
            "Garbage collection",
            "Memory management"
        ],
        "correctAnswer": "Designing the user interface layout",
        "explanation": "The correct answer is A) Designing the user interface layout. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q010",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The .NET Framework Class Library (FCL) is",
        "options": [
            "a text editor",
            "a comprehensive object-oriented collection of reusable types",
            "a database engine",
            "a hardware driver set"
        ],
        "correctAnswer": "a comprehensive object-oriented collection of reusable types",
        "explanation": "The correct answer is B) a comprehensive object-oriented collection of reusable types. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q011",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "A major goal of the .NET Framework is to promote",
        "options": [
            "platform dependence",
            "manual memory management",
            "code reusability",
            "vendor lock-in of data formats"
        ],
        "correctAnswer": "code reusability",
        "explanation": "The correct answer is C) code reusability. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q012",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The same Console.WriteLine() method is available across all .NET languages because",
        "options": [
            "the FCL is a common class library for all .NET languages",
            "it is a keyword in all languages",
            "the OS provides it",
            "every language has its own copy"
        ],
        "correctAnswer": "the FCL is a common class library for all .NET languages",
        "explanation": "The correct answer is A) the FCL is a common class library for all .NET languages. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q013",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The CLS (Common Language Specification) is",
        "options": [
            "a set of rules that any .NET language should follow to create applications",
            "a debugging tool",
            "a type of assembly",
            "a garbage collector"
        ],
        "correctAnswer": "a set of rules that any .NET language should follow to create applications",
        "explanation": "The correct answer is A) a set of rules that any .NET language should follow to create applications. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q014",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which .NET Framework version was the first to be released with Visual Studio .NET 2002?",
        "options": [
            ".NET Framework 4.0",
            ".NET Framework 3.5",
            ".NET Framework 2.0",
            ".NET Framework 1.0"
        ],
        "correctAnswer": ".NET Framework 1.0",
        "explanation": "The correct answer is D) .NET Framework 1.0. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q015",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Support for generic data structures and 64-bit hardware platforms was introduced in",
        "options": [
            ".NET Framework 1.1",
            ".NET Framework 1.0",
            ".NET Framework 2.0",
            ".NET Framework 4.8"
        ],
        "correctAnswer": ".NET Framework 2.0",
        "explanation": "The correct answer is C) .NET Framework 2.0. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q016",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "WPF, WCF, WF, and Windows CardSpace were introduced in",
        "options": [
            ".NET Framework 1.1",
            ".NET Framework 3.0",
            ".NET Framework 2.0",
            ".NET Framework 4.5"
        ],
        "correctAnswer": ".NET Framework 3.0",
        "explanation": "The correct answer is B) .NET Framework 3.0. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q017",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "LINQ (Language Integrated Query) was introduced with",
        "options": [
            ".NET Framework 3.0",
            ".NET Framework 2.0",
            ".NET Framework 3.5",
            ".NET Framework 1.1"
        ],
        "correctAnswer": ".NET Framework 3.5",
        "explanation": "The correct answer is C) .NET Framework 3.5. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q018",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The Dynamic Language Runtime (DLR) was a key feature of",
        "options": [
            ".NET Framework 1.1",
            ".NET Framework 4.0",
            ".NET Framework 3.0",
            ".NET Framework 2.0"
        ],
        "correctAnswer": ".NET Framework 4.0",
        "explanation": "The correct answer is B) .NET Framework 4.0. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q019",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The DLR enables .NET programmers to create applications using dynamic languages such as",
        "options": [
            "COBOL and Fortran",
            "Python and Ruby",
            "SQL and XML",
            "C and Pascal"
        ],
        "correctAnswer": "Python and Ruby",
        "explanation": "The correct answer is B) Python and Ruby. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q020",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The async and await keywords for asynchronous programming came with",
        "options": [
            ".NET Framework 2.0",
            ".NET Framework 4.5",
            ".NET Framework 3.5",
            ".NET Framework 1.0"
        ],
        "correctAnswer": ".NET Framework 4.5",
        "explanation": "The correct answer is B) .NET Framework 4.5. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q021",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which is the last version of the .NET Framework?",
        "options": [
            ".NET Framework 5.0",
            ".NET Framework 4.0",
            ".NET Framework 4.8",
            ".NET Framework 4.5"
        ],
        "correctAnswer": ".NET Framework 4.8",
        "explanation": "The correct answer is C) .NET Framework 4.8. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q022",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "For new development, Microsoft recommends using",
        "options": [
            ".NET Framework 1.1",
            ".NET Framework 2.0",
            ".NET Compact Framework",
            ".NET 5.0 or later"
        ],
        "correctAnswer": ".NET 5.0 or later",
        "explanation": "The correct answer is D) .NET 5.0 or later. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q023",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": ".NET 5.0 was introduced by Microsoft in",
        "options": [
            "November 2015",
            "November 2010",
            "November 2020",
            "November 2002"
        ],
        "correctAnswer": "November 2020",
        "explanation": "The correct answer is C) November 2020. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q024",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": ".NET 5.0 combines",
        "options": [
            ".NET Core with .NET Framework into a unified platform",
            "Mono with Xamarin only",
            "C++ with Python",
            "Java with C#"
        ],
        "correctAnswer": ".NET Core with .NET Framework into a unified platform",
        "explanation": "The correct answer is A) .NET Core with .NET Framework into a unified platform. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q025",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Code Access Security (CAS) is",
        "options": [
            "a database feature",
            "a security mechanism ensuring only trusted code performs critical actions",
            "a network protocol",
            "an IDE debugging tool"
        ],
        "correctAnswer": "a security mechanism ensuring only trusted code performs critical actions",
        "explanation": "The correct answer is B) a security mechanism ensuring only trusted code performs critical actions. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q026",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The .NET Compact Framework provides components for",
        "options": [
            "applications on mobile phones and PDAs",
            "supercomputers",
            "mainframe computers",
            "web servers only"
        ],
        "correctAnswer": "applications on mobile phones and PDAs",
        "explanation": "The correct answer is A) applications on mobile phones and PDAs. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q027",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "C# is an object-oriented language derived from",
        "options": [
            "Pascal and Fortran",
            "Assembly and COBOL",
            "C and C++",
            "Python and Perl"
        ],
        "correctAnswer": "C and C++",
        "explanation": "The correct answer is C) C and C++. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q028",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "C# is best described as a",
        "options": [
            "query language",
            "markup language",
            "type-safe, object-oriented programming language",
            "scripting-only language"
        ],
        "correctAnswer": "type-safe, object-oriented programming language",
        "explanation": "The correct answer is C) type-safe, object-oriented programming language. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q029",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which feature of C# automatically allocates and releases memory?",
        "options": [
            "Manual free()",
            "Automatic memory management (garbage collection)",
            "Pointers",
            "Macros"
        ],
        "correctAnswer": "Automatic memory management (garbage collection)",
        "explanation": "The correct answer is B) Automatic memory management (garbage collection). (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q030",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Garbage collection in the CLR is used to",
        "options": [
            "format the screen",
            "reclaim memory occupied by objects no longer in use",
            "compile source code",
            "encrypt data"
        ],
        "correctAnswer": "reclaim memory occupied by objects no longer in use",
        "explanation": "The correct answer is B) reclaim memory occupied by objects no longer in use. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q031",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which of the following is an advantage of C#?",
        "options": [
            "It requires manual memory deallocation",
            "It is simple and modern with built-in garbage collection",
            "It cannot be used for web apps",
            "It does not support OOP"
        ],
        "correctAnswer": "It is simple and modern with built-in garbage collection",
        "explanation": "The correct answer is B) It is simple and modern with built-in garbage collection. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q032",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The version of C# covered in this book is",
        "options": [
            "C# 1.0",
            "C# 9.0",
            "C# 3.0",
            "C# 12.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is B) C# 9.0. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q033",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The IDE used in this book for C# development is",
        "options": [
            "Xcode",
            "NetBeans",
            "Eclipse",
            "Visual Studio 2019"
        ],
        "correctAnswer": "Visual Studio 2019",
        "explanation": "The correct answer is D) Visual Studio 2019. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q034",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which of the following is NOT an edition of Visual Studio 2019?",
        "options": [
            "Ultimate",
            "Professional",
            "Community",
            "Enterprise"
        ],
        "correctAnswer": "Ultimate",
        "explanation": "The correct answer is A) Ultimate. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q035",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which Visual Studio 2019 edition is free for students and individual developers?",
        "options": [
            "Enterprise",
            "Team",
            "Professional",
            "Community"
        ],
        "correctAnswer": "Community",
        "explanation": "The correct answer is D) Community. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q036",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which of these languages can be used in Visual Studio 2019?",
        "options": [
            "Only Python",
            "Only Java",
            "Only C#",
            "C#, Visual Basic, and C++"
        ],
        "correctAnswer": "C#, Visual Basic, and C++",
        "explanation": "The correct answer is D) C#, Visual Basic, and C++. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q037",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "In Visual Studio, which window displays the files and projects of a solution?",
        "options": [
            "Error List",
            "Solution Explorer",
            "Toolbox",
            "Output window"
        ],
        "correctAnswer": "Solution Explorer",
        "explanation": "The correct answer is B) Solution Explorer. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q038",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which window in Visual Studio is used to view and change properties of selected items?",
        "options": [
            "Output window",
            "Properties window",
            "Solution Explorer",
            "Start page"
        ],
        "correctAnswer": "Properties window",
        "explanation": "The correct answer is B) Properties window. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q039",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which Visual Studio window shows build messages?",
        "options": [
            "Properties window",
            "Toolbox",
            "Class View",
            "Output window"
        ],
        "correctAnswer": "Output window",
        "explanation": "The correct answer is D) Output window. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q040",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The Toolbox in Visual Studio is mainly used to",
        "options": [
            "drag and drop controls onto a form",
            "view build output",
            "manage NuGet only",
            "show memory usage"
        ],
        "correctAnswer": "drag and drop controls onto a form",
        "explanation": "The correct answer is A) drag and drop controls onto a form. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q041",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which feature of the IDE provides code completion suggestions while typing?",
        "options": [
            "Debugger",
            "IntelliSense",
            "Object Browser",
            "Profiler"
        ],
        "correctAnswer": "IntelliSense",
        "explanation": "The correct answer is B) IntelliSense. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q042",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which shortcut key builds the solution in Visual Studio?",
        "options": [
            "Alt+F4",
            "F1",
            "Ctrl+Z",
            "Ctrl+Shift+B"
        ],
        "correctAnswer": "Ctrl+Shift+B",
        "explanation": "The correct answer is D) Ctrl+Shift+B. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q043",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which shortcut key runs the application with debugging in Visual Studio?",
        "options": [
            "F5",
            "F1",
            "Ctrl+S",
            "F12"
        ],
        "correctAnswer": "F5",
        "explanation": "The correct answer is A) F5. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q044",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which shortcut runs the application without debugging?",
        "options": [
            "Ctrl+F5",
            "Shift+F5",
            "F9",
            "F5"
        ],
        "correctAnswer": "Ctrl+F5",
        "explanation": "The correct answer is A) Ctrl+F5. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q045",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which type of project would you choose for a basic text-based C# program?",
        "options": [
            "WPF only",
            "Windows Forms only",
            "Console App",
            "Class Library only"
        ],
        "correctAnswer": "Console App",
        "explanation": "The correct answer is C) Console App. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q046",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The file extension of a C# source file is",
        "options": [
            ".cpp",
            ".java",
            ".vb",
            ".cs"
        ],
        "correctAnswer": ".cs",
        "explanation": "The correct answer is D) .cs. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q047",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The entry point of a C# console application is the",
        "options": [
            "Run() method",
            "Main() method",
            "Init() method",
            "Start() method"
        ],
        "correctAnswer": "Main() method",
        "explanation": "The correct answer is B) Main() method. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q048",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Which statement displays text in a console application?",
        "options": [
            "System.out.println(\"Hello\");",
            "echo \"Hello\";",
            "Console.WriteLine(\"Hello\");",
            "print(\"Hello\");"
        ],
        "correctAnswer": "Console.WriteLine(\"Hello\");",
        "explanation": "The correct answer is C) Console.WriteLine(\"Hello\");. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q049",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "Console.ReadLine() returns data of type",
        "options": [
            "object",
            "char",
            "int",
            "string"
        ],
        "correctAnswer": "string",
        "explanation": "The correct answer is D) string. (Getting Started with C#)"
    },
    {
        "id": "csharp_s01_q050",
        "category": "C#",
        "session": 1,
        "sessionTitle": "Getting Started with C#",
        "questionText": "The Microsoft intermediate-language code and metadata of a .NET application are stored in a file called",
        "options": [
            "an assembly",
            "a manifest-free script",
            "a header",
            "a DLL registry"
        ],
        "correctAnswer": "an assembly",
        "explanation": "The correct answer is A) an assembly. (Getting Started with C#)"
    },
    {
        "id": "csharp_s02_q001",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "A variable in C# is",
        "options": [
            "a fixed constant",
            "a keyword",
            "a named memory location that stores a value",
            "a type of loop"
        ],
        "correctAnswer": "a named memory location that stores a value",
        "explanation": "The correct answer is C) a named memory location that stores a value. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q002",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which of the following is a valid C# variable name?",
        "options": [
            "my-var",
            "class",
            "_count",
            "2count"
        ],
        "correctAnswer": "_count",
        "explanation": "The correct answer is C) _count. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q003",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which of these is NOT a valid identifier?",
        "options": [
            "_value",
            "Value",
            "1stValue",
            "value1"
        ],
        "correctAnswer": "1stValue",
        "explanation": "The correct answer is C) 1stValue. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q004",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "C# is a case-sensitive language, so",
        "options": [
            "only lowercase is allowed",
            "only uppercase is allowed",
            "Total and total are different identifiers",
            "Total and total are the same"
        ],
        "correctAnswer": "Total and total are different identifiers",
        "explanation": "The correct answer is C) Total and total are different identifiers. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q005",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The size of an int in C# is",
        "options": [
            "64 bits",
            "16 bits",
            "8 bits",
            "32 bits"
        ],
        "correctAnswer": "32 bits",
        "explanation": "The correct answer is D) 32 bits. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q006",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which data type stores a single Unicode character?",
        "options": [
            "string",
            "char",
            "sbyte",
            "byte"
        ],
        "correctAnswer": "char",
        "explanation": "The correct answer is B) char. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q007",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The size of a char in C# is",
        "options": [
            "64 bits",
            "32 bits",
            "8 bits",
            "16 bits"
        ],
        "correctAnswer": "16 bits",
        "explanation": "The correct answer is D) 16 bits. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q008",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which data type is best for money-related calculations needing high precision?",
        "options": [
            "int",
            "byte",
            "decimal",
            "float"
        ],
        "correctAnswer": "decimal",
        "explanation": "The correct answer is C) decimal. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q009",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which suffix is used for a float literal?",
        "options": [
            "l",
            "f",
            "m",
            "d"
        ],
        "correctAnswer": "f",
        "explanation": "The correct answer is B) f. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q010",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which suffix denotes a long literal?",
        "options": [
            "S",
            "M",
            "F",
            "L"
        ],
        "correctAnswer": "L",
        "explanation": "The correct answer is D) L. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q011",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The byte data type holds values in the range",
        "options": [
            "-255 to 255",
            "0 to 255",
            "0 to 65535",
            "-128 to 127"
        ],
        "correctAnswer": "0 to 255",
        "explanation": "The correct answer is B) 0 to 255. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q012",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The sbyte data type holds values in the range",
        "options": [
            "-256 to 255",
            "0 to 255",
            "-128 to 127",
            "0 to 127"
        ],
        "correctAnswer": "-128 to 127",
        "explanation": "The correct answer is C) -128 to 127. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q013",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The bool data type can hold",
        "options": [
            "true or false",
            "yes or no",
            "0 or 1 only",
            "any integer"
        ],
        "correctAnswer": "true or false",
        "explanation": "The correct answer is A) true or false. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q014",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Value types in C# are stored in",
        "options": [
            "always the heap",
            "a database",
            "the stack (typically)",
            "the registry"
        ],
        "correctAnswer": "the stack (typically)",
        "explanation": "The correct answer is C) the stack (typically). (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q015",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Reference types store",
        "options": [
            "the actual value on the stack",
            "only constants",
            "a reference to the object located on the heap",
            "only integers"
        ],
        "correctAnswer": "a reference to the object located on the heap",
        "explanation": "The correct answer is C) a reference to the object located on the heap. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q016",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which of the following is a reference type?",
        "options": [
            "bool",
            "string",
            "double",
            "int"
        ],
        "correctAnswer": "string",
        "explanation": "The correct answer is B) string. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q017",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which of the following is a value type?",
        "options": [
            "struct",
            "object",
            "class",
            "string"
        ],
        "correctAnswer": "struct",
        "explanation": "The correct answer is A) struct. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q018",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The keyword var is used for",
        "options": [
            "dynamic typing at run time",
            "implicitly typed local variables",
            "global variables",
            "constants"
        ],
        "correctAnswer": "implicitly typed local variables",
        "explanation": "The correct answer is B) implicitly typed local variables. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q019",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which declaration using var is INVALID?",
        "options": [
            "var d = 3.5;",
            "var x = 10;",
            "var x;",
            "var s = \"text\";"
        ],
        "correctAnswer": "var x;",
        "explanation": "The correct answer is C) var x;. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q020",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Implicitly typed variables using var must",
        "options": [
            "be of type object",
            "be initialized at the time of declaration",
            "be declared as fields",
            "be assigned null"
        ],
        "correctAnswer": "be initialized at the time of declaration",
        "explanation": "The correct answer is B) be initialized at the time of declaration. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q021",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "What is the type of var n = 5.5;?",
        "options": [
            "float",
            "decimal",
            "double",
            "int"
        ],
        "correctAnswer": "double",
        "explanation": "The correct answer is C) double. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q022",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "A multi-line comment is enclosed in",
        "options": [
            "/* and */",
            "<!-- and -->",
            "{# and #}",
            "// and //"
        ],
        "correctAnswer": "/* and */",
        "explanation": "The correct answer is A) /* and */. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q023",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "XML documentation comments begin with",
        "options": [
            "//",
            "/*",
            "///",
            "##"
        ],
        "correctAnswer": "///",
        "explanation": "The correct answer is C) ///. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q024",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which XML documentation tag describes a method's parameter?",
        "options": [
            "<returns>",
            "<remarks>",
            "<param>",
            "<summary>"
        ],
        "correctAnswer": "<param>",
        "explanation": "The correct answer is C) <param>. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q025",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which XML tag provides a summary of a type or member?",
        "options": [
            "<summary>",
            "<see>",
            "<value>",
            "<param>"
        ],
        "correctAnswer": "<summary>",
        "explanation": "The correct answer is A) <summary>. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q026",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The const keyword is used to",
        "options": [
            "declare a loop",
            "declare a value that cannot change after declaration",
            "declare a class",
            "create an object"
        ],
        "correctAnswer": "declare a value that cannot change after declaration",
        "explanation": "The correct answer is B) declare a value that cannot change after declaration. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q027",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "A const field must",
        "options": [
            "be assigned in a constructor",
            "be initialized at the time of declaration",
            "be declared without a value",
            "be changed at run time"
        ],
        "correctAnswer": "be initialized at the time of declaration",
        "explanation": "The correct answer is B) be initialized at the time of declaration. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q028",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which declaration of a constant is correct?",
        "options": [
            "const double PI = 3.14;",
            "constant double PI = 3.14;",
            "const double PI;",
            "double const PI = 3.14;"
        ],
        "correctAnswer": "const double PI = 3.14;",
        "explanation": "The correct answer is A) const double PI = 3.14;. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q029",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "A literal is",
        "options": [
            "a keyword",
            "a variable name",
            "a fixed value written directly in code",
            "a method"
        ],
        "correctAnswer": "a fixed value written directly in code",
        "explanation": "The correct answer is C) a fixed value written directly in code. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q030",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In the statement int x = 10;, the value 10 is a",
        "options": [
            "operator",
            "keyword",
            "literal",
            "identifier"
        ],
        "correctAnswer": "literal",
        "explanation": "The correct answer is C) literal. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q031",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "To use a keyword as an identifier you can prefix it with",
        "options": [
            "@",
            "&",
            "$",
            "#"
        ],
        "correctAnswer": "@",
        "explanation": "The correct answer is A) @. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q032",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The escape sequence for a new line is",
        "options": [
            "\\n",
            "\\r\\n only",
            "\\t",
            "\\b"
        ],
        "correctAnswer": "\\n",
        "explanation": "The correct answer is A) \\n. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q033",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The escape sequence for a horizontal tab is",
        "options": [
            "\\n",
            "\\h",
            "\\s",
            "\\t"
        ],
        "correctAnswer": "\\t",
        "explanation": "The correct answer is D) \\t. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q034",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "To print a backslash in a string you write",
        "options": [
            "\\/",
            "\\\\",
            "\\b",
            "//"
        ],
        "correctAnswer": "\\\\",
        "explanation": "The correct answer is B) \\\\. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q035",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "A verbatim string literal is prefixed with",
        "options": [
            "@",
            "%",
            "#",
            "$"
        ],
        "correctAnswer": "@",
        "explanation": "The correct answer is A) @. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q036",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which method outputs text and moves to a new line?",
        "options": [
            "Console.Write()",
            "Console.WriteLine()",
            "Console.Clear()",
            "Console.Read()"
        ],
        "correctAnswer": "Console.WriteLine()",
        "explanation": "The correct answer is B) Console.WriteLine(). (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q037",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which method outputs text without adding a newline?",
        "options": [
            "Console.Write()",
            "Console.WriteLine()",
            "Console.ReadLine()",
            "Console.Beep()"
        ],
        "correctAnswer": "Console.Write()",
        "explanation": "The correct answer is A) Console.Write(). (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q038",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In Console.WriteLine(\"{0} {1}\", a, b); the {0} and {1} are",
        "options": [
            "comments",
            "escape sequences",
            "keywords",
            "placeholders"
        ],
        "correctAnswer": "placeholders",
        "explanation": "The correct answer is D) placeholders. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q039",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "Which method reads a whole line of text?",
        "options": [
            "Console.ReadAll()",
            "Console.Input()",
            "Console.Read()",
            "Console.ReadLine()"
        ],
        "correctAnswer": "Console.ReadLine()",
        "explanation": "The correct answer is D) Console.ReadLine(). (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q040",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "To convert a string \"25\" to an int you can use",
        "options": [
            "Convert.Str(\"25\")",
            "Int.Make(\"25\")",
            "Convert.ToInt32(\"25\")",
            "(int)\"25\""
        ],
        "correctAnswer": "Convert.ToInt32(\"25\")",
        "explanation": "The correct answer is C) Convert.ToInt32(\"25\"). (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q041",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The standard numeric format specifier for currency is",
        "options": [
            "D",
            "C",
            "P",
            "E"
        ],
        "correctAnswer": "C",
        "explanation": "The correct answer is B) C. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q042",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The standard numeric format specifier for percentage is",
        "options": [
            "N",
            "C",
            "F",
            "P"
        ],
        "correctAnswer": "P",
        "explanation": "The correct answer is D) P. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q043",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The numeric format specifier for hexadecimal is",
        "options": [
            "X",
            "D",
            "N",
            "H"
        ],
        "correctAnswer": "X",
        "explanation": "The correct answer is A) X. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q044",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The format specifier \"F2\" displays a number with",
        "options": [
            "two digits before the decimal point",
            "a two-character prefix",
            "two significant bytes",
            "two digits after the decimal point"
        ],
        "correctAnswer": "two digits after the decimal point",
        "explanation": "The correct answer is D) two digits after the decimal point. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q045",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In custom numeric formatting, which character is a digit placeholder that shows a digit or zero?",
        "options": [
            "%",
            "0",
            "#",
            ","
        ],
        "correctAnswer": "0",
        "explanation": "The correct answer is B) 0. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q046",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In custom numeric formats, the # character",
        "options": [
            "shows percent",
            "shows exponent",
            "shows a currency symbol",
            "is a digit placeholder that shows no leading/trailing zero"
        ],
        "correctAnswer": "is a digit placeholder that shows no leading/trailing zero",
        "explanation": "The correct answer is D) is a digit placeholder that shows no leading/trailing zero. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q047",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "The standard date format specifier \"D\" displays",
        "options": [
            "the time only",
            "the long date pattern",
            "the short date pattern",
            "the month/day only"
        ],
        "correctAnswer": "the long date pattern",
        "explanation": "The correct answer is B) the long date pattern. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q048",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In custom DateTime format strings, \"yyyy\" represents",
        "options": [
            "the four-digit year",
            "the two-digit year",
            "the month",
            "the day"
        ],
        "correctAnswer": "the four-digit year",
        "explanation": "The correct answer is A) the four-digit year. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q049",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In custom DateTime format strings, \"MM\" represents",
        "options": [
            "the second",
            "the minute",
            "the day",
            "the month as two digits"
        ],
        "correctAnswer": "the month as two digits",
        "explanation": "The correct answer is D) the month as two digits. (Variables and Data Types)"
    },
    {
        "id": "csharp_s02_q050",
        "category": "C#",
        "session": 2,
        "sessionTitle": "Variables and Data Types",
        "questionText": "In custom DateTime format strings, \"mm\" represents",
        "options": [
            "the millisecond",
            "the minute",
            "the month",
            "the day"
        ],
        "correctAnswer": "the minute",
        "explanation": "The correct answer is B) the minute. (Variables and Data Types)"
    },
    {
        "id": "csharp_s03_q001",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "A statement in C# is",
        "options": [
            "only a comment",
            "a complete instruction that performs an action",
            "a variable name",
            "a namespace"
        ],
        "correctAnswer": "a complete instruction that performs an action",
        "explanation": "The correct answer is B) a complete instruction that performs an action. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q002",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Every simple statement in C# ends with",
        "options": [
            "a semicolon",
            "a comma",
            "a colon",
            "a period"
        ],
        "correctAnswer": "a semicolon",
        "explanation": "The correct answer is A) a semicolon. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q003",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "A group of statements enclosed in { } is called",
        "options": [
            "an array",
            "a block",
            "a literal",
            "an expression"
        ],
        "correctAnswer": "a block",
        "explanation": "The correct answer is B) a block. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q004",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which is a declaration statement?",
        "options": [
            "return;",
            "if (x > 0)",
            "int total = 0;",
            "total++;"
        ],
        "correctAnswer": "int total = 0;",
        "explanation": "The correct answer is C) int total = 0;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q005",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which of the following is an expression statement?",
        "options": [
            "break;",
            "x = y + 5;",
            "int x;",
            "namespace A;"
        ],
        "correctAnswer": "x = y + 5;",
        "explanation": "The correct answer is B) x = y + 5;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q006",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "An expression in C# is",
        "options": [
            "a comment",
            "a block of statements",
            "a class definition",
            "a combination of operands and operators that evaluates to a value"
        ],
        "correctAnswer": "a combination of operands and operators that evaluates to a value",
        "explanation": "The correct answer is D) a combination of operands and operators that evaluates to a value. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q007",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The key difference between a statement and an expression is that an expression",
        "options": [
            "produces a value, while a statement performs an action",
            "can't contain operators",
            "never produces a value",
            "is always a loop"
        ],
        "correctAnswer": "produces a value, while a statement performs an action",
        "explanation": "The correct answer is A) produces a value, while a statement performs an action. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q008",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The checked keyword is used to",
        "options": [
            "enable overflow checking for arithmetic operations",
            "disable the compiler",
            "create constants",
            "declare arrays"
        ],
        "correctAnswer": "enable overflow checking for arithmetic operations",
        "explanation": "The correct answer is A) enable overflow checking for arithmetic operations. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q009",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "When a checked block overflows, C# throws",
        "options": [
            "OverflowException",
            "NullReferenceException",
            "FormatException",
            "IndexOutOfRangeException"
        ],
        "correctAnswer": "OverflowException",
        "explanation": "The correct answer is A) OverflowException. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q010",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The unchecked keyword",
        "options": [
            "throws on overflow",
            "deletes the variable",
            "converts to double",
            "suppresses overflow checking and wraps the value"
        ],
        "correctAnswer": "suppresses overflow checking and wraps the value",
        "explanation": "The correct answer is D) suppresses overflow checking and wraps the value. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q011",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Top-level statements in C# 9.0 allow you to",
        "options": [
            "write a program without an explicit Main method and class",
            "declare multiple Main methods",
            "skip using the Console class",
            "avoid compiling"
        ],
        "correctAnswer": "write a program without an explicit Main method and class",
        "explanation": "The correct answer is A) write a program without an explicit Main method and class. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q012",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which operator is the modulus operator?",
        "options": [
            "*",
            "^",
            "%",
            "/"
        ],
        "correctAnswer": "%",
        "explanation": "The correct answer is C) %. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q013",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of 17 % 5 is",
        "options": [
            "4",
            "3",
            "1",
            "2"
        ],
        "correctAnswer": "2",
        "explanation": "The correct answer is D) 2. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q014",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of 17 / 5 when both are int is",
        "options": [
            "4",
            "3",
            "2",
            "3.4"
        ],
        "correctAnswer": "3",
        "explanation": "The correct answer is B) 3. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q015",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of 17 / 5.0 is",
        "options": [
            "3.4",
            "2",
            "3",
            "3.5"
        ],
        "correctAnswer": "3.4",
        "explanation": "The correct answer is A) 3.4. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q016",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which are relational operators?",
        "options": [
            "==, !=, <, >",
            "&&, ||, !",
            "+, -, *, /",
            "=, +=, -="
        ],
        "correctAnswer": "==, !=, <, >",
        "explanation": "The correct answer is A) ==, !=, <, >. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q017",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of the expression 5 == 5 is",
        "options": [
            "5",
            "null",
            "true",
            "false"
        ],
        "correctAnswer": "true",
        "explanation": "The correct answer is C) true. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q018",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which operator is the logical AND?",
        "options": [
            "||",
            "& only for bitwise",
            "!",
            "&&"
        ],
        "correctAnswer": "&&",
        "explanation": "The correct answer is D) &&. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q019",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which operator is the logical OR?",
        "options": [
            "||",
            "^^",
            "!",
            "&&"
        ],
        "correctAnswer": "||",
        "explanation": "The correct answer is A) ||. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q020",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which operator is the logical NOT?",
        "options": [
            "&",
            "!=",
            "!",
            "~"
        ],
        "correctAnswer": "!",
        "explanation": "The correct answer is C) !. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q021",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of true && false is",
        "options": [
            "false",
            "1",
            "true",
            "null"
        ],
        "correctAnswer": "false",
        "explanation": "The correct answer is A) false. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q022",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of true || false is",
        "options": [
            "false",
            "null",
            "0",
            "true"
        ],
        "correctAnswer": "true",
        "explanation": "The correct answer is D) true. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q023",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The && operator is short-circuiting, meaning",
        "options": [
            "both operands are always evaluated",
            "it evaluates right to left",
            "it returns an int",
            "the right operand is not evaluated if the left is false"
        ],
        "correctAnswer": "the right operand is not evaluated if the left is false",
        "explanation": "The correct answer is D) the right operand is not evaluated if the left is false. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q024",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The & operator on booleans",
        "options": [
            "returns a string",
            "always evaluates both operands",
            "is invalid",
            "short-circuits"
        ],
        "correctAnswer": "always evaluates both operands",
        "explanation": "The correct answer is B) always evaluates both operands. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q025",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the value of x after int x = 5; x++;?",
        "options": [
            "7",
            "6",
            "4",
            "5"
        ],
        "correctAnswer": "6",
        "explanation": "The correct answer is B) 6. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q026",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the value of y after int x = 5; int y = x++;?",
        "options": [
            "6",
            "5",
            "7",
            "4"
        ],
        "correctAnswer": "5",
        "explanation": "The correct answer is B) 5. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q027",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the value of y after int x = 5; int y = ++x;?",
        "options": [
            "5",
            "4",
            "7",
            "6"
        ],
        "correctAnswer": "6",
        "explanation": "The correct answer is D) 6. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q028",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the value of x after int x = 5; x--;?",
        "options": [
            "4",
            "5",
            "3",
            "6"
        ],
        "correctAnswer": "4",
        "explanation": "The correct answer is A) 4. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q029",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The statement x += 3; is equivalent to",
        "options": [
            "x = x * 3;",
            "x + 3 = x;",
            "x = 3;",
            "x = x + 3;"
        ],
        "correctAnswer": "x = x + 3;",
        "explanation": "The correct answer is D) x = x + 3;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q030",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The statement x *= 2; is equivalent to",
        "options": [
            "x = x + 2;",
            "x = 2;",
            "x = x * 2;",
            "x = x ^ 2;"
        ],
        "correctAnswer": "x = x * 2;",
        "explanation": "The correct answer is C) x = x * 2;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q031",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The statement x %= 4; is equivalent to",
        "options": [
            "x = 4 % x;",
            "x = x % 4;",
            "x = x - 4;",
            "x = x / 4;"
        ],
        "correctAnswer": "x = x % 4;",
        "explanation": "The correct answer is B) x = x % 4;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q032",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which operator has the highest precedence among these?",
        "options": [
            "||",
            "=",
            "*",
            "+"
        ],
        "correctAnswer": "*",
        "explanation": "The correct answer is C) *. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q033",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the result of 2 + 3 * 4?",
        "options": [
            "24",
            "20",
            "14",
            "9"
        ],
        "correctAnswer": "14",
        "explanation": "The correct answer is C) 14. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q034",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the result of (2 + 3) * 4?",
        "options": [
            "14",
            "20",
            "24",
            "11"
        ],
        "correctAnswer": "20",
        "explanation": "The correct answer is B) 20. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q035",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Associativity of the assignment operator = is",
        "options": [
            "none",
            "left-to-right",
            "undefined",
            "right-to-left"
        ],
        "correctAnswer": "right-to-left",
        "explanation": "The correct answer is D) right-to-left. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q036",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Arithmetic operators such as + and - are",
        "options": [
            "left-to-right associative",
            "non-associative",
            "right-to-left associative",
            "unordered"
        ],
        "correctAnswer": "left-to-right associative",
        "explanation": "The correct answer is A) left-to-right associative. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q037",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The left-shift operator is",
        "options": [
            "=<",
            "<>",
            "<<",
            ">>"
        ],
        "correctAnswer": "<<",
        "explanation": "The correct answer is C) <<. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q038",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of 1 << 3 is",
        "options": [
            "6",
            "8",
            "3",
            "4"
        ],
        "correctAnswer": "8",
        "explanation": "The correct answer is B) 8. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q039",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The result of 16 >> 2 is",
        "options": [
            "4",
            "2",
            "64",
            "8"
        ],
        "correctAnswer": "4",
        "explanation": "The correct answer is A) 4. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q040",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The + operator used with strings performs",
        "options": [
            "comparison",
            "multiplication",
            "subtraction",
            "concatenation"
        ],
        "correctAnswer": "concatenation",
        "explanation": "The correct answer is D) concatenation. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q041",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The ternary operator syntax is",
        "options": [
            "condition : value1 ? value2",
            "condition ? value1 : value2",
            "value1 ? condition : value2",
            "condition ?: value1, value2"
        ],
        "correctAnswer": "condition ? value1 : value2",
        "explanation": "The correct answer is B) condition ? value1 : value2. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q042",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the result of int r = (5 > 3) ? 10 : 20;?",
        "options": [
            "5",
            "3",
            "10",
            "20"
        ],
        "correctAnswer": "10",
        "explanation": "The correct answer is C) 10. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q043",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Converting one data type to another is called",
        "options": [
            "type conversion (casting)",
            "boxing only",
            "inheritance",
            "overloading"
        ],
        "correctAnswer": "type conversion (casting)",
        "explanation": "The correct answer is A) type conversion (casting). (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q044",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which conversion is done automatically by the compiler when no data loss occurs?",
        "options": [
            "Implicit conversion",
            "Manual parsing",
            "Reflection",
            "Explicit conversion"
        ],
        "correctAnswer": "Implicit conversion",
        "explanation": "The correct answer is A) Implicit conversion. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q045",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which conversion is implicit?",
        "options": [
            "double to int",
            "int to long",
            "long to int",
            "decimal to float"
        ],
        "correctAnswer": "int to long",
        "explanation": "The correct answer is B) int to long. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q046",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which conversion requires an explicit cast?",
        "options": [
            "double to int",
            "byte to int",
            "int to long",
            "int to double"
        ],
        "correctAnswer": "double to int",
        "explanation": "The correct answer is A) double to int. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q047",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "The correct syntax for an explicit cast is",
        "options": [
            "int x = (int)3.7;",
            "int x = int(3.7);",
            "int x = 3.7 as int;",
            "int x = <int>3.7;"
        ],
        "correctAnswer": "int x = (int)3.7;",
        "explanation": "The correct answer is A) int x = (int)3.7;. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q048",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "What is the value of (int)3.99?",
        "options": [
            "0",
            "3.99",
            "4",
            "3"
        ],
        "correctAnswer": "3",
        "explanation": "The correct answer is D) 3. (Statements and Operators)"
    },
    {
        "id": "csharp_s03_q049",
        "category": "C#",
        "session": 3,
        "sessionTitle": "Statements and Operators",
        "questionText": "Which method class provides conversions between base types, such as Convert.ToInt32()?",
        "options": [
            "Parser",
            "Convert",
            "Transform",
            "Cast"
        ],
        "correctAnswer": "Convert",
        "explanation": "The correct answer is B) Convert. (Statements and Operators)"
    },
    {
        "id": "csharp_s04_q001",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which statement executes a block only if a condition is true?",
        "options": [
            "for",
            "switch only",
            "if",
            "foreach"
        ],
        "correctAnswer": "if",
        "explanation": "The correct answer is C) if. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q002",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "In an if...else construct, the else block executes when",
        "options": [
            "the if condition is true",
            "never",
            "always",
            "the if condition is false"
        ],
        "correctAnswer": "the if condition is false",
        "explanation": "The correct answer is D) the if condition is false. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q003",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The if...else if construct is used to",
        "options": [
            "repeat a block",
            "exit the program",
            "declare variables",
            "test multiple conditions in sequence"
        ],
        "correctAnswer": "test multiple conditions in sequence",
        "explanation": "The correct answer is D) test multiple conditions in sequence. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q004",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "A nested if is",
        "options": [
            "an if with no braces",
            "an if without a condition",
            "an if statement placed inside another if",
            "a loop"
        ],
        "correctAnswer": "an if statement placed inside another if",
        "explanation": "The correct answer is C) an if statement placed inside another if. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q005",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The condition in an if statement must evaluate to",
        "options": [
            "char",
            "string",
            "bool",
            "int"
        ],
        "correctAnswer": "bool",
        "explanation": "The correct answer is C) bool. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q006",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which is INVALID in C#?",
        "options": [
            "if (x != 5)",
            "if (x > 5)",
            "if (x == 5)",
            "if (x = 5) when x is int"
        ],
        "correctAnswer": "if (x = 5) when x is int",
        "explanation": "The correct answer is D) if (x = 5) when x is int. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q007",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The switch statement is used to",
        "options": [
            "select one of many code blocks based on a value",
            "handle exceptions",
            "define a class",
            "repeat code"
        ],
        "correctAnswer": "select one of many code blocks based on a value",
        "explanation": "The correct answer is A) select one of many code blocks based on a value. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q008",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which keyword in a switch handles values not matched by any case?",
        "options": [
            "default",
            "else",
            "other",
            "otherwise"
        ],
        "correctAnswer": "default",
        "explanation": "The correct answer is A) default. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q009",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which keyword ends a case section in a switch statement?",
        "options": [
            "exit",
            "break",
            "stop",
            "end"
        ],
        "correctAnswer": "break",
        "explanation": "The correct answer is B) break. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q010",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "C# does not allow a case section to continue into the next one. This is called the",
        "options": [
            "fall-through rule",
            "loop rule",
            "no-fall-through rule",
            "jump rule"
        ],
        "correctAnswer": "no-fall-through rule",
        "explanation": "The correct answer is C) no-fall-through rule. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q011",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which of these can be used as a switch expression type?",
        "options": [
            "object only",
            "double only",
            "float only",
            "int, char, string, enum"
        ],
        "correctAnswer": "int, char, string, enum",
        "explanation": "The correct answer is D) int, char, string, enum. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q012",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "A nested switch is",
        "options": [
            "a switch with no cases",
            "a switch inside another switch",
            "a switch with two defaults",
            "a switch inside a loop only"
        ],
        "correctAnswer": "a switch inside another switch",
        "explanation": "The correct answer is B) a switch inside another switch. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q013",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which loop checks its condition before executing the body?",
        "options": [
            "none",
            "while",
            "do-while",
            "both for and do-while always run once"
        ],
        "correctAnswer": "while",
        "explanation": "The correct answer is B) while. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q014",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which loop executes the body at least once?",
        "options": [
            "while",
            "for",
            "do-while",
            "foreach"
        ],
        "correctAnswer": "do-while",
        "explanation": "The correct answer is C) do-while. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q015",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The do-while loop ends with",
        "options": [
            "nothing",
            "a semicolon after the condition",
            "a comma",
            "a colon"
        ],
        "correctAnswer": "a semicolon after the condition",
        "explanation": "The correct answer is B) a semicolon after the condition. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q016",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "How many times does for (int i = 0; i < 5; i++) execute its body?",
        "options": [
            "5",
            "6",
            "0",
            "4"
        ],
        "correctAnswer": "5",
        "explanation": "The correct answer is A) 5. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q017",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "How many times does for (int i = 1; i <= 5; i++) execute its body?",
        "options": [
            "6",
            "5",
            "4",
            "1"
        ],
        "correctAnswer": "5",
        "explanation": "The correct answer is B) 5. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q018",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The three parts of a for loop are",
        "options": [
            "input, process, output",
            "declaration, class, method",
            "initialization, condition, iteration",
            "try, catch, finally"
        ],
        "correctAnswer": "initialization, condition, iteration",
        "explanation": "The correct answer is C) initialization, condition, iteration. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q019",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which for loop creates an infinite loop?",
        "options": [
            "for (int i=5; i>0; i--) { }",
            "for (int i=0; i<10; i+=2) { }",
            "for (int i=0; i<1; i++) { }",
            "for (;;) { }"
        ],
        "correctAnswer": "for (;;) { }",
        "explanation": "The correct answer is D) for (;;) { }. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q020",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which loop is an infinite loop?",
        "options": [
            "while (false) { }",
            "do { } while (false);",
            "for (int i=0;i<0;i++){}",
            "while (true) { }"
        ],
        "correctAnswer": "while (true) { }",
        "explanation": "The correct answer is D) while (true) { }. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q021",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "A for loop with multiple loop control variables is written as",
        "options": [
            "for (int i = 0, j = 10; i < j; i++, j--)",
            "for (i = 0 and j = 10; ...)",
            "for (int i, j; ...) with no init",
            "for (int i = 0; int j = 10; ...)"
        ],
        "correctAnswer": "for (int i = 0, j = 10; i < j; i++, j--)",
        "explanation": "The correct answer is A) for (int i = 0, j = 10; i < j; i++, j--). (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q022",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The scope of a variable declared inside the for loop initialization is",
        "options": [
            "global",
            "the for loop only",
            "the entire namespace",
            "the entire class"
        ],
        "correctAnswer": "the for loop only",
        "explanation": "The correct answer is B) the for loop only. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q023",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which statement exits a loop immediately?",
        "options": [
            "skip",
            "break",
            "continue",
            "pass"
        ],
        "correctAnswer": "break",
        "explanation": "The correct answer is B) break. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q024",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which statement skips the rest of the current iteration and proceeds to the next one?",
        "options": [
            "continue",
            "exit",
            "return",
            "break"
        ],
        "correctAnswer": "continue",
        "explanation": "The correct answer is A) continue. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q025",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The goto statement",
        "options": [
            "begins a loop",
            "transfers control to a labeled statement",
            "declares a label only",
            "exits the program"
        ],
        "correctAnswer": "transfers control to a labeled statement",
        "explanation": "The correct answer is B) transfers control to a labeled statement. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q026",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The return statement",
        "options": [
            "exits a method and optionally returns a value",
            "restarts the method",
            "only ends loops",
            "declares a method"
        ],
        "correctAnswer": "exits a method and optionally returns a value",
        "explanation": "The correct answer is A) exits a method and optionally returns a value. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q027",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "What does this print? for(int i=1;i<=5;i++){ if(i==3) continue; Console.Write(i);}",
        "options": [
            "12",
            "12345",
            "45",
            "1245"
        ],
        "correctAnswer": "1245",
        "explanation": "The correct answer is D) 1245. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q028",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "What does this print? for(int i=1;i<=5;i++){ if(i==3) break; Console.Write(i);}",
        "options": [
            "1245",
            "123",
            "12",
            "345"
        ],
        "correctAnswer": "12",
        "explanation": "The correct answer is C) 12. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q029",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "What is the value of sum after: int sum=0; for(int i=1;i<=4;i++) sum+=i;",
        "options": [
            "10",
            "4",
            "6",
            "24"
        ],
        "correctAnswer": "10",
        "explanation": "The correct answer is A) 10. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q030",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "An array is",
        "options": [
            "a collection of mixed types always",
            "a collection of elements of the same type stored contiguously",
            "a loop",
            "a single value"
        ],
        "correctAnswer": "a collection of elements of the same type stored contiguously",
        "explanation": "The correct answer is B) a collection of elements of the same type stored contiguously. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q031",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Array elements are accessed using",
        "options": [
            "a label",
            "a key string",
            "an index",
            "a pointer"
        ],
        "correctAnswer": "an index",
        "explanation": "The correct answer is C) an index. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q032",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The index of the first element of a C# array is",
        "options": [
            "-1",
            "1",
            "0",
            "depends on the type"
        ],
        "correctAnswer": "0",
        "explanation": "The correct answer is C) 0. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q033",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which declares an integer array of size 5?",
        "options": [
            "int[] a = new int[5];",
            "array int a = 5;",
            "int a = new int(5);",
            "int a[5];"
        ],
        "correctAnswer": "int[] a = new int[5];",
        "explanation": "The correct answer is A) int[] a = new int[5];. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q034",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which correctly initializes an array?",
        "options": [
            "int a = {1, 2, 3};",
            "int[] a = [1,2,3,];",
            "int[] a = (1, 2, 3);",
            "int[] a = {1, 2, 3};"
        ],
        "correctAnswer": "int[] a = {1, 2, 3};",
        "explanation": "The correct answer is D) int[] a = {1, 2, 3};. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q035",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "What is the default value of elements in a new int array?",
        "options": [
            "0",
            "-1",
            "null",
            "undefined"
        ],
        "correctAnswer": "0",
        "explanation": "The correct answer is A) 0. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q036",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "What is the default value of elements in a new string array?",
        "options": [
            "\"null\"",
            "\"\"",
            "null",
            "0"
        ],
        "correctAnswer": "null",
        "explanation": "The correct answer is C) null. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q037",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which property returns the number of elements in a one-dimensional array?",
        "options": [
            "Size",
            "Length",
            "Count",
            "Items"
        ],
        "correctAnswer": "Length",
        "explanation": "The correct answer is B) Length. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q038",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Accessing a[5] when the array has 5 elements throws",
        "options": [
            "NullReferenceException",
            "FormatException",
            "ArgumentException",
            "IndexOutOfRangeException"
        ],
        "correctAnswer": "IndexOutOfRangeException",
        "explanation": "The correct answer is D) IndexOutOfRangeException. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q039",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which declares a two-dimensional (rectangular) array?",
        "options": [
            "int[3,4] m;",
            "int[,] m = new int[3,4];",
            "int m[3][4];",
            "int[][] m = new int[3,4];"
        ],
        "correctAnswer": "int[,] m = new int[3,4];",
        "explanation": "The correct answer is B) int[,] m = new int[3,4];. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q040",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "A jagged array is",
        "options": [
            "a rectangular array",
            "a string array",
            "an array of arrays with possibly different lengths",
            "a one-dimensional array"
        ],
        "correctAnswer": "an array of arrays with possibly different lengths",
        "explanation": "The correct answer is C) an array of arrays with possibly different lengths. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q041",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which declares a jagged array with 3 rows?",
        "options": [
            "int[3][] j;",
            "int[][] j = new int[3][];",
            "int[,] j = new int[3][];",
            "int j[3][];"
        ],
        "correctAnswer": "int[][] j = new int[3][];",
        "explanation": "The correct answer is B) int[][] j = new int[3][];. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q042",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "For a rectangular array int[,] m = new int[3,4], m.Length returns",
        "options": [
            "3",
            "12",
            "4",
            "7"
        ],
        "correctAnswer": "12",
        "explanation": "The correct answer is B) 12. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q043",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which method returns the number of dimensions of an array?",
        "options": [
            "Rank",
            "Depth",
            "GetRows",
            "Dimensions"
        ],
        "correctAnswer": "Rank",
        "explanation": "The correct answer is A) Rank. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q044",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "The foreach loop is used to",
        "options": [
            "jump to labels",
            "declare arrays",
            "iterate over each element of a collection or array",
            "modify array size"
        ],
        "correctAnswer": "iterate over each element of a collection or array",
        "explanation": "The correct answer is C) iterate over each element of a collection or array. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q045",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Within a foreach loop, the iteration variable is",
        "options": [
            "read-only",
            "static",
            "read-write",
            "a pointer"
        ],
        "correctAnswer": "read-only",
        "explanation": "The correct answer is A) read-only. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q046",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which is an implicitly typed array?",
        "options": [
            "var a = {1,2,3};",
            "var[] a = 3;",
            "var a = new[3];",
            "var a = new[] {1, 2, 3};"
        ],
        "correctAnswer": "var a = new[] {1, 2, 3};",
        "explanation": "The correct answer is D) var a = new[] {1, 2, 3};. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q047",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which class provides static methods such as Sort() and Reverse() for arrays?",
        "options": [
            "System.Array",
            "System.List",
            "System.Collections",
            "System.Math"
        ],
        "correctAnswer": "System.Array",
        "explanation": "The correct answer is A) System.Array. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q048",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which statement sorts array a in ascending order?",
        "options": [
            "a.Order();",
            "Array.Order(a);",
            "Sort.Array(a);",
            "Array.Sort(a);"
        ],
        "correctAnswer": "Array.Sort(a);",
        "explanation": "The correct answer is D) Array.Sort(a);. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s04_q049",
        "category": "C#",
        "session": 4,
        "sessionTitle": "Programming Constructs and Arrays",
        "questionText": "Which method reverses the order of elements in an array?",
        "options": [
            "Array.Reverse(a);",
            "Array.Back(a);",
            "a.Invert();",
            "Array.Flip(a);"
        ],
        "correctAnswer": "Array.Reverse(a);",
        "explanation": "The correct answer is A) Array.Reverse(a);. (Programming Constructs and Arrays)"
    },
    {
        "id": "csharp_s05_q001",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "OOP stands for",
        "options": [
            "Open Object Protocol",
            "Object-Order Processing",
            "Object-Oriented Programming",
            "Ordered Operation Program"
        ],
        "correctAnswer": "Object-Oriented Programming",
        "explanation": "The correct answer is C) Object-Oriented Programming. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q002",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which of the following is a feature of OOP?",
        "options": [
            "Parsing",
            "Debugging",
            "Compilation",
            "Encapsulation"
        ],
        "correctAnswer": "Encapsulation",
        "explanation": "The correct answer is D) Encapsulation. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q003",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Combining data and methods into one unit and hiding internal details is",
        "options": [
            "inheritance",
            "encapsulation",
            "polymorphism",
            "abstraction only"
        ],
        "correctAnswer": "encapsulation",
        "explanation": "The correct answer is B) encapsulation. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q004",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which of these is NOT a core OOP principle?",
        "options": [
            "Compilation",
            "Encapsulation",
            "Polymorphism",
            "Inheritance"
        ],
        "correctAnswer": "Compilation",
        "explanation": "The correct answer is A) Compilation. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q005",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "An object is",
        "options": [
            "a blueprint",
            "an instance of a class",
            "a method signature",
            "a namespace"
        ],
        "correctAnswer": "an instance of a class",
        "explanation": "The correct answer is B) an instance of a class. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q006",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A class is",
        "options": [
            "a blueprint or template for creating objects",
            "an object instance",
            "a loop",
            "a variable"
        ],
        "correctAnswer": "a blueprint or template for creating objects",
        "explanation": "The correct answer is A) a blueprint or template for creating objects. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q007",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which keyword creates an object in C#?",
        "options": [
            "alloc",
            "new",
            "create",
            "make"
        ],
        "correctAnswer": "new",
        "explanation": "The correct answer is B) new. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q008",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which keyword is used to declare a class?",
        "options": [
            "class",
            "Class",
            "struct only",
            "object"
        ],
        "correctAnswer": "class",
        "explanation": "The correct answer is A) class. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q009",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "By convention, class names in C# use",
        "options": [
            "UPPERCASE only",
            "camelCase",
            "PascalCase",
            "snake_case"
        ],
        "correctAnswer": "PascalCase",
        "explanation": "The correct answer is C) PascalCase. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q010",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The data members of a class are also called",
        "options": [
            "labels",
            "fields",
            "signatures",
            "headers"
        ],
        "correctAnswer": "fields",
        "explanation": "The correct answer is B) fields. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q011",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A method is",
        "options": [
            "a class",
            "a variable",
            "a namespace",
            "a block of code that performs an action on an object"
        ],
        "correctAnswer": "a block of code that performs an action on an object",
        "explanation": "The correct answer is D) a block of code that performs an action on an object. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q012",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The declaration of a method includes",
        "options": [
            "only a return type",
            "only a name",
            "return type, name, and parameters",
            "only parameters"
        ],
        "correctAnswer": "return type, name, and parameters",
        "explanation": "The correct answer is C) return type, name, and parameters. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q013",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A method that returns no value has the return type",
        "options": [
            "null",
            "none",
            "void",
            "empty"
        ],
        "correctAnswer": "void",
        "explanation": "The correct answer is C) void. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q014",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Values passed to a method when calling it are called",
        "options": [
            "attributes",
            "arguments",
            "parameters",
            "properties"
        ],
        "correctAnswer": "arguments",
        "explanation": "The correct answer is B) arguments. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q015",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Variables declared in the method definition to receive values are called",
        "options": [
            "literals",
            "fields",
            "arguments",
            "parameters"
        ],
        "correctAnswer": "parameters",
        "explanation": "The correct answer is D) parameters. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q016",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Named arguments allow you to",
        "options": [
            "skip the method",
            "create new parameters",
            "pass arguments by specifying parameter names",
            "pass only strings"
        ],
        "correctAnswer": "pass arguments by specifying parameter names",
        "explanation": "The correct answer is C) pass arguments by specifying parameter names. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q017",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Optional parameters must",
        "options": [
            "appear first",
            "always be null",
            "have a default value",
            "be of type object"
        ],
        "correctAnswer": "have a default value",
        "explanation": "The correct answer is C) have a default value. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q018",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which method declaration has an optional parameter?",
        "options": [
            "void Show(int a, optional int b)",
            "void Show(int a = 10, int b)",
            "void Show(int a, int b = 10)",
            "void Show(int a, int? b = )"
        ],
        "correctAnswer": "void Show(int a, int b = 10)",
        "explanation": "The correct answer is C) void Show(int a, int b = 10). (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q019",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static method is called using",
        "options": [
            "the class name",
            "an object instance only",
            "the this keyword",
            "the base keyword"
        ],
        "correctAnswer": "the class name",
        "explanation": "The correct answer is A) the class name. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q020",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static method can directly access",
        "options": [
            "only private members",
            "only static members of its class",
            "nothing",
            "all instance members"
        ],
        "correctAnswer": "only static members of its class",
        "explanation": "The correct answer is B) only static members of its class. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q021",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static class",
        "options": [
            "cannot be instantiated",
            "must be inherited",
            "can contain only instance members",
            "must have constructors"
        ],
        "correctAnswer": "cannot be instantiated",
        "explanation": "The correct answer is A) cannot be instantiated. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q022",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static variable is",
        "options": [
            "unique to each object",
            "always private",
            "always constant",
            "shared among all instances of the class"
        ],
        "correctAnswer": "shared among all instances of the class",
        "explanation": "The correct answer is D) shared among all instances of the class. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q023",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which access modifier allows access from anywhere?",
        "options": [
            "public",
            "private",
            "protected",
            "internal"
        ],
        "correctAnswer": "public",
        "explanation": "The correct answer is A) public. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q024",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which access modifier restricts access to within the same class?",
        "options": [
            "private",
            "protected",
            "public",
            "internal"
        ],
        "correctAnswer": "private",
        "explanation": "The correct answer is A) private. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q025",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which access modifier allows access within the class and derived classes?",
        "options": [
            "internal",
            "protected",
            "private",
            "public"
        ],
        "correctAnswer": "protected",
        "explanation": "The correct answer is B) protected. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q026",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which access modifier allows access within the same assembly?",
        "options": [
            "private",
            "protected",
            "public",
            "internal"
        ],
        "correctAnswer": "internal",
        "explanation": "The correct answer is D) internal. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q027",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The default access modifier for class members is",
        "options": [
            "internal",
            "public",
            "private",
            "protected"
        ],
        "correctAnswer": "private",
        "explanation": "The correct answer is C) private. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q028",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The default access modifier for a top-level class is",
        "options": [
            "private",
            "internal",
            "protected",
            "public"
        ],
        "correctAnswer": "internal",
        "explanation": "The correct answer is B) internal. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q029",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The ref keyword passes an argument",
        "options": [
            "by reference and requires prior initialization",
            "as a copy only",
            "by value",
            "as a constant"
        ],
        "correctAnswer": "by reference and requires prior initialization",
        "explanation": "The correct answer is A) by reference and requires prior initialization. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q030",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The out keyword",
        "options": [
            "makes the parameter read-only",
            "copies the value",
            "requires initialization before the call",
            "passes by reference and the method must assign it before returning"
        ],
        "correctAnswer": "passes by reference and the method must assign it before returning",
        "explanation": "The correct answer is D) passes by reference and the method must assign it before returning. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q031",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which statement is TRUE about ref and out?",
        "options": [
            "Neither changes the original",
            "Both require initialization before the call",
            "Both are used only for strings",
            "Both pass arguments by reference"
        ],
        "correctAnswer": "Both pass arguments by reference",
        "explanation": "The correct answer is D) Both pass arguments by reference. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q032",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Method overloading means",
        "options": [
            "same name and same signature",
            "multiple methods with the same name but different signatures",
            "overriding in derived classes",
            "different names, same signature"
        ],
        "correctAnswer": "multiple methods with the same name but different signatures",
        "explanation": "The correct answer is B) multiple methods with the same name but different signatures. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q033",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which pair is a valid overload?",
        "options": [
            "void F(int a) and void F(string a)",
            "void F(int a) and int F(int a)",
            "void F(int a) and void F(int b)",
            "void F() and void F()"
        ],
        "correctAnswer": "void F(int a) and void F(string a)",
        "explanation": "The correct answer is A) void F(int a) and void F(string a). (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q034",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Method overloading cannot be done by changing only",
        "options": [
            "the return type",
            "the order of parameter types",
            "the number of parameters",
            "the parameter types"
        ],
        "correctAnswer": "the return type",
        "explanation": "The correct answer is A) the return type. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q035",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "The this keyword refers to",
        "options": [
            "the current instance of the class",
            "the base class",
            "a namespace",
            "a static member"
        ],
        "correctAnswer": "the current instance of the class",
        "explanation": "The correct answer is A) the current instance of the class. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q036",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "this is often used to",
        "options": [
            "create static fields",
            "declare constants",
            "exit a method",
            "distinguish fields from parameters with the same name"
        ],
        "correctAnswer": "distinguish fields from parameters with the same name",
        "explanation": "The correct answer is D) distinguish fields from parameters with the same name. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q037",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A constructor is",
        "options": [
            "a static field",
            "an operator",
            "a special method that initializes an object",
            "a destroyer"
        ],
        "correctAnswer": "a special method that initializes an object",
        "explanation": "The correct answer is C) a special method that initializes an object. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q038",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A constructor has",
        "options": [
            "a void return type",
            "any name and a return type",
            "the name Main",
            "the same name as the class and no return type"
        ],
        "correctAnswer": "the same name as the class and no return type",
        "explanation": "The correct answer is D) the same name as the class and no return type. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q039",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "When a class defines no constructor, the compiler provides",
        "options": [
            "a destructor",
            "a default parameterless constructor",
            "a static constructor",
            "no constructor"
        ],
        "correctAnswer": "a default parameterless constructor",
        "explanation": "The correct answer is B) a default parameterless constructor. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q040",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static constructor is used to",
        "options": [
            "destroy objects",
            "initialize static members once",
            "create objects",
            "overload methods"
        ],
        "correctAnswer": "initialize static members once",
        "explanation": "The correct answer is B) initialize static members once. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q041",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A static constructor",
        "options": [
            "is called manually",
            "cannot have access modifiers or parameters",
            "can be public",
            "can take parameters"
        ],
        "correctAnswer": "cannot have access modifiers or parameters",
        "explanation": "The correct answer is B) cannot have access modifiers or parameters. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q042",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Constructor overloading means",
        "options": [
            "constructors are inherited",
            "constructors are static",
            "a constructor returns values",
            "a class has multiple constructors with different parameters"
        ],
        "correctAnswer": "a class has multiple constructors with different parameters",
        "explanation": "The correct answer is D) a class has multiple constructors with different parameters. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q043",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A destructor in C# is declared using",
        "options": [
            "~ClassName()",
            "destroy ClassName()",
            "ClassName.Dispose",
            "delete ClassName()"
        ],
        "correctAnswer": "~ClassName()",
        "explanation": "The correct answer is A) ~ClassName(). (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q044",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A destructor is called",
        "options": [
            "when the program starts",
            "by the programmer explicitly",
            "only for static classes",
            "by the garbage collector before reclaiming the object"
        ],
        "correctAnswer": "by the garbage collector before reclaiming the object",
        "explanation": "The correct answer is D) by the garbage collector before reclaiming the object. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q045",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "A class can have",
        "options": [
            "parameters in the destructor",
            "only one destructor",
            "multiple destructors",
            "no more than two destructors"
        ],
        "correctAnswer": "only one destructor",
        "explanation": "The correct answer is B) only one destructor. (Classes and Methods)"
    },
    {
        "id": "csharp_s05_q046",
        "category": "C#",
        "session": 5,
        "sessionTitle": "Classes and Methods",
        "questionText": "Which statement correctly creates an object of class Car?",
        "options": [
            "new Car c;",
            "Car c = create Car;",
            "Car c = new Car();",
            "Car c = Car();"
        ],
        "correctAnswer": "Car c = new Car();",
        "explanation": "The correct answer is C) Car c = new Car();. (Classes and Methods)"
    },
    {
        "id": "csharp_s06_q001",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Inheritance is",
        "options": [
            "hiding data",
            "creating an object",
            "a mechanism where a class acquires members of another class",
            "overloading methods"
        ],
        "correctAnswer": "a mechanism where a class acquires members of another class",
        "explanation": "The correct answer is C) a mechanism where a class acquires members of another class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q002",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The class being inherited from is called the",
        "options": [
            "base (parent) class",
            "sealed class",
            "derived class",
            "static class"
        ],
        "correctAnswer": "base (parent) class",
        "explanation": "The correct answer is A) base (parent) class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q003",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The class that inherits from another is called the",
        "options": [
            "abstract class",
            "partial class",
            "base class",
            "derived (child) class"
        ],
        "correctAnswer": "derived (child) class",
        "explanation": "The correct answer is D) derived (child) class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q004",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which symbol is used to implement inheritance in C#?",
        "options": [
            "extends",
            "::",
            ":",
            "->"
        ],
        "correctAnswer": ":",
        "explanation": "The correct answer is C) :. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q005",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which declaration makes Dog inherit from Animal?",
        "options": [
            "class Dog extends Animal",
            "class Animal : Dog",
            "class Dog inherits Animal",
            "class Dog : Animal"
        ],
        "correctAnswer": "class Dog : Animal",
        "explanation": "The correct answer is D) class Dog : Animal. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q006",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The main purpose of inheritance is",
        "options": [
            "hiding all code",
            "code reusability",
            "reducing memory to zero",
            "faster compilation"
        ],
        "correctAnswer": "code reusability",
        "explanation": "The correct answer is B) code reusability. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q007",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "C# supports multiple inheritance of classes.",
        "options": [
            "True",
            "False",
            "Only for static classes",
            "Only for abstract classes"
        ],
        "correctAnswer": "False",
        "explanation": "The correct answer is B) False. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q008",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Multi-level inheritance means",
        "options": [
            "a class has many constructors",
            "a class is derived from a derived class",
            "two classes share a name",
            "a class has many methods"
        ],
        "correctAnswer": "a class is derived from a derived class",
        "explanation": "The correct answer is B) a class is derived from a derived class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q009",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The root class of all classes in C# is",
        "options": [
            "System.Root",
            "System.Object",
            "System.Class",
            "System.Base"
        ],
        "correctAnswer": "System.Object",
        "explanation": "The correct answer is B) System.Object. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q010",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A member declared protected is accessible in",
        "options": [
            "the declaring class and its derived classes",
            "only the same method",
            "any class",
            "only the same file"
        ],
        "correctAnswer": "the declaring class and its derived classes",
        "explanation": "The correct answer is A) the declaring class and its derived classes. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q011",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Private members of a base class are",
        "options": [
            "accessible in the derived class",
            "deleted",
            "not accessible in the derived class",
            "accessible only via new"
        ],
        "correctAnswer": "not accessible in the derived class",
        "explanation": "The correct answer is C) not accessible in the derived class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q012",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The base keyword is used to",
        "options": [
            "define interfaces",
            "access members of the base class from a derived class",
            "seal a class",
            "create a new object"
        ],
        "correctAnswer": "access members of the base class from a derived class",
        "explanation": "The correct answer is B) access members of the base class from a derived class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q013",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which syntax calls a base class parameterized constructor?",
        "options": [
            "public Dog(string n) : base(n)",
            "public Dog(string n) : this(base)",
            "public Dog(string n) = base(n)",
            "public Dog(string n) { super(n); }"
        ],
        "correctAnswer": "public Dog(string n) : base(n)",
        "explanation": "The correct answer is A) public Dog(string n) : base(n). (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q014",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "When a derived class object is created, constructors execute in the order",
        "options": [
            "base class first, then derived class",
            "derived class first, then base",
            "only the derived",
            "random"
        ],
        "correctAnswer": "base class first, then derived class",
        "explanation": "The correct answer is A) base class first, then derived class. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q015",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Constructors are",
        "options": [
            "inherited only if static",
            "always inherited",
            "not inherited by derived classes",
            "inherited only if public"
        ],
        "correctAnswer": "not inherited by derived classes",
        "explanation": "The correct answer is C) not inherited by derived classes. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q016",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "When a base constructor has parameters and the derived class doesn't call it explicitly",
        "options": [
            "the program runs fine",
            "the base is skipped",
            "null is passed",
            "a compile-time error occurs"
        ],
        "correctAnswer": "a compile-time error occurs",
        "explanation": "The correct answer is D) a compile-time error occurs. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q017",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The new keyword used in a derived class member declaration",
        "options": [
            "overrides the base member",
            "makes the member static",
            "hides a base class member with the same name",
            "creates an object"
        ],
        "correctAnswer": "hides a base class member with the same name",
        "explanation": "The correct answer is C) hides a base class member with the same name. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q018",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Method overriding allows a derived class to",
        "options": [
            "add a constructor",
            "create a new class",
            "delete a method",
            "provide a new implementation of a base class method"
        ],
        "correctAnswer": "provide a new implementation of a base class method",
        "explanation": "The correct answer is D) provide a new implementation of a base class method. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q019",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "To allow a method to be overridden, the base method must be declared",
        "options": [
            "sealed",
            "const",
            "static",
            "virtual"
        ],
        "correctAnswer": "virtual",
        "explanation": "The correct answer is D) virtual. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q020",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "In the derived class, an overriding method uses the keyword",
        "options": [
            "overload",
            "override",
            "new only",
            "virtual"
        ],
        "correctAnswer": "override",
        "explanation": "The correct answer is B) override. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q021",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "What is required for overriding?",
        "options": [
            "Different return type",
            "Static modifier",
            "Same signature and return type as the virtual method",
            "Different name"
        ],
        "correctAnswer": "Same signature and return type as the virtual method",
        "explanation": "The correct answer is C) Same signature and return type as the virtual method. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q022",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "An overriding method can call the base version using",
        "options": [
            "this.MethodName()",
            "parent.MethodName()",
            "base.MethodName()",
            "super.MethodName()"
        ],
        "correctAnswer": "base.MethodName()",
        "explanation": "The correct answer is C) base.MethodName(). (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q023",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A sealed class",
        "options": [
            "has only static members",
            "cannot be instantiated",
            "must be abstract",
            "cannot be inherited"
        ],
        "correctAnswer": "cannot be inherited",
        "explanation": "The correct answer is D) cannot be inherited. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q024",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which keyword prevents a class from being inherited?",
        "options": [
            "final",
            "abstract",
            "sealed",
            "static only"
        ],
        "correctAnswer": "sealed",
        "explanation": "The correct answer is C) sealed. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q025",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which declaration is valid?",
        "options": [
            "abstract sealed method A() { }",
            "sealed class A { }",
            "sealed static virtual class A { }",
            "sealed abstract class A { }"
        ],
        "correctAnswer": "sealed class A { }",
        "explanation": "The correct answer is B) sealed class A { }. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q026",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A sealed method",
        "options": [
            "is private",
            "must be static",
            "cannot be called",
            "prevents further overriding in derived classes"
        ],
        "correctAnswer": "prevents further overriding in derived classes",
        "explanation": "The correct answer is D) prevents further overriding in derived classes. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q027",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Sealed methods are declared using",
        "options": [
            "sealed override",
            "override final",
            "sealed virtual",
            "static override"
        ],
        "correctAnswer": "sealed override",
        "explanation": "The correct answer is A) sealed override. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q028",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The string class in C# is",
        "options": [
            "static",
            "sealed",
            "partial",
            "abstract"
        ],
        "correctAnswer": "sealed",
        "explanation": "The correct answer is B) sealed. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q029",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Polymorphism means",
        "options": [
            "one object, one type",
            "no inheritance",
            "many classes, one object",
            "one interface, many forms"
        ],
        "correctAnswer": "one interface, many forms",
        "explanation": "The correct answer is D) one interface, many forms. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q030",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Compile-time polymorphism is achieved through",
        "options": [
            "interfaces only",
            "method overriding",
            "virtual methods",
            "method overloading"
        ],
        "correctAnswer": "method overloading",
        "explanation": "The correct answer is D) method overloading. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q031",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Run-time polymorphism is achieved through",
        "options": [
            "method overriding with virtual methods",
            "constants",
            "static methods",
            "method overloading"
        ],
        "correctAnswer": "method overriding with virtual methods",
        "explanation": "The correct answer is A) method overriding with virtual methods. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q032",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Early binding is also known as",
        "options": [
            "dynamic polymorphism",
            "late polymorphism",
            "compile-time polymorphism",
            "run-time polymorphism"
        ],
        "correctAnswer": "compile-time polymorphism",
        "explanation": "The correct answer is C) compile-time polymorphism. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q033",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Late binding is resolved",
        "options": [
            "at design time",
            "at install time",
            "at compile time",
            "at run time"
        ],
        "correctAnswer": "at run time",
        "explanation": "The correct answer is D) at run time. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q034",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A base class reference can refer to",
        "options": [
            "nothing",
            "only base class objects",
            "a derived class object",
            "only static objects"
        ],
        "correctAnswer": "a derived class object",
        "explanation": "The correct answer is C) a derived class object. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q035",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Given Animal a = new Dog(); a.Speak(); where Speak is virtual and overridden in Dog, which version runs?",
        "options": [
            "Animal's Speak",
            "Both",
            "Dog's Speak",
            "Neither"
        ],
        "correctAnswer": "Dog's Speak",
        "explanation": "The correct answer is C) Dog's Speak. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q036",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Given the same scenario but Speak in Dog is hidden using new (not override), a.Speak() calls",
        "options": [
            "Both",
            "compile error",
            "Dog's Speak",
            "Animal's Speak"
        ],
        "correctAnswer": "Animal's Speak",
        "explanation": "The correct answer is D) Animal's Speak. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q037",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "What happens if you call an abstract or virtual method via base reference and derived overrides it?",
        "options": [
            "The overridden version executes",
            "The base version executes",
            "Error",
            "Nothing runs"
        ],
        "correctAnswer": "The overridden version executes",
        "explanation": "The correct answer is A) The overridden version executes. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q038",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which statement about virtual methods is true?",
        "options": [
            "They are always private",
            "They cannot have a body",
            "Their implementation can be overridden by derived classes",
            "They must be static"
        ],
        "correctAnswer": "Their implementation can be overridden by derived classes",
        "explanation": "The correct answer is C) Their implementation can be overridden by derived classes. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q039",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The is-a relationship is best described by",
        "options": [
            "inheritance",
            "composition",
            "aggregation",
            "overloading"
        ],
        "correctAnswer": "inheritance",
        "explanation": "The correct answer is A) inheritance. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q040",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "What type is Dog derived from Animal implicitly convertible to?",
        "options": [
            "Dog[]",
            "int",
            "Animal",
            "string"
        ],
        "correctAnswer": "Animal",
        "explanation": "The correct answer is C) Animal. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q041",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "An upcast from Dog to Animal is",
        "options": [
            "implicit and always safe",
            "unsafe",
            "invalid",
            "always explicit"
        ],
        "correctAnswer": "implicit and always safe",
        "explanation": "The correct answer is A) implicit and always safe. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q042",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A downcast from Animal to Dog requires",
        "options": [
            "the sealed keyword",
            "the new keyword",
            "no cast",
            "an explicit cast"
        ],
        "correctAnswer": "an explicit cast",
        "explanation": "The correct answer is D) an explicit cast. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q043",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "The ToString() method is originally defined in",
        "options": [
            "System.Object",
            "System.Type",
            "System.String only",
            "System.Console"
        ],
        "correctAnswer": "System.Object",
        "explanation": "The correct answer is A) System.Object. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q044",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Overriding ToString() requires the method to be declared",
        "options": [
            "private string ToString()",
            "static string ToString()",
            "public override string ToString()",
            "public new void ToString()"
        ],
        "correctAnswer": "public override string ToString()",
        "explanation": "The correct answer is C) public override string ToString(). (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q045",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "A derived class can access base members using",
        "options": [
            "this only",
            "parent",
            "super",
            "base"
        ],
        "correctAnswer": "base",
        "explanation": "The correct answer is D) base. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q046",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which relationship exists between class Vehicle and class Car : Vehicle?",
        "options": [
            "Vehicle is base, Car is derived",
            "They are unrelated",
            "Car is base, Vehicle is derived",
            "They are siblings"
        ],
        "correctAnswer": "Vehicle is base, Car is derived",
        "explanation": "The correct answer is A) Vehicle is base, Car is derived. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q047",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "Which is true for hiding with new?",
        "options": [
            "It changes the base class",
            "It produces a warning if new is omitted",
            "It is mandatory for overriding",
            "It is used with abstract"
        ],
        "correctAnswer": "It produces a warning if new is omitted",
        "explanation": "The correct answer is B) It produces a warning if new is omitted. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s06_q048",
        "category": "C#",
        "session": 6,
        "sessionTitle": "Inheritance and Polymorphism",
        "questionText": "In multi-level inheritance A -> B -> C, class C can access",
        "options": [
            "only members of B",
            "only members of A",
            "none",
            "public and protected members of both B and A"
        ],
        "correctAnswer": "public and protected members of both B and A",
        "explanation": "The correct answer is D) public and protected members of both B and A. (Inheritance and Polymorphism)"
    },
    {
        "id": "csharp_s07_q001",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An abstract class is",
        "options": [
            "a sealed class",
            "a static class",
            "a class that can be instantiated freely",
            "an incomplete base class that cannot be instantiated"
        ],
        "correctAnswer": "an incomplete base class that cannot be instantiated",
        "explanation": "The correct answer is D) an incomplete base class that cannot be instantiated. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q002",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which keyword declares an abstract class?",
        "options": [
            "interface",
            "abstract",
            "sealed",
            "virtual"
        ],
        "correctAnswer": "abstract",
        "explanation": "The correct answer is B) abstract. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q003",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can you create an object of an abstract class directly using new?",
        "options": [
            "Only in the same file",
            "No",
            "Yes",
            "Only with constructors"
        ],
        "correctAnswer": "No",
        "explanation": "The correct answer is B) No. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q004",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An abstract method",
        "options": [
            "is always static",
            "has a body",
            "is always private",
            "has no body and must be overridden in derived classes"
        ],
        "correctAnswer": "has no body and must be overridden in derived classes",
        "explanation": "The correct answer is D) has no body and must be overridden in derived classes. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q005",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An abstract method can be declared in",
        "options": [
            "a non-abstract class",
            "a static class",
            "a sealed class",
            "an abstract class"
        ],
        "correctAnswer": "an abstract class",
        "explanation": "The correct answer is D) an abstract class. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q006",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which is a valid abstract method declaration?",
        "options": [
            "public abstract void Draw() { }",
            "abstract void Draw() { return; }",
            "public abstract void Draw();",
            "public abstract static void Draw();"
        ],
        "correctAnswer": "public abstract void Draw();",
        "explanation": "The correct answer is C) public abstract void Draw();. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q007",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "The derived class of an abstract class must",
        "options": [
            "be sealed",
            "implement all abstract members, unless it is abstract itself",
            "implement none",
            "be static"
        ],
        "correctAnswer": "implement all abstract members, unless it is abstract itself",
        "explanation": "The correct answer is B) implement all abstract members, unless it is abstract itself. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q008",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can an abstract class contain non-abstract methods?",
        "options": [
            "Yes",
            "Only properties",
            "Only static",
            "No"
        ],
        "correctAnswer": "Yes",
        "explanation": "The correct answer is A) Yes. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q009",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can an abstract class have constructors?",
        "options": [
            "Yes",
            "No",
            "Only static",
            "Only private"
        ],
        "correctAnswer": "Yes",
        "explanation": "The correct answer is A) Yes. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q010",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which modifier is used in the derived class to implement an abstract method?",
        "options": [
            "override",
            "virtual",
            "abstract",
            "new"
        ],
        "correctAnswer": "override",
        "explanation": "The correct answer is A) override. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q011",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Visual Studio IntelliSense can help implement an abstract base class by",
        "options": [
            "deleting members",
            "compiling the code",
            "generating stubs for abstract members",
            "making classes sealed"
        ],
        "correctAnswer": "generating stubs for abstract members",
        "explanation": "The correct answer is C) generating stubs for abstract members. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q012",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An interface",
        "options": [
            "is a sealed class",
            "declares a contract of members with no implementation (traditionally)",
            "holds only fields",
            "can be instantiated"
        ],
        "correctAnswer": "declares a contract of members with no implementation (traditionally)",
        "explanation": "The correct answer is B) declares a contract of members with no implementation (traditionally). (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q013",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Interface names conventionally begin with",
        "options": [
            "T",
            "A",
            "I",
            "X"
        ],
        "correctAnswer": "I",
        "explanation": "The correct answer is C) I. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q014",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which keyword declares an interface?",
        "options": [
            "implements",
            "contract",
            "abstract",
            "interface"
        ],
        "correctAnswer": "interface",
        "explanation": "The correct answer is D) interface. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q015",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Members of an interface are by default",
        "options": [
            "public",
            "private",
            "internal",
            "protected"
        ],
        "correctAnswer": "public",
        "explanation": "The correct answer is A) public. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q016",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can an interface contain fields?",
        "options": [
            "Only static",
            "No",
            "Only const",
            "Yes"
        ],
        "correctAnswer": "No",
        "explanation": "The correct answer is B) No. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q017",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can you instantiate an interface directly?",
        "options": [
            "No",
            "Only in Main",
            "Yes",
            "Only with new"
        ],
        "correctAnswer": "No",
        "explanation": "The correct answer is A) No. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q018",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "How does a class implement an interface?",
        "options": [
            "class A extends IShape",
            "class A : IShape",
            "class A implements IShape",
            "class A uses IShape"
        ],
        "correctAnswer": "class A : IShape",
        "explanation": "The correct answer is B) class A : IShape. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q019",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "When a class implements an interface it must",
        "options": [
            "implement only one",
            "implement all the interface's members",
            "be abstract",
            "implement none"
        ],
        "correctAnswer": "implement all the interface's members",
        "explanation": "The correct answer is B) implement all the interface's members. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q020",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "C# achieves multiple inheritance through",
        "options": [
            "sealed classes",
            "abstract classes",
            "interfaces",
            "static classes"
        ],
        "correctAnswer": "interfaces",
        "explanation": "The correct answer is C) interfaces. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q021",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "A class can implement",
        "options": [
            "no interfaces",
            "multiple interfaces",
            "only one interface",
            "interfaces only if sealed"
        ],
        "correctAnswer": "multiple interfaces",
        "explanation": "The correct answer is B) multiple interfaces. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q022",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which declaration is correct for a class inheriting a base class and two interfaces?",
        "options": [
            "class A : I1, I2, B",
            "class A : B, I1, I2",
            "class A extends B implements I1, I2",
            "class A : B & I1 & I2"
        ],
        "correctAnswer": "class A : B, I1, I2",
        "explanation": "The correct answer is B) class A : B, I1, I2. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q023",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "In an inheritance list the base class must",
        "options": [
            "appear first, followed by interfaces",
            "appear in the middle",
            "appear last",
            "not appear"
        ],
        "correctAnswer": "appear first, followed by interfaces",
        "explanation": "The correct answer is A) appear first, followed by interfaces. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q024",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Explicit interface implementation is used when",
        "options": [
            "two interfaces have methods with identical names",
            "the class is static",
            "the method is virtual",
            "you want faster code"
        ],
        "correctAnswer": "two interfaces have methods with identical names",
        "explanation": "The correct answer is A) two interfaces have methods with identical names. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q025",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An explicitly implemented interface member is accessed through",
        "options": [
            "the class object directly",
            "a static call",
            "the base keyword",
            "an interface reference"
        ],
        "correctAnswer": "an interface reference",
        "explanation": "The correct answer is D) an interface reference. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q026",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "In explicit implementation, the method is declared as",
        "options": [
            "private void Draw() { }",
            "public void IShape.Draw() { }",
            "void IShape.Draw() { } with no access modifier",
            "static void IShape.Draw() { }"
        ],
        "correctAnswer": "void IShape.Draw() { } with no access modifier",
        "explanation": "The correct answer is C) void IShape.Draw() { } with no access modifier. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q027",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Interface inheritance means",
        "options": [
            "an interface derives from another interface",
            "a class derives from an interface only",
            "a struct derives from a class",
            "an interface derives from a class"
        ],
        "correctAnswer": "an interface derives from another interface",
        "explanation": "The correct answer is A) an interface derives from another interface. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q028",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Interface re-implementation occurs when",
        "options": [
            "a derived class implements the same interface again",
            "a method is static",
            "an interface has no members",
            "a class is sealed"
        ],
        "correctAnswer": "a derived class implements the same interface again",
        "explanation": "The correct answer is A) a derived class implements the same interface again. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q029",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "The is operator is used to",
        "options": [
            "compare strings",
            "create an object",
            "cast and throw",
            "check whether an object is compatible with a type"
        ],
        "correctAnswer": "check whether an object is compatible with a type",
        "explanation": "The correct answer is D) check whether an object is compatible with a type. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q030",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "The as operator",
        "options": [
            "returns null if the types are not compatible",
            "returns false if not compatible",
            "always converts",
            "throws an exception if not compatible"
        ],
        "correctAnswer": "returns null if the types are not compatible",
        "explanation": "The correct answer is A) returns null if the types are not compatible. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q031",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "The result of obj is string when obj is an int boxed to object",
        "options": [
            "false",
            "error",
            "true",
            "null"
        ],
        "correctAnswer": "false",
        "explanation": "The correct answer is A) false. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q032",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "The as operator can be used with",
        "options": [
            "only value types",
            "only int",
            "only enums",
            "reference types and nullable types"
        ],
        "correctAnswer": "reference types and nullable types",
        "explanation": "The correct answer is D) reference types and nullable types. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q033",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which is a similarity between abstract classes and interfaces?",
        "options": [
            "Both support multiple inheritance",
            "Neither can be instantiated",
            "Both can contain fields",
            "Both have constructors"
        ],
        "correctAnswer": "Neither can be instantiated",
        "explanation": "The correct answer is B) Neither can be instantiated. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q034",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which is a difference between abstract classes and interfaces?",
        "options": [
            "Interfaces can be instantiated",
            "Interfaces can have constructors",
            "A class can inherit only one abstract class but many interfaces",
            "Abstract classes cannot have methods"
        ],
        "correctAnswer": "A class can inherit only one abstract class but many interfaces",
        "explanation": "The correct answer is C) A class can inherit only one abstract class but many interfaces. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q035",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which can contain constructors?",
        "options": [
            "Interface",
            "Abstract class",
            "Both",
            "Neither"
        ],
        "correctAnswer": "Abstract class",
        "explanation": "The correct answer is B) Abstract class. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q036",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which should you use to define common behavior and share code among related classes?",
        "options": [
            "Static class",
            "Interface",
            "Sealed class",
            "Abstract class"
        ],
        "correctAnswer": "Abstract class",
        "explanation": "The correct answer is D) Abstract class. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q037",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which should you use when unrelated classes need to share a capability?",
        "options": [
            "Interface",
            "Partial class",
            "Abstract class",
            "Sealed class"
        ],
        "correctAnswer": "Interface",
        "explanation": "The correct answer is A) Interface. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q038",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which of these CANNOT be marked abstract?",
        "options": [
            "A field",
            "A property",
            "A class",
            "A method"
        ],
        "correctAnswer": "A field",
        "explanation": "The correct answer is A) A field. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q039",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Can an abstract class implement an interface without implementing all its members?",
        "options": [
            "Only if sealed",
            "Yes, by marking those members abstract",
            "No, never",
            "Only if static"
        ],
        "correctAnswer": "Yes, by marking those members abstract",
        "explanation": "The correct answer is B) Yes, by marking those members abstract. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q040",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An abstract class may inherit from",
        "options": [
            "only interfaces",
            "only structs",
            "nothing",
            "another class and interfaces"
        ],
        "correctAnswer": "another class and interfaces",
        "explanation": "The correct answer is D) another class and interfaces. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q041",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which of these is an example of a typical interface?",
        "options": [
            "String",
            "Math",
            "Console",
            "IComparable"
        ],
        "correctAnswer": "IComparable",
        "explanation": "The correct answer is D) IComparable. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q042",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Interface methods in a class implementing them are typically declared",
        "options": [
            "protected",
            "static",
            "private",
            "public"
        ],
        "correctAnswer": "public",
        "explanation": "The correct answer is D) public. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q043",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "If a class doesn't implement an interface method, the compiler",
        "options": [
            "makes the class abstract automatically",
            "reports an error",
            "issues no warning",
            "auto-implements it"
        ],
        "correctAnswer": "reports an error",
        "explanation": "The correct answer is B) reports an error. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q044",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which is TRUE of an interface reference?",
        "options": [
            "It can hold an object of any class implementing the interface",
            "It can hold only abstract objects",
            "It can't call methods",
            "It can hold only strings"
        ],
        "correctAnswer": "It can hold an object of any class implementing the interface",
        "explanation": "The correct answer is A) It can hold an object of any class implementing the interface. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q045",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "An abstract property",
        "options": [
            "has no implementation and must be overridden",
            "is static",
            "has a body",
            "is sealed"
        ],
        "correctAnswer": "has no implementation and must be overridden",
        "explanation": "The correct answer is A) has no implementation and must be overridden. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s07_q046",
        "category": "C#",
        "session": 7,
        "sessionTitle": "Abstract Classes and Interfaces",
        "questionText": "Which of the following correctly declares an interface with a method?",
        "options": [
            "interface IA { void M() = 0; }",
            "interface IA { abstract void M(); } required",
            "interface IA { void M(); }",
            "interface IA = { M(); }"
        ],
        "correctAnswer": "interface IA { void M(); }",
        "explanation": "The correct answer is C) interface IA { void M(); }. (Abstract Classes and Interfaces)"
    },
    {
        "id": "csharp_s08_q001",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Properties in C# are",
        "options": [
            "namespaces",
            "loops",
            "methods that return void",
            "members that provide a flexible way to read, write, or compute a private field"
        ],
        "correctAnswer": "members that provide a flexible way to read, write, or compute a private field",
        "explanation": "The correct answer is D) members that provide a flexible way to read, write, or compute a private field. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q002",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Properties are typically used to",
        "options": [
            "replace constructors",
            "create arrays",
            "expose private fields in a controlled manner",
            "declare classes"
        ],
        "correctAnswer": "expose private fields in a controlled manner",
        "explanation": "The correct answer is C) expose private fields in a controlled manner. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q003",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which accessor retrieves the value of a property?",
        "options": [
            "set",
            "value",
            "get",
            "init"
        ],
        "correctAnswer": "get",
        "explanation": "The correct answer is C) get. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q004",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which accessor assigns a value to a property?",
        "options": [
            "set",
            "return",
            "get",
            "put"
        ],
        "correctAnswer": "set",
        "explanation": "The correct answer is A) set. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q005",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Inside a set accessor, the implicit parameter is named",
        "options": [
            "this",
            "value",
            "input",
            "arg"
        ],
        "correctAnswer": "value",
        "explanation": "The correct answer is B) value. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q006",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A property with only a get accessor is",
        "options": [
            "read-only",
            "write-only",
            "invalid",
            "read-write"
        ],
        "correctAnswer": "read-only",
        "explanation": "The correct answer is A) read-only. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q007",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A property with only a set accessor is",
        "options": [
            "static",
            "write-only",
            "read-only",
            "invalid"
        ],
        "correctAnswer": "write-only",
        "explanation": "The correct answer is B) write-only. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q008",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is a correct property declaration?",
        "options": [
            "public int Age { get; set; }",
            "public Age int { get; set; }",
            "public int Age() { get; set; }",
            "public int Age => { get set }"
        ],
        "correctAnswer": "public int Age { get; set; }",
        "explanation": "The correct answer is A) public int Age { get; set; }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q009",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "An auto-implemented property",
        "options": [
            "requires a backing field",
            "is always read-only",
            "lets the compiler create a hidden backing field",
            "cannot have accessors"
        ],
        "correctAnswer": "lets the compiler create a hidden backing field",
        "explanation": "The correct answer is C) lets the compiler create a hidden backing field. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q010",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is an auto-implemented property?",
        "options": [
            "public string name;",
            "public string Name() { return n; }",
            "string Name = get;",
            "public string Name { get; set; }"
        ],
        "correctAnswer": "public string Name { get; set; }",
        "explanation": "The correct answer is D) public string Name { get; set; }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q011",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "To make an auto-implemented property read-only from outside, you can use",
        "options": [
            "{ private; }",
            "{ get; private set; }",
            "{ get; get; }",
            "{ set; }"
        ],
        "correctAnswer": "{ get; private set; }",
        "explanation": "The correct answer is B) { get; private set; }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q012",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A static property is accessed through",
        "options": [
            "this",
            "the class name",
            "an object",
            "base"
        ],
        "correctAnswer": "the class name",
        "explanation": "The correct answer is B) the class name. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q013",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is a Boolean property convention?",
        "options": [
            "Use int type",
            "Use void type",
            "Always name Flag",
            "Name it IsXxx or HasXxx such as IsActive"
        ],
        "correctAnswer": "Name it IsXxx or HasXxx such as IsActive",
        "explanation": "The correct answer is D) Name it IsXxx or HasXxx such as IsActive. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q014",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "An abstract property",
        "options": [
            "must be static",
            "cannot have get",
            "is declared in an abstract class without implementation",
            "has a body"
        ],
        "correctAnswer": "is declared in an abstract class without implementation",
        "explanation": "The correct answer is C) is declared in an abstract class without implementation. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q015",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A virtual property in a base class",
        "options": [
            "can be overridden in a derived class",
            "cannot have get",
            "must be static",
            "must be abstract"
        ],
        "correctAnswer": "can be overridden in a derived class",
        "explanation": "The correct answer is A) can be overridden in a derived class. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q016",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Object initializer syntax is",
        "options": [
            "new Person[Name = \"Ali\"]",
            "new Person { Name = \"Ali\", Age = 20 }",
            "Person.init(Name=\"Ali\")",
            "new Person(Name: Ali)"
        ],
        "correctAnswer": "new Person { Name = \"Ali\", Age = 20 }",
        "explanation": "The correct answer is B) new Person { Name = \"Ali\", Age = 20 }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q017",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Object initializers let you",
        "options": [
            "define constructors",
            "set properties at object creation without calling a parameterized constructor",
            "delete objects",
            "define classes"
        ],
        "correctAnswer": "set properties at object creation without calling a parameterized constructor",
        "explanation": "The correct answer is B) set properties at object creation without calling a parameterized constructor. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q018",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is true about properties vs. fields?",
        "options": [
            "Fields can include logic in accessors",
            "Properties can include validation logic in accessors",
            "Properties can't be private",
            "Fields can't be public"
        ],
        "correctAnswer": "Properties can include validation logic in accessors",
        "explanation": "The correct answer is B) Properties can include validation logic in accessors. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q019",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A key difference between a property and a method is",
        "options": [
            "a property cannot return a value",
            "a method has no parameters",
            "a property is accessed like a field without parentheses",
            "a property requires parentheses"
        ],
        "correctAnswer": "a property is accessed like a field without parentheses",
        "explanation": "The correct answer is C) a property is accessed like a field without parentheses. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q020",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is generally recommended for exposing data?",
        "options": [
            "Static fields only",
            "Global variables",
            "Public fields instead of properties",
            "Properties instead of public fields"
        ],
        "correctAnswer": "Properties instead of public fields",
        "explanation": "The correct answer is D) Properties instead of public fields. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q021",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Indexers allow",
        "options": [
            "classes to be static",
            "methods to be sealed",
            "objects to be indexed like arrays",
            "variables to be constants"
        ],
        "correctAnswer": "objects to be indexed like arrays",
        "explanation": "The correct answer is C) objects to be indexed like arrays. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q022",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which keyword is used in indexer declarations?",
        "options": [
            "base",
            "this",
            "index",
            "new"
        ],
        "correctAnswer": "this",
        "explanation": "The correct answer is B) this. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q023",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is a correct indexer declaration?",
        "options": [
            "public int index[int i] { }",
            "public int this[int i] { get { return arr[i]; } set { arr[i] = value; } }",
            "public int[] this { }",
            "public int Indexer(int i) { }"
        ],
        "correctAnswer": "public int this[int i] { get { return arr[i]; } set { arr[i] = value; } }",
        "explanation": "The correct answer is B) public int this[int i] { get { return arr[i]; } set { arr[i] = value; } }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q024",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Indexers are accessed using",
        "options": [
            "square brackets [ ]",
            "parentheses ( )",
            "angle brackets < >",
            "curly braces { }"
        ],
        "correctAnswer": "square brackets [ ]",
        "explanation": "The correct answer is A) square brackets [ ]. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q025",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Indexers can have",
        "options": [
            "only one parameter ever",
            "multiple parameters",
            "no parameters",
            "only string parameters"
        ],
        "correctAnswer": "multiple parameters",
        "explanation": "The correct answer is B) multiple parameters. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q026",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Indexer parameters can be of",
        "options": [
            "only char",
            "only string",
            "only int",
            "any type, not just int"
        ],
        "correctAnswer": "any type, not just int",
        "explanation": "The correct answer is D) any type, not just int. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q027",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Can an interface declare an indexer?",
        "options": [
            "Yes",
            "Only read-only",
            "Only static",
            "No"
        ],
        "correctAnswer": "Yes",
        "explanation": "The correct answer is A) Yes. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q028",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is TRUE about indexers?",
        "options": [
            "They have names like methods",
            "They are declared with the void keyword",
            "They can be static",
            "They can be overloaded by parameter lists"
        ],
        "correctAnswer": "They can be overloaded by parameter lists",
        "explanation": "The correct answer is D) They can be overloaded by parameter lists. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q029",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A difference between properties and indexers is that",
        "options": [
            "an indexer has parameters and is accessed with [ ]",
            "properties are accessed with [ ]",
            "indexers can be static",
            "properties must have parameters"
        ],
        "correctAnswer": "an indexer has parameters and is accessed with [ ]",
        "explanation": "The correct answer is A) an indexer has parameters and is accessed with [ ]. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q030",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Init only setters were introduced in",
        "options": [
            "C# 5.0",
            "C# 7.0",
            "C# 2.0",
            "C# 9.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is D) C# 9.0. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q031",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "An init accessor allows a property to be set",
        "options": [
            "only during object initialization",
            "never",
            "only in static methods",
            "any time"
        ],
        "correctAnswer": "only during object initialization",
        "explanation": "The correct answer is A) only during object initialization. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q032",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Init-only properties are useful for creating",
        "options": [
            "sealed methods",
            "immutable objects",
            "static classes",
            "abstract classes"
        ],
        "correctAnswer": "immutable objects",
        "explanation": "The correct answer is B) immutable objects. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q033",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is the correct init declaration?",
        "options": [
            "public string Name { get; init; }",
            "public init string Name;",
            "public string Name { set init; }",
            "public string Name { init; get set; }"
        ],
        "correctAnswer": "public string Name { get; init; }",
        "explanation": "The correct answer is A) public string Name { get; init; }. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q034",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Record types were introduced in",
        "options": [
            "C# 7.0",
            "C# 9.0",
            "C# 3.0",
            "C# 8.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is B) C# 9.0. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q035",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which keyword declares a record?",
        "options": [
            "struct only",
            "data",
            "recordset",
            "record"
        ],
        "correctAnswer": "record",
        "explanation": "The correct answer is D) record. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q036",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A record provides built-in",
        "options": [
            "no equality",
            "value-based equality",
            "only reference equality",
            "no ToString"
        ],
        "correctAnswer": "value-based equality",
        "explanation": "The correct answer is B) value-based equality. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q037",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Two record instances with the same property values are considered",
        "options": [
            "equal using ==",
            "never equal",
            "invalid",
            "equal only by reference"
        ],
        "correctAnswer": "equal using ==",
        "explanation": "The correct answer is A) equal using ==. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q038",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Records are by default",
        "options": [
            "reference types",
            "sealed always but not copyable",
            "static",
            "value types"
        ],
        "correctAnswer": "reference types",
        "explanation": "The correct answer is A) reference types. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q039",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which expression creates a modified copy of a record?",
        "options": [
            "copy keyword",
            "new copy",
            "with expression",
            "clone()"
        ],
        "correctAnswer": "with expression",
        "explanation": "The correct answer is C) with expression. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q040",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which is a valid positional record?",
        "options": [
            "public record = Person(string Name);",
            "public record Person(string Name, int Age);",
            "record Person(Name, Age) { };",
            "public record Person { Name; Age; };"
        ],
        "correctAnswer": "public record Person(string Name, int Age);",
        "explanation": "The correct answer is B) public record Person(string Name, int Age);. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q041",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "A with expression such as p2 = p1 with { Age = 30 };",
        "options": [
            "creates a reference only",
            "throws an error",
            "modifies p1",
            "copies p1 and changes Age in the copy"
        ],
        "correctAnswer": "copies p1 and changes Age in the copy",
        "explanation": "The correct answer is D) copies p1 and changes Age in the copy. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q042",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Records are best suited for",
        "options": [
            "immutable data models",
            "low-level pointers",
            "static utilities",
            "GUI controls"
        ],
        "correctAnswer": "immutable data models",
        "explanation": "The correct answer is A) immutable data models. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q043",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Properties in a derived class can be overridden if the base property is",
        "options": [
            "sealed",
            "virtual or abstract",
            "static",
            "const"
        ],
        "correctAnswer": "virtual or abstract",
        "explanation": "The correct answer is B) virtual or abstract. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s08_q044",
        "category": "C#",
        "session": 8,
        "sessionTitle": "Properties, Indexers, and Record Types",
        "questionText": "Which of the following can have get and set with different access levels?",
        "options": [
            "Namespaces",
            "Fields",
            "Property accessors",
            "Constants"
        ],
        "correctAnswer": "Property accessors",
        "explanation": "The correct answer is C) Property accessors. (Properties, Indexers, and Record Types)"
    },
    {
        "id": "csharp_s09_q001",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A namespace in C# is used to",
        "options": [
            "organize classes and avoid naming conflicts",
            "store data",
            "create objects",
            "handle exceptions"
        ],
        "correctAnswer": "organize classes and avoid naming conflicts",
        "explanation": "The correct answer is A) organize classes and avoid naming conflicts. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q002",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which keyword declares a namespace?",
        "options": [
            "package",
            "module",
            "library",
            "namespace"
        ],
        "correctAnswer": "namespace",
        "explanation": "The correct answer is D) namespace. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q003",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which keyword imports a namespace?",
        "options": [
            "import",
            "include",
            "require",
            "using"
        ],
        "correctAnswer": "using",
        "explanation": "The correct answer is D) using. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q004",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "The most commonly used built-in namespace is",
        "options": [
            "Core",
            "Main",
            "System",
            "Base"
        ],
        "correctAnswer": "System",
        "explanation": "The correct answer is C) System. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q005",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Console belongs to the",
        "options": [
            "System.Linq",
            "System.Text",
            "System.IO only",
            "System namespace"
        ],
        "correctAnswer": "System namespace",
        "explanation": "The correct answer is D) System namespace. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q006",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which namespace contains the File and Directory classes?",
        "options": [
            "System.Data",
            "System.IO",
            "System.Text",
            "System.Net"
        ],
        "correctAnswer": "System.IO",
        "explanation": "The correct answer is B) System.IO. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q007",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which namespace contains LINQ types?",
        "options": [
            "System.Collections only",
            "System.Data.Linq only",
            "System.Query",
            "System.Linq"
        ],
        "correctAnswer": "System.Linq",
        "explanation": "The correct answer is D) System.Linq. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q008",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which namespace contains generic collections such as List<T>?",
        "options": [
            "System.Collections",
            "System.Collections.Generic",
            "System.Lists",
            "System.Generic"
        ],
        "correctAnswer": "System.Collections.Generic",
        "explanation": "The correct answer is B) System.Collections.Generic. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q009",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A custom namespace is",
        "options": [
            "one built into the CLR",
            "a keyword",
            "one defined by the programmer",
            "one from the .NET library"
        ],
        "correctAnswer": "one defined by the programmer",
        "explanation": "The correct answer is C) one defined by the programmer. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q010",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Namespaces can be nested using",
        "options": [
            "commas only",
            "semicolons",
            "dot notation or nested declarations",
            "colons"
        ],
        "correctAnswer": "dot notation or nested declarations",
        "explanation": "The correct answer is C) dot notation or nested declarations. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q011",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Types in a namespace are by default",
        "options": [
            "public",
            "private",
            "protected",
            "internal"
        ],
        "correctAnswer": "internal",
        "explanation": "The correct answer is D) internal. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q012",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Can namespace members be declared private?",
        "options": [
            "Only in nested namespaces",
            "No",
            "Only static",
            "Yes"
        ],
        "correctAnswer": "No",
        "explanation": "The correct answer is B) No. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q013",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Allowed access modifiers for types directly in a namespace are",
        "options": [
            "protected and internal",
            "only private",
            "private and protected",
            "public and internal"
        ],
        "correctAnswer": "public and internal",
        "explanation": "The correct answer is D) public and internal. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q014",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Qualified naming means",
        "options": [
            "using a hash",
            "using only the type name",
            "using the full namespace path with the type name",
            "using a keyword"
        ],
        "correctAnswer": "using the full namespace path with the type name",
        "explanation": "The correct answer is C) using the full namespace path with the type name. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q015",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which is a fully qualified name?",
        "options": [
            "Console",
            "WriteLine",
            "System.Console.WriteLine",
            "using System"
        ],
        "correctAnswer": "System.Console.WriteLine",
        "explanation": "The correct answer is C) System.Console.WriteLine. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q016",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A recommended namespace naming convention is",
        "options": [
            "a single letter",
            "numbers only",
            "lower-case only with underscores",
            "CompanyName.ProductName.Feature"
        ],
        "correctAnswer": "CompanyName.ProductName.Feature",
        "explanation": "The correct answer is D) CompanyName.ProductName.Feature. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q017",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Namespace names should use",
        "options": [
            "snake_case",
            "lowercase only",
            "PascalCase",
            "all caps"
        ],
        "correctAnswer": "PascalCase",
        "explanation": "The correct answer is C) PascalCase. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q018",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A namespace alias is created using",
        "options": [
            "alias Alias = Namespace;",
            "import Namespace as Alias;",
            "using Alias = Namespace;",
            "namespace Alias;"
        ],
        "correctAnswer": "using Alias = Namespace;",
        "explanation": "The correct answer is C) using Alias = Namespace;. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q019",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "The namespace alias qualifier is",
        "options": [
            "=>",
            ":",
            "::",
            "->"
        ],
        "correctAnswer": "::",
        "explanation": "The correct answer is C) ::. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q020",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Why use aliases?",
        "options": [
            "To resolve naming conflicts or shorten long names",
            "To define methods",
            "To create objects",
            "To speed up the program"
        ],
        "correctAnswer": "To resolve naming conflicts or shorten long names",
        "explanation": "The correct answer is A) To resolve naming conflicts or shorten long names. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q021",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "An exception is",
        "options": [
            "a compile-time warning",
            "a run-time error condition that disrupts normal program flow",
            "a keyword",
            "a comment"
        ],
        "correctAnswer": "a run-time error condition that disrupts normal program flow",
        "explanation": "The correct answer is B) a run-time error condition that disrupts normal program flow. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q022",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "The base class of all exceptions is",
        "options": [
            "System.Exception",
            "System.Throwable",
            "System.Fault",
            "System.Error"
        ],
        "correctAnswer": "System.Exception",
        "explanation": "The correct answer is A) System.Exception. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q023",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which block contains code that may throw an exception?",
        "options": [
            "try",
            "throw",
            "finally",
            "catch"
        ],
        "correctAnswer": "try",
        "explanation": "The correct answer is A) try. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q024",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which block handles an exception?",
        "options": [
            "finally",
            "catch",
            "try",
            "using"
        ],
        "correctAnswer": "catch",
        "explanation": "The correct answer is B) catch. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q025",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which block always executes whether or not an exception occurs?",
        "options": [
            "try",
            "throw",
            "finally",
            "catch"
        ],
        "correctAnswer": "finally",
        "explanation": "The correct answer is C) finally. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q026",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A general catch block",
        "options": [
            "catches nothing",
            "catches any exception without specifying a type",
            "is invalid",
            "runs before try"
        ],
        "correctAnswer": "catches any exception without specifying a type",
        "explanation": "The correct answer is B) catches any exception without specifying a type. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q027",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "When using multiple catch blocks, the order should be",
        "options": [
            "from most general to most specific",
            "any order",
            "from most specific to most general",
            "alphabetical"
        ],
        "correctAnswer": "from most specific to most general",
        "explanation": "The correct answer is C) from most specific to most general. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q028",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Placing catch (Exception) before catch (DivideByZeroException) causes",
        "options": [
            "a compile-time error",
            "no problem",
            "a warning only",
            "run-time success"
        ],
        "correctAnswer": "a compile-time error",
        "explanation": "The correct answer is A) a compile-time error. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q029",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which exception occurs on dividing an integer by zero?",
        "options": [
            "DivideByZeroException",
            "FormatException",
            "ArithmeticOverflow",
            "InvalidOperationException"
        ],
        "correctAnswer": "DivideByZeroException",
        "explanation": "The correct answer is A) DivideByZeroException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q030",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which exception occurs when accessing an invalid array index?",
        "options": [
            "ArgumentNullException",
            "FormatException",
            "InvalidCastException",
            "IndexOutOfRangeException"
        ],
        "correctAnswer": "IndexOutOfRangeException",
        "explanation": "The correct answer is D) IndexOutOfRangeException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q031",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which exception occurs when converting \"abc\" to int using int.Parse?",
        "options": [
            "InvalidCastException",
            "OverflowException",
            "NullReferenceException",
            "FormatException"
        ],
        "correctAnswer": "FormatException",
        "explanation": "The correct answer is D) FormatException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q032",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which exception occurs when using a null reference to access a member?",
        "options": [
            "InvalidCastException",
            "IndexOutOfRangeException",
            "NullReferenceException",
            "FormatException"
        ],
        "correctAnswer": "NullReferenceException",
        "explanation": "The correct answer is C) NullReferenceException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q033",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which exception occurs on an invalid explicit type cast?",
        "options": [
            "ArgumentNullException",
            "FormatException",
            "DivideByZeroException",
            "InvalidCastException"
        ],
        "correctAnswer": "InvalidCastException",
        "explanation": "The correct answer is D) InvalidCastException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q034",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which property of Exception provides the error description?",
        "options": [
            "Info",
            "Description",
            "Text",
            "Message"
        ],
        "correctAnswer": "Message",
        "explanation": "The correct answer is D) Message. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q035",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which property of Exception contains the call stack trace?",
        "options": [
            "Trace",
            "Stack",
            "CallStack",
            "StackTrace"
        ],
        "correctAnswer": "StackTrace",
        "explanation": "The correct answer is D) StackTrace. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q036",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which property of Exception gets the inner exception that caused the current one?",
        "options": [
            "Cause",
            "Previous",
            "Parent",
            "InnerException"
        ],
        "correctAnswer": "InnerException",
        "explanation": "The correct answer is D) InnerException. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q037",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which property gets the name of the application or object that caused the error?",
        "options": [
            "Target only",
            "Source",
            "Origin",
            "Name"
        ],
        "correctAnswer": "Source",
        "explanation": "The correct answer is B) Source. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q038",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "The throw statement is used to",
        "options": [
            "handle an exception",
            "end a program",
            "explicitly raise an exception",
            "catch an exception"
        ],
        "correctAnswer": "explicitly raise an exception",
        "explanation": "The correct answer is C) explicitly raise an exception. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q039",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which statement correctly throws an exception?",
        "options": [
            "raise new Exception(\"Error\");",
            "throw Exception(\"Error\");",
            "throws new Exception(\"Error\");",
            "throw new Exception(\"Error\");"
        ],
        "correctAnswer": "throw new Exception(\"Error\");",
        "explanation": "The correct answer is D) throw new Exception(\"Error\");. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q040",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Throw expressions were introduced to allow",
        "options": [
            "throw inside expressions such as ?? or the ternary operator",
            "throw only in catch",
            "throw in constants",
            "throw in namespaces"
        ],
        "correctAnswer": "throw inside expressions such as ?? or the ternary operator",
        "explanation": "The correct answer is A) throw inside expressions such as ?? or the ternary operator. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q041",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which uses a throw expression correctly?",
        "options": [
            "throw string s;",
            "string s = name ?? throw new ArgumentNullException();",
            "string s = ?? throw;",
            "string s = throw name;"
        ],
        "correctAnswer": "string s = name ?? throw new ArgumentNullException();",
        "explanation": "The correct answer is B) string s = name ?? throw new ArgumentNullException();. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q042",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Within a catch block, rethrowing the same exception while preserving the stack trace is done using",
        "options": [
            "throw ex;",
            "raise;",
            "throw;",
            "return ex;"
        ],
        "correctAnswer": "throw;",
        "explanation": "The correct answer is C) throw;. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q043",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "A finally block is typically used to",
        "options": [
            "define classes",
            "release resources like files and connections",
            "create threads",
            "declare variables"
        ],
        "correctAnswer": "release resources like files and connections",
        "explanation": "The correct answer is B) release resources like files and connections. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q044",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Nested try blocks are",
        "options": [
            "try with two finally blocks",
            "invalid in C#",
            "try blocks with no catch",
            "try blocks inside another try block"
        ],
        "correctAnswer": "try blocks inside another try block",
        "explanation": "The correct answer is D) try blocks inside another try block. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q045",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Can a single try have multiple catch blocks?",
        "options": [
            "Only with finally",
            "Only two",
            "No",
            "Yes"
        ],
        "correctAnswer": "Yes",
        "explanation": "The correct answer is D) Yes. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q046",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Only one catch block executes for a thrown exception",
        "options": [
            "False",
            "Only in nested try",
            "Only if general",
            "True"
        ],
        "correctAnswer": "True",
        "explanation": "The correct answer is D) True. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q047",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "What happens to an unhandled exception?",
        "options": [
            "It is ignored",
            "The program terminates abnormally",
            "It is automatically fixed",
            "It restarts the program"
        ],
        "correctAnswer": "The program terminates abnormally",
        "explanation": "The correct answer is B) The program terminates abnormally. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q048",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "The Exception Assistant in Visual Studio",
        "options": [
            "creates classes",
            "compiles code",
            "provides information and tips when an exception occurs while debugging",
            "formats code"
        ],
        "correctAnswer": "provides information and tips when an exception occurs while debugging",
        "explanation": "The correct answer is C) provides information and tips when an exception occurs while debugging. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q049",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Which keyword can be used to define a user-defined exception class base?",
        "options": [
            "struct",
            "interface",
            "static",
            "Exception (inherit from it)"
        ],
        "correctAnswer": "Exception (inherit from it)",
        "explanation": "The correct answer is D) Exception (inherit from it). (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s09_q050",
        "category": "C#",
        "session": 9,
        "sessionTitle": "Namespaces and Exception Handling",
        "questionText": "Custom exception classes are by convention named with the suffix",
        "options": [
            "Exception",
            "Fault",
            "Error",
            "Problem"
        ],
        "correctAnswer": "Exception",
        "explanation": "The correct answer is A) Exception. (Namespaces and Exception Handling)"
    },
    {
        "id": "csharp_s10_q001",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "A delegate in C# is",
        "options": [
            "a namespace",
            "a type-safe reference to a method",
            "a loop",
            "a data type for text"
        ],
        "correctAnswer": "a type-safe reference to a method",
        "explanation": "The correct answer is B) a type-safe reference to a method. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q002",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Delegates are similar to",
        "options": [
            "constants",
            "arrays",
            "classes with no members",
            "function pointers in C/C++"
        ],
        "correctAnswer": "function pointers in C/C++",
        "explanation": "The correct answer is D) function pointers in C/C++. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q003",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which keyword declares a delegate?",
        "options": [
            "method",
            "func",
            "delegate",
            "event"
        ],
        "correctAnswer": "delegate",
        "explanation": "The correct answer is C) delegate. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q004",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which is a valid delegate declaration?",
        "options": [
            "delegate public int(int a, int b);",
            "public delegate = int Calc(int a);",
            "public delegate int Calc(int a, int b);",
            "public delegate Calc(int a, int b);"
        ],
        "correctAnswer": "public delegate int Calc(int a, int b);",
        "explanation": "The correct answer is C) public delegate int Calc(int a, int b);. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q005",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "A delegate can reference a method only if",
        "options": [
            "the method has a matching signature and return type",
            "the method is static",
            "the method is private",
            "the method is void"
        ],
        "correctAnswer": "the method has a matching signature and return type",
        "explanation": "The correct answer is A) the method has a matching signature and return type. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q006",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which step instantiates a delegate?",
        "options": [
            "Calc c = Add();",
            "Calc c = new Calc(Add);",
            "Calc c = typeof(Add);",
            "delegate c = Add;"
        ],
        "correctAnswer": "Calc c = new Calc(Add);",
        "explanation": "The correct answer is B) Calc c = new Calc(Add);. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q007",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Invoking a delegate is done by",
        "options": [
            "exec c",
            "c(2, 3) or c.Invoke(2, 3)",
            "call c(2,3)",
            "c.Run(2,3)"
        ],
        "correctAnswer": "c(2, 3) or c.Invoke(2, 3)",
        "explanation": "The correct answer is B) c(2, 3) or c.Invoke(2, 3). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q008",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "In the opening snippet of this book, CalculateValue calc = t.GetValue; calc(\"Test\") returns",
        "options": [
            "0",
            "an error",
            "4",
            "\"Test\""
        ],
        "correctAnswer": "4",
        "explanation": "The correct answer is C) 4. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q009",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "A multicast delegate",
        "options": [
            "can't be invoked",
            "holds only static methods",
            "holds references to more than one method",
            "holds only one method"
        ],
        "correctAnswer": "holds references to more than one method",
        "explanation": "The correct answer is C) holds references to more than one method. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q010",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which operator adds a method to a multicast delegate?",
        "options": [
            "-= only removes",
            "==",
            "*=",
            "+="
        ],
        "correctAnswer": "+=",
        "explanation": "The correct answer is D) +=. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q011",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which operator removes a method from a delegate's invocation list?",
        "options": [
            "!=",
            "-=",
            "+=",
            "/="
        ],
        "correctAnswer": "-=",
        "explanation": "The correct answer is B) -=. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q012",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "A multicast delegate invokes methods in",
        "options": [
            "the order they were added",
            "alphabetical order",
            "reverse order",
            "random order"
        ],
        "correctAnswer": "the order they were added",
        "explanation": "The correct answer is A) the order they were added. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q013",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "A multicast delegate with a non-void return type returns",
        "options": [
            "null",
            "a sum of all values",
            "the value of the last method invoked",
            "the first method's value"
        ],
        "correctAnswer": "the value of the last method invoked",
        "explanation": "The correct answer is C) the value of the last method invoked. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q014",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "All delegates in C# are derived from",
        "options": [
            "System.Delegate",
            "System.Action",
            "System.Func",
            "System.Object only without Delegate"
        ],
        "correctAnswer": "System.Delegate",
        "explanation": "The correct answer is A) System.Delegate. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q015",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "The delegate-event model uses",
        "options": [
            "abstract classes",
            "only inheritance",
            "static classes",
            "publishers that raise events and subscribers that handle them"
        ],
        "correctAnswer": "publishers that raise events and subscribers that handle them",
        "explanation": "The correct answer is D) publishers that raise events and subscribers that handle them. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q016",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "An event in C# is",
        "options": [
            "a method body",
            "a message sent by an object to signal that something happened",
            "a class",
            "a loop"
        ],
        "correctAnswer": "a message sent by an object to signal that something happened",
        "explanation": "The correct answer is B) a message sent by an object to signal that something happened. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q017",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which keyword declares an event?",
        "options": [
            "delegate",
            "signal",
            "trigger",
            "event"
        ],
        "correctAnswer": "event",
        "explanation": "The correct answer is D) event. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q018",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Events are based on",
        "options": [
            "arrays",
            "namespaces",
            "interfaces only",
            "delegates"
        ],
        "correctAnswer": "delegates",
        "explanation": "The correct answer is D) delegates. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q019",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "The class that raises an event is the",
        "options": [
            "publisher",
            "consumer",
            "observer",
            "subscriber"
        ],
        "correctAnswer": "publisher",
        "explanation": "The correct answer is A) publisher. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q020",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "The class that responds to an event is the",
        "options": [
            "publisher",
            "creator",
            "sender only",
            "subscriber"
        ],
        "correctAnswer": "subscriber",
        "explanation": "The correct answer is D) subscriber. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q021",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which operator subscribes a handler to an event?",
        "options": [
            "::",
            "->",
            "=",
            "+="
        ],
        "correctAnswer": "+=",
        "explanation": "The correct answer is D) +=. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q022",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which is the standard event handler delegate in .NET?",
        "options": [
            "ActionHandler",
            "EventHandler",
            "SignalHandler",
            "MethodHandler"
        ],
        "correctAnswer": "EventHandler",
        "explanation": "The correct answer is B) EventHandler. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q023",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "An event can be raised",
        "options": [
            "from Main only",
            "from any class",
            "only from within the class that declares it",
            "from namespaces"
        ],
        "correctAnswer": "only from within the class that declares it",
        "explanation": "The correct answer is C) only from within the class that declares it. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q024",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Before raising an event, a good practice is to check",
        "options": [
            "whether it is static",
            "whether it is null (has subscribers)",
            "its name",
            "its type"
        ],
        "correctAnswer": "whether it is null (has subscribers)",
        "explanation": "The correct answer is B) whether it is null (has subscribers). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q025",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which syntax safely raises an event?",
        "options": [
            "raise MyEvent;",
            "MyEvent.Fire();",
            "MyEvent?.Invoke(this, EventArgs.Empty);",
            "MyEvent.Raise();"
        ],
        "correctAnswer": "MyEvent?.Invoke(this, EventArgs.Empty);",
        "explanation": "The correct answer is C) MyEvent?.Invoke(this, EventArgs.Empty);. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q026",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Collections are",
        "options": [
            "only arrays",
            "only numbers",
            "only strings",
            "classes that store and manage groups of related objects"
        ],
        "correctAnswer": "classes that store and manage groups of related objects",
        "explanation": "The correct answer is D) classes that store and manage groups of related objects. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q027",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "The non-generic collection classes are in",
        "options": [
            "System.Collections",
            "System.Text",
            "System.Collections.Generic",
            "System.Linq"
        ],
        "correctAnswer": "System.Collections",
        "explanation": "The correct answer is A) System.Collections. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q028",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "The generic collection classes are in",
        "options": [
            "System.Collections.Generic",
            "System.Generics",
            "System.Linq only",
            "System.Collections"
        ],
        "correctAnswer": "System.Collections.Generic",
        "explanation": "The correct answer is A) System.Collections.Generic. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q029",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "ArrayList is",
        "options": [
            "a dynamically resizable collection that stores objects",
            "a fixed-size array",
            "a key-value collection",
            "a generic collection"
        ],
        "correctAnswer": "a dynamically resizable collection that stores objects",
        "explanation": "The correct answer is A) a dynamically resizable collection that stores objects. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q030",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which ArrayList method adds an element?",
        "options": [
            "Append()",
            "Add()",
            "Insert() only",
            "Push()"
        ],
        "correctAnswer": "Add()",
        "explanation": "The correct answer is B) Add(). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q031",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which ArrayList property gets the number of elements?",
        "options": [
            "Length",
            "Total",
            "Count",
            "Size"
        ],
        "correctAnswer": "Count",
        "explanation": "The correct answer is C) Count. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q032",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which ArrayList method removes the first occurrence of a value?",
        "options": [
            "Remove()",
            "Delete()",
            "Clear() only",
            "Pop()"
        ],
        "correctAnswer": "Remove()",
        "explanation": "The correct answer is A) Remove(). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q033",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which ArrayList method removes all elements?",
        "options": [
            "Clear()",
            "Empty()",
            "Remove()",
            "RemoveAt()"
        ],
        "correctAnswer": "Clear()",
        "explanation": "The correct answer is A) Clear(). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q034",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which ArrayList method sorts its elements?",
        "options": [
            "Sort()",
            "Arrange()",
            "SortAll()",
            "Order()"
        ],
        "correctAnswer": "Sort()",
        "explanation": "The correct answer is A) Sort(). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q035",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "ArrayList elements are stored as",
        "options": [
            "object",
            "the exact type",
            "string only",
            "int only"
        ],
        "correctAnswer": "object",
        "explanation": "The correct answer is A) object. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q036",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Hashtable stores data as",
        "options": [
            "key-value pairs",
            "a queue",
            "a stack",
            "single values"
        ],
        "correctAnswer": "key-value pairs",
        "explanation": "The correct answer is A) key-value pairs. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q037",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "In a Hashtable, keys must be",
        "options": [
            "null",
            "unique",
            "duplicate",
            "integers only"
        ],
        "correctAnswer": "unique",
        "explanation": "The correct answer is B) unique. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q038",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Hashtable stores each entry as a",
        "options": [
            "KeyValuePair always",
            "Node",
            "Tuple",
            "DictionaryEntry"
        ],
        "correctAnswer": "DictionaryEntry",
        "explanation": "The correct answer is D) DictionaryEntry. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q039",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "SortedList stores key-value pairs",
        "options": [
            "sorted by keys",
            "sorted by values only",
            "in random order",
            "in insertion order always"
        ],
        "correctAnswer": "sorted by keys",
        "explanation": "The correct answer is A) sorted by keys. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q040",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which method adds a key-value pair to a Hashtable or SortedList?",
        "options": [
            "Push(key)",
            "Insert(value)",
            "Put(key, value)",
            "Add(key, value)"
        ],
        "correctAnswer": "Add(key, value)",
        "explanation": "The correct answer is D) Add(key, value). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q041",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which property retrieves all keys in a Hashtable?",
        "options": [
            "Names",
            "Keys",
            "AllKeys",
            "KeyList"
        ],
        "correctAnswer": "Keys",
        "explanation": "The correct answer is B) Keys. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q042",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Dictionary<TKey, TValue> is",
        "options": [
            "a generic collection of key-value pairs",
            "a stack",
            "a sorted array",
            "a non-generic collection"
        ],
        "correctAnswer": "a generic collection of key-value pairs",
        "explanation": "The correct answer is A) a generic collection of key-value pairs. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q043",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Compared with Hashtable, Dictionary<TKey,TValue> is",
        "options": [
            "unable to store keys",
            "type-safe and generic",
            "slower always",
            "non-generic"
        ],
        "correctAnswer": "type-safe and generic",
        "explanation": "The correct answer is B) type-safe and generic. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q044",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which method checks if a Dictionary contains a key?",
        "options": [
            "KeyExists()",
            "FindKey()",
            "ContainsKey()",
            "HasKey()"
        ],
        "correctAnswer": "ContainsKey()",
        "explanation": "The correct answer is C) ContainsKey(). (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q045",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which is a valid collection initializer?",
        "options": [
            "var list = List<int>[1,2,3];",
            "var list = new List<int> = (1,2,3);",
            "var list = new List<int>(1, 2, 3);",
            "var list = new List<int> { 1, 2, 3 };"
        ],
        "correctAnswer": "var list = new List<int> { 1, 2, 3 };",
        "explanation": "The correct answer is D) var list = new List<int> { 1, 2, 3 };. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q046",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which is a valid dictionary initializer?",
        "options": [
            "new Dictionary<int,string> { {1,\"a\"}, {2,\"b\"} }",
            "Dictionary { 1:\"a\" }",
            "new Dictionary(1,\"a\")",
            "new Dictionary<int,string> = (1,\"a\")"
        ],
        "correctAnswer": "new Dictionary<int,string> { {1,\"a\"}, {2,\"b\"} }",
        "explanation": "The correct answer is A) new Dictionary<int,string> { {1,\"a\"}, {2,\"b\"} }. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q047",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Accessing a missing key in a Dictionary using the indexer throws",
        "options": [
            "NullReferenceException",
            "KeyNotFoundException",
            "FormatException",
            "IndexOutOfRangeException"
        ],
        "correctAnswer": "KeyNotFoundException",
        "explanation": "The correct answer is B) KeyNotFoundException. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q048",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Adding a duplicate key to a Dictionary using Add() throws",
        "options": [
            "KeyNotFoundException",
            "ArgumentException",
            "OverflowException",
            "FormatException"
        ],
        "correctAnswer": "ArgumentException",
        "explanation": "The correct answer is B) ArgumentException. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q049",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which collection is best for a first-in, first-out order?",
        "options": [
            "SortedList",
            "Hashtable",
            "Queue",
            "Stack"
        ],
        "correctAnswer": "Queue",
        "explanation": "The correct answer is C) Queue. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s10_q050",
        "category": "C#",
        "session": 10,
        "sessionTitle": "Events, Delegates, and Collections",
        "questionText": "Which collection is best for last-in, first-out order?",
        "options": [
            "ArrayList",
            "Stack",
            "Queue",
            "Dictionary"
        ],
        "correctAnswer": "Stack",
        "explanation": "The correct answer is B) Stack. (Events, Delegates, and Collections)"
    },
    {
        "id": "csharp_s11_q001",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Generics allow you to",
        "options": [
            "define classes and methods with placeholder type parameters",
            "avoid compiling",
            "create only int classes",
            "remove type checking"
        ],
        "correctAnswer": "define classes and methods with placeholder type parameters",
        "explanation": "The correct answer is A) define classes and methods with placeholder type parameters. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q002",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "The type parameter in a generic class is written inside",
        "options": [
            "angle brackets < >",
            "parentheses ( )",
            "square brackets [ ]",
            "braces { }"
        ],
        "correctAnswer": "angle brackets < >",
        "explanation": "The correct answer is A) angle brackets < >. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q003",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "By convention a single type parameter is named",
        "options": [
            "T",
            "TypeOne only",
            "X",
            "Z"
        ],
        "correctAnswer": "T",
        "explanation": "The correct answer is A) T. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q004",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which is a benefit of generics?",
        "options": [
            "Runtime casting errors",
            "Type safety and no boxing/unboxing for value types",
            "Less reusable code",
            "Slower performance"
        ],
        "correctAnswer": "Type safety and no boxing/unboxing for value types",
        "explanation": "The correct answer is B) Type safety and no boxing/unboxing for value types. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q005",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Generics promote",
        "options": [
            "code reusability",
            "code duplication",
            "slower code",
            "manual casting"
        ],
        "correctAnswer": "code reusability",
        "explanation": "The correct answer is A) code reusability. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q006",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which namespace contains generic collection types?",
        "options": [
            "System.Data",
            "System.Reflection",
            "System.Collections.Generic",
            "System.Generic"
        ],
        "correctAnswer": "System.Collections.Generic",
        "explanation": "The correct answer is C) System.Collections.Generic. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q007",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which namespace contains Collection<T> and ReadOnlyCollection<T>?",
        "options": [
            "System.Collections.ObjectModel",
            "System.Linq",
            "System.Text",
            "System.Collections.Specialized"
        ],
        "correctAnswer": "System.Collections.ObjectModel",
        "explanation": "The correct answer is A) System.Collections.ObjectModel. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q008",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which is a valid generic class declaration?",
        "options": [
            "class Box[T] { }",
            "class Box<T> { }",
            "class Box(T) { }",
            "generic class Box<T> { }"
        ],
        "correctAnswer": "class Box<T> { }",
        "explanation": "The correct answer is B) class Box<T> { }. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q009",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Given class Box<T>, which creates a Box of int?",
        "options": [
            "Box b = new Box<int>;",
            "Box<> b = new Box();",
            "new Box(int) b;",
            "Box<int> b = new Box<int>();"
        ],
        "correctAnswer": "Box<int> b = new Box<int>();",
        "explanation": "The correct answer is D) Box<int> b = new Box<int>();. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q010",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Constraints on type parameters are specified using",
        "options": [
            "the if keyword",
            "the on keyword",
            "the where keyword",
            "the with keyword"
        ],
        "correctAnswer": "the where keyword",
        "explanation": "The correct answer is C) the where keyword. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q011",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which constraint requires T to be a reference type?",
        "options": [
            "where T : new()",
            "where T : base",
            "where T : class",
            "where T : struct"
        ],
        "correctAnswer": "where T : class",
        "explanation": "The correct answer is C) where T : class. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q012",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which constraint requires T to be a value type?",
        "options": [
            "where T : value",
            "where T : struct",
            "where T : class",
            "where T : new()"
        ],
        "correctAnswer": "where T : struct",
        "explanation": "The correct answer is B) where T : struct. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q013",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which constraint requires T to have a public parameterless constructor?",
        "options": [
            "where T : default",
            "where T : new()",
            "where T : ctor",
            "where T : class"
        ],
        "correctAnswer": "where T : new()",
        "explanation": "The correct answer is B) where T : new(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q014",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which constraint requires T to derive from Animal?",
        "options": [
            "where T -> Animal",
            "where T : Animal",
            "where T : extends Animal",
            "where T is Animal"
        ],
        "correctAnswer": "where T : Animal",
        "explanation": "The correct answer is B) where T : Animal. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q015",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which constraint requires T to implement IComparable?",
        "options": [
            "where T : IComparable",
            "where T == IComparable",
            "where T : implements IComparable",
            "where T <- IComparable"
        ],
        "correctAnswer": "where T : IComparable",
        "explanation": "The correct answer is A) where T : IComparable. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q016",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "When multiple constraints are used, new() must",
        "options": [
            "appear first",
            "appear in the middle",
            "be omitted",
            "appear last"
        ],
        "correctAnswer": "appear last",
        "explanation": "The correct answer is D) appear last. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q017",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A generic class can be inherited by",
        "options": [
            "only structs",
            "no class",
            "a concrete class that specifies the type argument",
            "only abstract classes"
        ],
        "correctAnswer": "a concrete class that specifies the type argument",
        "explanation": "The correct answer is C) a concrete class that specifies the type argument. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q018",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which is a generic method declaration?",
        "options": [
            "generic void Swap(T a)",
            "void <T>Swap(T a)",
            "void Swap<T>(ref T a, ref T b)",
            "void Swap(T<>)"
        ],
        "correctAnswer": "void Swap<T>(ref T a, ref T b)",
        "explanation": "The correct answer is C) void Swap<T>(ref T a, ref T b). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q019",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "How do you call generic method Swap<T> for ints x and y?",
        "options": [
            "Swap(int)(x, y);",
            "Swap[int](x, y);",
            "Swap.int(x,y);",
            "Swap<int>(ref x, ref y);"
        ],
        "correctAnswer": "Swap<int>(ref x, ref y);",
        "explanation": "The correct answer is D) Swap<int>(ref x, ref y);. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q020",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "The compiler can often infer the type argument of a generic method",
        "options": [
            "never",
            "from the arguments passed",
            "only for strings",
            "only from constraints"
        ],
        "correctAnswer": "from the arguments passed",
        "explanation": "The correct answer is B) from the arguments passed. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q021",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A generic interface is declared as",
        "options": [
            "generic interface IRepo { }",
            "interface IRepo<T> { }",
            "interface IRepo(T) { }",
            "interface<T> IRepo { }"
        ],
        "correctAnswer": "interface IRepo<T> { }",
        "explanation": "The correct answer is B) interface IRepo<T> { }. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q022",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which is a built-in generic delegate that returns a value?",
        "options": [
            "Handler<T>",
            "Action<T>",
            "Func<T, TResult>",
            "Predicate<T> returns void"
        ],
        "correctAnswer": "Func<T, TResult>",
        "explanation": "The correct answer is C) Func<T, TResult>. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q023",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which built-in generic delegate returns void?",
        "options": [
            "Converter<T>",
            "Predicate<T>",
            "Action<T>",
            "Func<T>"
        ],
        "correctAnswer": "Action<T>",
        "explanation": "The correct answer is C) Action<T>. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q024",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Predicate<T> returns",
        "options": [
            "T",
            "int",
            "void",
            "bool"
        ],
        "correctAnswer": "bool",
        "explanation": "The correct answer is D) bool. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q025",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Methods can be overloaded using",
        "options": [
            "different names only",
            "different access modifiers only",
            "different return types only",
            "different numbers of type parameters"
        ],
        "correctAnswer": "different numbers of type parameters",
        "explanation": "The correct answer is D) different numbers of type parameters. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q026",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A virtual method in a generic class can be",
        "options": [
            "only private",
            "only static",
            "overridden in a derived class",
            "never overridden"
        ],
        "correctAnswer": "overridden in a derived class",
        "explanation": "The correct answer is C) overridden in a derived class. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q027",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "List<T> is",
        "options": [
            "a fixed array",
            "a non-generic list",
            "a generic dynamic array",
            "a dictionary"
        ],
        "correctAnswer": "a generic dynamic array",
        "explanation": "The correct answer is C) a generic dynamic array. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q028",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which statement creates a list of strings?",
        "options": [
            "list<string> l = [];",
            "List l = new List<string>;",
            "List<string> l = new List<string>();",
            "List<> l = new string();"
        ],
        "correctAnswer": "List<string> l = new List<string>();",
        "explanation": "The correct answer is C) List<string> l = new List<string>();. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q029",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which List<T> method adds an element?",
        "options": [
            "Push()",
            "Put()",
            "Insert() only at end",
            "Add()"
        ],
        "correctAnswer": "Add()",
        "explanation": "The correct answer is D) Add(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q030",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which property of List<T> returns the number of elements?",
        "options": [
            "Size",
            "Total",
            "Count",
            "Length"
        ],
        "correctAnswer": "Count",
        "explanation": "The correct answer is C) Count. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q031",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "What does default(T) return for a value type like int?",
        "options": [
            "null",
            "1",
            "-1",
            "0"
        ],
        "correctAnswer": "0",
        "explanation": "The correct answer is D) 0. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q032",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "What does default(T) return for a reference type?",
        "options": [
            "\"\"",
            "0",
            "undefined",
            "null"
        ],
        "correctAnswer": "null",
        "explanation": "The correct answer is D) null. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q033",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Iterators are used to",
        "options": [
            "define namespaces",
            "step through a collection one element at a time",
            "compile code",
            "declare delegates"
        ],
        "correctAnswer": "step through a collection one element at a time",
        "explanation": "The correct answer is B) step through a collection one element at a time. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q034",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which keyword returns each element in an iterator method?",
        "options": [
            "return each",
            "iterate",
            "yield next",
            "yield return"
        ],
        "correctAnswer": "yield return",
        "explanation": "The correct answer is D) yield return. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q035",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which keyword ends iteration early in an iterator?",
        "options": [
            "break only",
            "return false",
            "stop",
            "yield break"
        ],
        "correctAnswer": "yield break",
        "explanation": "The correct answer is D) yield break. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q036",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "An iterator method must have a return type of",
        "options": [
            "void",
            "int",
            "IEnumerable, IEnumerable<T>, IEnumerator, or IEnumerator<T>",
            "string"
        ],
        "correctAnswer": "IEnumerable, IEnumerable<T>, IEnumerator, or IEnumerator<T>",
        "explanation": "The correct answer is C) IEnumerable, IEnumerable<T>, IEnumerator, or IEnumerator<T>. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q037",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which interface do you implement to make a class usable in foreach?",
        "options": [
            "ICloneable",
            "IEnumerable",
            "IDisposable",
            "IComparable"
        ],
        "correctAnswer": "IEnumerable",
        "explanation": "The correct answer is B) IEnumerable. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q038",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which method of IEnumerable returns an enumerator?",
        "options": [
            "Next()",
            "GetEnumerator()",
            "Current()",
            "MoveNext()"
        ],
        "correctAnswer": "GetEnumerator()",
        "explanation": "The correct answer is B) GetEnumerator(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q039",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which IEnumerator method advances to the next element?",
        "options": [
            "Advance()",
            "Next()",
            "MoveNext()",
            "GetNext()"
        ],
        "correctAnswer": "MoveNext()",
        "explanation": "The correct answer is C) MoveNext(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q040",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which IEnumerator property returns the current element?",
        "options": [
            "Element",
            "Current",
            "Value",
            "Item"
        ],
        "correctAnswer": "Current",
        "explanation": "The correct answer is B) Current. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q041",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Iterators produce values",
        "options": [
            "all at once",
            "only once at compile time",
            "lazily, one at a time",
            "only in reverse"
        ],
        "correctAnswer": "lazily, one at a time",
        "explanation": "The correct answer is C) lazily, one at a time. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q042",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A named iterator is",
        "options": [
            "an iterator without yield",
            "an iterator method with a custom name that can be called in foreach",
            "a delegate",
            "a property"
        ],
        "correctAnswer": "an iterator method with a custom name that can be called in foreach",
        "explanation": "The correct answer is B) an iterator method with a custom name that can be called in foreach. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q043",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A generic iterator returns",
        "options": [
            "IEnumerable only",
            "void",
            "object[]",
            "IEnumerable<T>"
        ],
        "correctAnswer": "IEnumerable<T>",
        "explanation": "The correct answer is D) IEnumerable<T>. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q044",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "A benefit of iterators is",
        "options": [
            "they avoid memory entirely",
            "they remove loops",
            "they compile faster",
            "simpler code than implementing IEnumerator manually"
        ],
        "correctAnswer": "simpler code than implementing IEnumerator manually",
        "explanation": "The correct answer is D) simpler code than implementing IEnumerator manually. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q045",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Can a yield return statement appear in a try block that has a catch clause?",
        "options": [
            "Yes",
            "Only in Main",
            "No",
            "Only in finally"
        ],
        "correctAnswer": "No",
        "explanation": "The correct answer is C) No. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q046",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Which is TRUE of Dictionary<TKey,TValue> vs. Hashtable?",
        "options": [
            "Dictionary avoids boxing for value types",
            "Dictionary is non-generic",
            "Hashtable is generic",
            "Dictionary stores object keys only"
        ],
        "correctAnswer": "Dictionary avoids boxing for value types",
        "explanation": "The correct answer is A) Dictionary avoids boxing for value types. (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q047",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "The Stack<T> method to add an item is",
        "options": [
            "Enqueue()",
            "Add()",
            "Push()",
            "Insert()"
        ],
        "correctAnswer": "Push()",
        "explanation": "The correct answer is C) Push(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q048",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "The Queue<T> method to add an item is",
        "options": [
            "Enqueue()",
            "Add()",
            "Push()",
            "Put()"
        ],
        "correctAnswer": "Enqueue()",
        "explanation": "The correct answer is A) Enqueue(). (Generics and Iterators)"
    },
    {
        "id": "csharp_s11_q049",
        "category": "C#",
        "session": 11,
        "sessionTitle": "Generics and Iterators",
        "questionText": "Generic constraints help the compiler",
        "options": [
            "know which members can be used on T",
            "skip type checking",
            "reduce file size",
            "remove generics"
        ],
        "correctAnswer": "know which members can be used on T",
        "explanation": "The correct answer is A) know which members can be used on T. (Generics and Iterators)"
    },
    {
        "id": "csharp_s12_q001",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "An anonymous method",
        "options": [
            "has a name",
            "is declared with the abstract keyword",
            "is a class",
            "passes a block of unnamed code as a delegate parameter"
        ],
        "correctAnswer": "passes a block of unnamed code as a delegate parameter",
        "explanation": "The correct answer is D) passes a block of unnamed code as a delegate parameter. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q002",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Anonymous methods are created using the",
        "options": [
            "lambda keyword",
            "delegate keyword",
            "anon keyword",
            "func keyword"
        ],
        "correctAnswer": "delegate keyword",
        "explanation": "The correct answer is B) delegate keyword. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q003",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which is a valid anonymous method?",
        "options": [
            "anonymous(int x) { }",
            "delegate(int x) { return x * 2; }",
            "delegate x => x * 2",
            "def(int x) { }"
        ],
        "correctAnswer": "delegate(int x) { return x * 2; }",
        "explanation": "The correct answer is B) delegate(int x) { return x * 2; }. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q004",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Anonymous methods were introduced in",
        "options": [
            "C# 2.0",
            "C# 6.0",
            "C# 9.0",
            "C# 1.0"
        ],
        "correctAnswer": "C# 2.0",
        "explanation": "The correct answer is A) C# 2.0. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q005",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Extension methods allow you to",
        "options": [
            "add methods to existing types without modifying them",
            "create namespaces",
            "delete methods",
            "make classes sealed"
        ],
        "correctAnswer": "add methods to existing types without modifying them",
        "explanation": "The correct answer is A) add methods to existing types without modifying them. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q006",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "An extension method itself must be",
        "options": [
            "instance",
            "abstract",
            "static",
            "private"
        ],
        "correctAnswer": "static",
        "explanation": "The correct answer is C) static. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q007",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "The first parameter of an extension method is preceded by",
        "options": [
            "params",
            "base",
            "ref",
            "this"
        ],
        "correctAnswer": "this",
        "explanation": "The correct answer is D) this. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q008",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which is a valid extension method for string?",
        "options": [
            "public int WordCount(this string s)",
            "public static int WordCount(this string s)",
            "public static int WordCount(string this s)",
            "public static int WordCount(string s)"
        ],
        "correctAnswer": "public static int WordCount(this string s)",
        "explanation": "The correct answer is B) public static int WordCount(this string s). (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q009",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Anonymous types are created using",
        "options": [
            "struct keyword",
            "class keyword",
            "new { } with properties",
            "the anonymous keyword"
        ],
        "correctAnswer": "new { } with properties",
        "explanation": "The correct answer is C) new { } with properties. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q010",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Properties of anonymous types are",
        "options": [
            "read-write",
            "read-only",
            "static",
            "private only"
        ],
        "correctAnswer": "read-only",
        "explanation": "The correct answer is B) read-only. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q011",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which creates an anonymous type?",
        "options": [
            "var p = new Person();",
            "var p = { Name = \"Ali\" };",
            "var p = new { Name = \"Ali\", Age = 25 };",
            "anonymous p = new();"
        ],
        "correctAnswer": "var p = new { Name = \"Ali\", Age = 25 };",
        "explanation": "The correct answer is C) var p = new { Name = \"Ali\", Age = 25 };. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q012",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Anonymous types derive directly from",
        "options": [
            "System.ValueType",
            "System.Object",
            "System.Anonymous",
            "System.Delegate"
        ],
        "correctAnswer": "System.Object",
        "explanation": "The correct answer is B) System.Object. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q013",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Partial types allow",
        "options": [
            "sealing members",
            "static imports",
            "hiding classes",
            "splitting a class, struct, or interface across multiple files"
        ],
        "correctAnswer": "splitting a class, struct, or interface across multiple files",
        "explanation": "The correct answer is D) splitting a class, struct, or interface across multiple files. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q014",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which keyword defines partial types?",
        "options": [
            "split",
            "multiple",
            "part",
            "partial"
        ],
        "correctAnswer": "partial",
        "explanation": "The correct answer is D) partial. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q015",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Partial type definitions must be in",
        "options": [
            "different namespaces",
            "different assemblies",
            "only different files in different projects",
            "the same namespace and assembly"
        ],
        "correctAnswer": "the same namespace and assembly",
        "explanation": "The correct answer is D) the same namespace and assembly. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q016",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "If one part of a partial class is declared abstract",
        "options": [
            "it is an error",
            "only that part is abstract",
            "the entire class is considered abstract",
            "nothing changes"
        ],
        "correctAnswer": "the entire class is considered abstract",
        "explanation": "The correct answer is C) the entire class is considered abstract. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q017",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Partial methods",
        "options": [
            "must always be implemented",
            "are static always",
            "are public always",
            "have a definition in one part and an optional implementation in another"
        ],
        "correctAnswer": "have a definition in one part and an optional implementation in another",
        "explanation": "The correct answer is D) have a definition in one part and an optional implementation in another. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q018",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Traditionally, a partial method's return type must be",
        "options": [
            "void",
            "bool",
            "string",
            "int"
        ],
        "correctAnswer": "void",
        "explanation": "The correct answer is A) void. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q019",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Nullable types allow",
        "options": [
            "reference types to hold null only",
            "arrays to resize",
            "strings to be sealed",
            "value types to hold null"
        ],
        "correctAnswer": "value types to hold null",
        "explanation": "The correct answer is D) value types to hold null. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q020",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which declares a nullable int?",
        "options": [
            "int! x = null;",
            "int? x = null;",
            "nullable int x;",
            "int x = null;"
        ],
        "correctAnswer": "int? x = null;",
        "explanation": "The correct answer is B) int? x = null;. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q021",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which read-only property of a nullable type tells whether it has a value?",
        "options": [
            "Exists",
            "IsNull",
            "Present",
            "HasValue"
        ],
        "correctAnswer": "HasValue",
        "explanation": "The correct answer is D) HasValue. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q022",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which property returns the underlying value of a nullable type?",
        "options": [
            "Underlying",
            "Item",
            "Value",
            "Data"
        ],
        "correctAnswer": "Value",
        "explanation": "The correct answer is C) Value. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q023",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Accessing Value when HasValue is false throws",
        "options": [
            "NullReferenceException",
            "InvalidOperationException",
            "ArgumentException",
            "FormatException"
        ],
        "correctAnswer": "InvalidOperationException",
        "explanation": "The correct answer is B) InvalidOperationException. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q024",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which method returns the value or a default if null?",
        "options": [
            "ValueOrNone()",
            "GetOrNull()",
            "Default()",
            "GetValueOrDefault()"
        ],
        "correctAnswer": "GetValueOrDefault()",
        "explanation": "The correct answer is D) GetValueOrDefault(). (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q025",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "The null-coalescing operator is",
        "options": [
            "?.",
            "??",
            "?:",
            "!!"
        ],
        "correctAnswer": "??",
        "explanation": "The correct answer is B) ??. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q026",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which operator provides safe member access on a possibly null reference?",
        "options": [
            "::",
            "?.",
            "->",
            "??"
        ],
        "correctAnswer": "?.",
        "explanation": "The correct answer is B) ?.. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q027",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Assigning a nullable int to a non-nullable int requires",
        "options": [
            "the new keyword",
            "nothing",
            "an explicit cast or Value",
            "the as keyword"
        ],
        "correctAnswer": "an explicit cast or Value",
        "explanation": "The correct answer is C) an explicit cast or Value. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q028",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "ADO.NET is",
        "options": [
            "a language",
            "a .NET database technology to connect an application and a database server",
            "a text editor",
            "a UI toolkit"
        ],
        "correctAnswer": "a .NET database technology to connect an application and a database server",
        "explanation": "The correct answer is B) a .NET database technology to connect an application and a database server. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q029",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Entity Framework is",
        "options": [
            "an open-source ORM framework for .NET applications",
            "a cloud provider",
            "a scripting language",
            "a UI framework"
        ],
        "correctAnswer": "an open-source ORM framework for .NET applications",
        "explanation": "The correct answer is A) an open-source ORM framework for .NET applications. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q030",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "ORM stands for",
        "options": [
            "Object Run-time Model",
            "Object-Relational Mapping",
            "Object Reference Mapping",
            "Open Resource Manager"
        ],
        "correctAnswer": "Object-Relational Mapping",
        "explanation": "The correct answer is B) Object-Relational Mapping. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q031",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "A lambda expression uses the operator",
        "options": [
            "=>",
            "->",
            "==>",
            "::"
        ],
        "correctAnswer": "=>",
        "explanation": "The correct answer is A) =>. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q032",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which is a valid expression lambda?",
        "options": [
            "x => x * x",
            "(x) { x * x }",
            "x -> x * x",
            "lambda x: x*x"
        ],
        "correctAnswer": "x => x * x",
        "explanation": "The correct answer is A) x => x * x. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q033",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "A statement lambda has its body in",
        "options": [
            "braces { }",
            "angle brackets",
            "parentheses only",
            "square brackets"
        ],
        "correctAnswer": "braces { }",
        "explanation": "The correct answer is A) braces { }. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q034",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which lambda has two parameters?",
        "options": [
            "a, b => a + b",
            "(a b) => a + b",
            "(a, b) => a + b",
            "[a, b] => a + b"
        ],
        "correctAnswer": "(a, b) => a + b",
        "explanation": "The correct answer is C) (a, b) => a + b. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q035",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "LINQ stands for",
        "options": [
            "Library Integrated Queries",
            "Language Integrated Query",
            "Logical Index Query",
            "Linked Query"
        ],
        "correctAnswer": "Language Integrated Query",
        "explanation": "The correct answer is B) Language Integrated Query. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q036",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which LINQ clause filters data?",
        "options": [
            "select",
            "where",
            "group",
            "orderby"
        ],
        "correctAnswer": "where",
        "explanation": "The correct answer is B) where. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q037",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which LINQ clause sorts data?",
        "options": [
            "sort",
            "order",
            "arrange",
            "orderby"
        ],
        "correctAnswer": "orderby",
        "explanation": "The correct answer is D) orderby. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q038",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which LINQ clause projects the result?",
        "options": [
            "from",
            "select",
            "project",
            "into only"
        ],
        "correctAnswer": "select",
        "explanation": "The correct answer is B) select. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q039",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which LINQ method-based query filters items?",
        "options": [
            "Filter()",
            "Where()",
            "Pick()",
            "Find() only"
        ],
        "correctAnswer": "Where()",
        "explanation": "The correct answer is B) Where(). (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q040",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "In Entity Framework, the Entity Data Model (EDM)",
        "options": [
            "defines threads",
            "defines the conceptual model of the data",
            "creates windows",
            "handles files"
        ],
        "correctAnswer": "defines the conceptual model of the data",
        "explanation": "The correct answer is B) defines the conceptual model of the data. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q041",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which approach starts by writing classes and then creates the database?",
        "options": [
            "Model Only",
            "Code First",
            "Database First",
            "Table First"
        ],
        "correctAnswer": "Code First",
        "explanation": "The correct answer is B) Code First. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q042",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "In EF, DbContext represents",
        "options": [
            "a session with the database",
            "a table",
            "a file",
            "a column"
        ],
        "correctAnswer": "a session with the database",
        "explanation": "The correct answer is A) a session with the database. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q043",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which class is used to create a basic thread?",
        "options": [
            "Task only",
            "Process",
            "Worker",
            "Thread"
        ],
        "correctAnswer": "Thread",
        "explanation": "The correct answer is D) Thread. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q044",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which class provides a pool of reusable worker threads?",
        "options": [
            "ThreadGroup",
            "WorkerPool",
            "ThreadPool",
            "ThreadManager"
        ],
        "correctAnswer": "ThreadPool",
        "explanation": "The correct answer is C) ThreadPool. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q045",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "The lock statement is used to",
        "options": [
            "end threads",
            "create threads",
            "synchronize access to shared resources",
            "sleep"
        ],
        "correctAnswer": "synchronize access to shared resources",
        "explanation": "The correct answer is C) synchronize access to shared resources. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q046",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which class represents an asynchronous operation?",
        "options": [
            "Timer",
            "Thread",
            "Task",
            "Process"
        ],
        "correctAnswer": "Task",
        "explanation": "The correct answer is C) Task. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q047",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which method runs loops in parallel?",
        "options": [
            "Parallel.For",
            "Thread.For",
            "Task.Loop",
            "Loop.Parallel"
        ],
        "correctAnswer": "Parallel.For",
        "explanation": "The correct answer is A) Parallel.For. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q048",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "PLINQ is",
        "options": [
            "Planned LINQ",
            "Process LINQ",
            "Parallel LINQ",
            "Partial LINQ"
        ],
        "correctAnswer": "Parallel LINQ",
        "explanation": "The correct answer is C) Parallel LINQ. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q049",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which keyword marks a method as asynchronous?",
        "options": [
            "parallel",
            "async",
            "task",
            "await only"
        ],
        "correctAnswer": "async",
        "explanation": "The correct answer is B) async. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s12_q050",
        "category": "C#",
        "session": 12,
        "sessionTitle": "Advanced Concepts in C#",
        "questionText": "Which keyword waits for an asynchronous operation without blocking?",
        "options": [
            "await",
            "hold",
            "sync",
            "wait"
        ],
        "correctAnswer": "await",
        "explanation": "The correct answer is A) await. (Advanced Concepts in C#)"
    },
    {
        "id": "csharp_s13_q001",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "The book covers new features of which C# version in this session?",
        "options": [
            "C# 9.0",
            "C# 5.0",
            "C# 2.0",
            "C# 3.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is A) C# 9.0. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q002",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "In Visual Studio, the language version of a project can be changed using",
        "options": [
            "Solution Explorer rename",
            "Task Manager",
            "the Output window",
            "the project's Advanced Build settings"
        ],
        "correctAnswer": "the project's Advanced Build settings",
        "explanation": "The correct answer is D) the project's Advanced Build settings. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q003",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "The language version can also be selected by",
        "options": [
            "editing the registry only",
            "reinstalling .NET",
            "editing the .exe",
            "editing the .csproj file"
        ],
        "correctAnswer": "editing the .csproj file",
        "explanation": "The correct answer is D) editing the .csproj file. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q004",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which element in the .csproj file specifies the language version?",
        "options": [
            "<LangVersion>",
            "<Version>",
            "<Language>",
            "<CSharpVersion>"
        ],
        "correctAnswer": "<LangVersion>",
        "explanation": "The correct answer is A) <LangVersion>. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q005",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which <LangVersion> value selects the latest major version?",
        "options": [
            "max",
            "current",
            "newest",
            "latest"
        ],
        "correctAnswer": "latest",
        "explanation": "The correct answer is D) latest. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q006",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which value selects the latest minor version, including previews?",
        "options": [
            "beta",
            "alpha",
            "next",
            "preview"
        ],
        "correctAnswer": "preview",
        "explanation": "The correct answer is D) preview. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q007",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A .props file can be used to",
        "options": [
            "store images",
            "compile code",
            "set properties like LangVersion for multiple projects",
            "debug code"
        ],
        "correctAnswer": "set properties like LangVersion for multiple projects",
        "explanation": "The correct answer is C) set properties like LangVersion for multiple projects. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q008",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "The Light Bulb icon in Visual Studio is used to",
        "options": [
            "show quick actions and suggestions, including upgrading language version",
            "open the toolbox",
            "save files",
            "run the program"
        ],
        "correctAnswer": "show quick actions and suggestions, including upgrading language version",
        "explanation": "The correct answer is A) show quick actions and suggestions, including upgrading language version. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q009",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A ref return allows a method to",
        "options": [
            "return a reference to a variable",
            "return nothing",
            "return two values",
            "return void"
        ],
        "correctAnswer": "return a reference to a variable",
        "explanation": "The correct answer is A) return a reference to a variable. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q010",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which keyword combination declares a ref return method?",
        "options": [
            "public ref Find int(...)",
            "ref public int Find(...)",
            "public ref int Find(...)",
            "public int ref Find(...)"
        ],
        "correctAnswer": "public ref int Find(...)",
        "explanation": "The correct answer is C) public ref int Find(...). (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q011",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A ref local is declared using",
        "options": [
            "int ref x = arr[0];",
            "int x = ref(arr[0]);",
            "ref int x = ref arr[0];",
            "ref x = arr[0];"
        ],
        "correctAnswer": "ref int x = ref arr[0];",
        "explanation": "The correct answer is C) ref int x = ref arr[0];. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q012",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Modifying a ref local",
        "options": [
            "throws an error",
            "does nothing",
            "changes a copy",
            "changes the original variable"
        ],
        "correctAnswer": "changes the original variable",
        "explanation": "The correct answer is D) changes the original variable. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q013",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Improved out variables allow",
        "options": [
            "out only for strings",
            "declaring out variables inline in the call",
            "no out at all",
            "out with no assignment"
        ],
        "correctAnswer": "declaring out variables inline in the call",
        "explanation": "The correct answer is B) declaring out variables inline in the call. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q014",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which correctly uses an inline out variable declaration?",
        "options": [
            "int.TryParse(s, out n int)",
            "int.TryParse(s, int out n)",
            "int.TryParse(s, n out)",
            "int.TryParse(s, out int n)"
        ],
        "correctAnswer": "int.TryParse(s, out int n)",
        "explanation": "The correct answer is D) int.TryParse(s, out int n). (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q015",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A discard is represented by",
        "options": [
            "#",
            "~",
            "_",
            "$"
        ],
        "correctAnswer": "_",
        "explanation": "The correct answer is C) _. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q016",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Discards are used to",
        "options": [
            "store values",
            "ignore values you don't need",
            "create arrays",
            "declare constants"
        ],
        "correctAnswer": "ignore values you don't need",
        "explanation": "The correct answer is B) ignore values you don't need. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q017",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Tuples allow you to",
        "options": [
            "replace classes in all cases",
            "group multiple values into a single object",
            "define namespaces",
            "create loops"
        ],
        "correctAnswer": "group multiple values into a single object",
        "explanation": "The correct answer is B) group multiple values into a single object. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q018",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a valid tuple declaration?",
        "options": [
            "(int, string) t = (1, \"a\");",
            "[int, string] t = [1, \"a\"];",
            "int, string t = (1,\"a\");",
            "tuple t = (1, \"a\");"
        ],
        "correctAnswer": "(int, string) t = (1, \"a\");",
        "explanation": "The correct answer is A) (int, string) t = (1, \"a\");. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q019",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A tuple with named elements is declared as",
        "options": [
            "(int Id, string Name) t = (1, \"a\");",
            "(Id: int, Name: string)",
            "{int Id, string Name}",
            "<int Id, string Name>"
        ],
        "correctAnswer": "(int Id, string Name) t = (1, \"a\");",
        "explanation": "The correct answer is A) (int Id, string Name) t = (1, \"a\");. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q020",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Tuple deconstruction looks like",
        "options": [
            "var <id, name> = t;",
            "var {id, name} = t;",
            "var (id, name) = t;",
            "var [id, name] = t;"
        ],
        "correctAnswer": "var (id, name) = t;",
        "explanation": "The correct answer is C) var (id, name) = t;. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q021",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Tuple types in C# 7+ are based on",
        "options": [
            "System.Tuple only",
            "System.Pair",
            "System.ValueTuple",
            "System.Group"
        ],
        "correctAnswer": "System.ValueTuple",
        "explanation": "The correct answer is C) System.ValueTuple. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q022",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Async Main allows",
        "options": [
            "Main to be declared async Task",
            "Main to be recursive",
            "Main in a namespace only",
            "multiple Main methods"
        ],
        "correctAnswer": "Main to be declared async Task",
        "explanation": "The correct answer is A) Main to be declared async Task. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q023",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a valid async Main signature?",
        "options": [
            "async int Main",
            "static async Task Main(string[] args)",
            "static Task async Main()",
            "static async void Main(string[] a)"
        ],
        "correctAnswer": "static async Task Main(string[] args)",
        "explanation": "The correct answer is B) static async Task Main(string[] args). (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q024",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Throw expressions can be used in",
        "options": [
            "null-coalescing and ternary expressions and expression-bodied members",
            "only in catch blocks",
            "only in loops",
            "only in constructors"
        ],
        "correctAnswer": "null-coalescing and ternary expressions and expression-bodied members",
        "explanation": "The correct answer is A) null-coalescing and ternary expressions and expression-bodied members. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q025",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Expression-bodied members use the operator",
        "options": [
            "::",
            "->",
            "=>",
            "=="
        ],
        "correctAnswer": "=>",
        "explanation": "The correct answer is C) =>. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q026",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is an expression-bodied property?",
        "options": [
            "public int Double { return value * 2; }",
            "public int Double => value * 2;",
            "public int Double => { };",
            "public int Double() => ;"
        ],
        "correctAnswer": "public int Double => value * 2;",
        "explanation": "The correct answer is B) public int Double => value * 2;. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q027",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Expression-bodied members were extended to include",
        "options": [
            "constructors, finalizers, and accessors",
            "only classes",
            "only namespaces",
            "only methods"
        ],
        "correctAnswer": "constructors, finalizers, and accessors",
        "explanation": "The correct answer is A) constructors, finalizers, and accessors. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q028",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Pattern matching is used with",
        "options": [
            "the is operator and switch",
            "the new keyword",
            "only strings",
            "the sealed keyword"
        ],
        "correctAnswer": "the is operator and switch",
        "explanation": "The correct answer is A) the is operator and switch. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q029",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a type pattern?",
        "options": [
            "if (obj == string)",
            "if (obj as string == s)",
            "if (typeof obj)",
            "if (obj is string s)"
        ],
        "correctAnswer": "if (obj is string s)",
        "explanation": "The correct answer is D) if (obj is string s). (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q030",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "In C# 9 which keyword is used in relational patterns?",
        "options": [
            "< > <= >= in switch expressions",
            "case when only",
            "match",
            "compare"
        ],
        "correctAnswer": "< > <= >= in switch expressions",
        "explanation": "The correct answer is A) < > <= >= in switch expressions. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q031",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which logical pattern combinators were added in C# 9?",
        "options": [
            "and, but, nor",
            "also, either, neither",
            "and, or, not",
            "plus, minus"
        ],
        "correctAnswer": "and, or, not",
        "explanation": "The correct answer is C) and, or, not. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q032",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a valid pattern using not?",
        "options": [
            "if (!obj is)",
            "if (obj not is null)",
            "if (obj isnot null)",
            "if (obj is not null)"
        ],
        "correctAnswer": "if (obj is not null)",
        "explanation": "The correct answer is D) if (obj is not null). (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q033",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "A switch expression returns",
        "options": [
            "a value",
            "only bool",
            "nothing",
            "void"
        ],
        "correctAnswer": "a value",
        "explanation": "The correct answer is A) a value. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q034",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a valid switch expression?",
        "options": [
            "var r = x switch (1 => \"one\");",
            "var r = x switch { 1 => \"one\", _ => \"other\" };",
            "var r = switch x { 1: \"one\" };",
            "var r = switch(x) { case 1 => \"one\" };"
        ],
        "correctAnswer": "var r = x switch { 1 => \"one\", _ => \"other\" };",
        "explanation": "The correct answer is B) var r = x switch { 1 => \"one\", _ => \"other\" };. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q035",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "In a switch expression, _ represents",
        "options": [
            "an error",
            "a variable name",
            "the discard/default pattern",
            "a string"
        ],
        "correctAnswer": "the discard/default pattern",
        "explanation": "The correct answer is C) the discard/default pattern. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q036",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Target-typed new expressions let you write",
        "options": [
            "Person p = Person.new;",
            "Person p = new();",
            "new Person p;",
            "Person p = new[]();"
        ],
        "correctAnswer": "Person p = new();",
        "explanation": "The correct answer is B) Person p = new();. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q037",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which is a target-typed new expression for a List<int>?",
        "options": [
            "List<int> l = new;",
            "var l = new();",
            "List l = new<int>();",
            "List<int> l = new();"
        ],
        "correctAnswer": "List<int> l = new();",
        "explanation": "The correct answer is D) List<int> l = new();. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q038",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Covariant return types in C# 9 allow",
        "options": [
            "changing parameters",
            "an overriding method to return a more derived type",
            "removing return types",
            "returning void always"
        ],
        "correctAnswer": "an overriding method to return a more derived type",
        "explanation": "The correct answer is B) an overriding method to return a more derived type. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q039",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Init-only setters and records belong to",
        "options": [
            "C# 9.0",
            "C# 6.0",
            "C# 4.0",
            "C# 2.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is A) C# 9.0. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q040",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Fit and finish features include",
        "options": [
            "new data types",
            "new operators like @@",
            "GUI controls",
            "target-typed conditional and static anonymous functions"
        ],
        "correctAnswer": "target-typed conditional and static anonymous functions",
        "explanation": "The correct answer is D) target-typed conditional and static anonymous functions. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q041",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Native-sized integers in C# 9 are",
        "options": [
            "word and dword",
            "int8 and int16",
            "nint and nuint",
            "long and ulong"
        ],
        "correctAnswer": "nint and nuint",
        "explanation": "The correct answer is C) nint and nuint. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q042",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Function pointers in C# 9 are declared using",
        "options": [
            "delegate*",
            "ptr",
            "pointer",
            "func*"
        ],
        "correctAnswer": "delegate*",
        "explanation": "The correct answer is A) delegate*. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q043",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Static anonymous functions are declared by adding",
        "options": [
            "static before the lambda",
            "const before lambda",
            "sealed before lambda",
            "ref before lambda"
        ],
        "correctAnswer": "static before the lambda",
        "explanation": "The correct answer is A) static before the lambda. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q044",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Top-level statements are allowed in how many files per project?",
        "options": [
            "Unlimited",
            "None",
            "Only one",
            "Two"
        ],
        "correctAnswer": "Only one",
        "explanation": "The correct answer is C) Only one. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s13_q045",
        "category": "C#",
        "session": 13,
        "sessionTitle": "New Features of C# 9.0",
        "questionText": "Which version of C# is the default for .NET 5.0 projects?",
        "options": [
            "C# 8.0",
            "C# 7.0",
            "C# 9.0",
            "C# 10.0"
        ],
        "correctAnswer": "C# 9.0",
        "explanation": "The correct answer is C) C# 9.0. (New Features of C# 9.0)"
    },
    {
        "id": "csharp_s14_q001",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Core is",
        "options": [
            "an IDE",
            "a Windows-only framework",
            "a cross-platform, open-source framework from Microsoft",
            "a database"
        ],
        "correctAnswer": "a cross-platform, open-source framework from Microsoft",
        "explanation": "The correct answer is C) a cross-platform, open-source framework from Microsoft. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q002",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which operating systems does .NET Core support?",
        "options": [
            "Linux only",
            "Windows, Linux, and macOS",
            "macOS only",
            "Windows only"
        ],
        "correctAnswer": "Windows, Linux, and macOS",
        "explanation": "The correct answer is B) Windows, Linux, and macOS. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q003",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Core is best suited for",
        "options": [
            "kernel development",
            "cross-platform and cloud-based/microservice applications",
            "Windows Forms legacy apps only",
            "hardware drivers"
        ],
        "correctAnswer": "cross-platform and cloud-based/microservice applications",
        "explanation": "The correct answer is B) cross-platform and cloud-based/microservice applications. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q004",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which is a reason to use .NET Core?",
        "options": [
            "Requiring Windows-only APIs",
            "Requiring ASP.NET Web Forms",
            "Cross-platform needs and high performance",
            "Requiring WCF server"
        ],
        "correctAnswer": "Cross-platform needs and high performance",
        "explanation": "The correct answer is C) Cross-platform needs and high performance. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q005",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "When should you NOT use .NET Core?",
        "options": [
            "When your app depends on Windows-specific technologies not available in .NET Core",
            "When building console apps",
            "When building web APIs",
            "When building microservices"
        ],
        "correctAnswer": "When your app depends on Windows-specific technologies not available in .NET Core",
        "explanation": "The correct answer is A) When your app depends on Windows-specific technologies not available in .NET Core. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q006",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Framework is",
        "options": [
            "open-source from the start",
            "Windows-only",
            "browser-only",
            "cross-platform"
        ],
        "correctAnswer": "Windows-only",
        "explanation": "The correct answer is B) Windows-only. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q007",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Porting from .NET Framework to .NET Core often involves",
        "options": [
            "recompiling nothing",
            "using tools like the .NET Portability Analyzer",
            "changing the OS",
            "removing C#"
        ],
        "correctAnswer": "using tools like the .NET Portability Analyzer",
        "explanation": "The correct answer is B) using tools like the .NET Portability Analyzer. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q008",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which tool analyzes API compatibility when porting?",
        "options": [
            "Linker",
            ".NET Portability Analyzer",
            "Debug Analyzer",
            "Code Profiler only"
        ],
        "correctAnswer": ".NET Portability Analyzer",
        "explanation": "The correct answer is B) .NET Portability Analyzer. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q009",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Core supports side-by-side installation of",
        "options": [
            "no versions",
            "only the latest",
            "only one version",
            "multiple versions on the same machine"
        ],
        "correctAnswer": "multiple versions on the same machine",
        "explanation": "The correct answer is D) multiple versions on the same machine. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q010",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which CLI is used to create and run .NET Core apps?",
        "options": [
            "netcore",
            "dotnet",
            "csc only",
            "nuget"
        ],
        "correctAnswer": "dotnet",
        "explanation": "The correct answer is B) dotnet. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q011",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command creates a new console project?",
        "options": [
            "dotnet start console",
            "dotnet create console",
            "dotnet new console",
            "dotnet init console"
        ],
        "correctAnswer": "dotnet new console",
        "explanation": "The correct answer is C) dotnet new console. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q012",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command builds a .NET project?",
        "options": [
            "dotnet create",
            "dotnet make",
            "dotnet compile",
            "dotnet build"
        ],
        "correctAnswer": "dotnet build",
        "explanation": "The correct answer is D) dotnet build. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q013",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command runs a .NET project?",
        "options": [
            "dotnet exec",
            "dotnet run",
            "dotnet start",
            "dotnet go"
        ],
        "correctAnswer": "dotnet run",
        "explanation": "The correct answer is B) dotnet run. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q014",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command restores NuGet packages?",
        "options": [
            "dotnet nuget get",
            "dotnet install",
            "dotnet restore",
            "dotnet fetch"
        ],
        "correctAnswer": "dotnet restore",
        "explanation": "The correct answer is C) dotnet restore. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q015",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command publishes an app for deployment?",
        "options": [
            "dotnet deploy",
            "dotnet publish",
            "dotnet release",
            "dotnet export"
        ],
        "correctAnswer": "dotnet publish",
        "explanation": "The correct answer is B) dotnet publish. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q016",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command runs unit tests?",
        "options": [
            "dotnet test",
            "dotnet check",
            "dotnet verify",
            "dotnet unit"
        ],
        "correctAnswer": "dotnet test",
        "explanation": "The correct answer is A) dotnet test. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q017",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Core projects use a project file with extension",
        "options": [
            ".proj only for VB",
            ".sln only",
            ".config",
            ".csproj"
        ],
        "correctAnswer": ".csproj",
        "explanation": "The correct answer is D) .csproj. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q018",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "The project's package manager in .NET is",
        "options": [
            "NuGet",
            "Maven",
            "pip",
            "npm"
        ],
        "correctAnswer": "NuGet",
        "explanation": "The correct answer is A) NuGet. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q019",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "The runtime for .NET Core apps is",
        "options": [
            "Java VM",
            "Node",
            "Mono only",
            "CoreCLR"
        ],
        "correctAnswer": "CoreCLR",
        "explanation": "The correct answer is D) CoreCLR. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q020",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "The JIT compiler in .NET Core is",
        "options": [
            "Chakra",
            "V8",
            "RyuJIT",
            "HotSpot"
        ],
        "correctAnswer": "RyuJIT",
        "explanation": "The correct answer is C) RyuJIT. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q021",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "ASP.NET Core is",
        "options": [
            "a Windows service",
            "a desktop framework",
            "a database",
            "a cross-platform framework for web apps and APIs"
        ],
        "correctAnswer": "a cross-platform framework for web apps and APIs",
        "explanation": "The correct answer is D) a cross-platform framework for web apps and APIs. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q022",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET Core 3.1 is",
        "options": [
            "deprecated before 2.0",
            "a preview release",
            "Windows only",
            "a long-term support (LTS) release"
        ],
        "correctAnswer": "a long-term support (LTS) release",
        "explanation": "The correct answer is D) a long-term support (LTS) release. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q023",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": ".NET 5.0 unifies",
        "options": [
            ".NET Framework 1.0 and 2.0",
            "Java and .NET",
            "Mono only",
            ".NET Core and .NET Framework features"
        ],
        "correctAnswer": ".NET Core and .NET Framework features",
        "explanation": "The correct answer is D) .NET Core and .NET Framework features. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q024",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Starting with .NET 5, the name dropped",
        "options": [
            "the CLR",
            "the word \"Core\"",
            "the word \".NET\"",
            "the version number"
        ],
        "correctAnswer": "the word \"Core\"",
        "explanation": "The correct answer is B) the word \"Core\". (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q025",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which .NET release follows .NET 5.0 in the unified platform plan?",
        "options": [
            ".NET Framework 5",
            ".NET 6",
            ".NET 5.1 only",
            ".NET Core 4.0"
        ],
        "correctAnswer": ".NET 6",
        "explanation": "The correct answer is B) .NET 6. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q026",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "The \"future\" of .NET is described as a single unified platform for",
        "options": [
            "only web",
            "desktop, web, cloud, mobile, gaming, IoT, and AI",
            "only mobile",
            "only Windows"
        ],
        "correctAnswer": "desktop, web, cloud, mobile, gaming, IoT, and AI",
        "explanation": "The correct answer is B) desktop, web, cloud, mobile, gaming, IoT, and AI. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q027",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which tool produces a self-contained deployment?",
        "options": [
            "dotnet build only",
            "dotnet publish with a runtime identifier",
            "dotnet new",
            "dotnet add"
        ],
        "correctAnswer": "dotnet publish with a runtime identifier",
        "explanation": "The correct answer is B) dotnet publish with a runtime identifier. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q028",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "In a framework-dependent deployment, the target machine must have",
        "options": [
            "the .NET runtime installed",
            "nothing",
            "Visual Studio",
            "the SDK and Visual Studio"
        ],
        "correctAnswer": "the .NET runtime installed",
        "explanation": "The correct answer is A) the .NET runtime installed. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q029",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "In a self-contained deployment, the app",
        "options": [
            "requires the runtime to be installed",
            "can't run on Linux",
            "needs Visual Studio",
            "includes the .NET runtime"
        ],
        "correctAnswer": "includes the .NET runtime",
        "explanation": "The correct answer is D) includes the .NET runtime. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q030",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which target moniker is used for .NET Core 3.1?",
        "options": [
            "netcoreapp3.1",
            "netapp31",
            "net3.1",
            "core3.1"
        ],
        "correctAnswer": "netcoreapp3.1",
        "explanation": "The correct answer is A) netcoreapp3.1. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q031",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which target moniker is used for .NET Framework 4.8?",
        "options": [
            "framework48",
            "net48",
            "netfx4.8",
            "net4.8core"
        ],
        "correctAnswer": "net48",
        "explanation": "The correct answer is B) net48. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q032",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command shows installed SDKs?",
        "options": [
            "dotnet -s",
            "dotnet --list-sdks",
            "dotnet sdk list",
            "dotnet show sdks"
        ],
        "correctAnswer": "dotnet --list-sdks",
        "explanation": "The correct answer is B) dotnet --list-sdks. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q033",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command shows installed runtimes?",
        "options": [
            "dotnet --list-runtimes",
            "dotnet list",
            "dotnet runtime",
            "dotnet -r"
        ],
        "correctAnswer": "dotnet --list-runtimes",
        "explanation": "The correct answer is A) dotnet --list-runtimes. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q034",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which command displays the installed .NET version?",
        "options": [
            "dotnet version",
            "dotnet --version",
            "dotnet -v",
            "dotnet info only"
        ],
        "correctAnswer": "dotnet --version",
        "explanation": "The correct answer is B) dotnet --version. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q035",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "A benefit of open source for .NET Core is",
        "options": [
            "closed development",
            "community contributions on GitHub",
            "license fees",
            "Windows-only code"
        ],
        "correctAnswer": "community contributions on GitHub",
        "explanation": "The correct answer is B) community contributions on GitHub. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q036",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "In .NET Core, the Main entry point is",
        "options": [
            "the same Main method (or top-level statements)",
            "Entry",
            "MainCore",
            "Start"
        ],
        "correctAnswer": "the same Main method (or top-level statements)",
        "explanation": "The correct answer is A) the same Main method (or top-level statements). (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s14_q037",
        "category": "C#",
        "session": 14,
        "sessionTitle": ".NET Core Development and the Future",
        "questionText": "Which tool is the cross-platform editor from Microsoft that works with .NET Core?",
        "options": [
            "Paint",
            "Visual Studio Code",
            "Word",
            "Notepad"
        ],
        "correctAnswer": "Visual Studio Code",
        "explanation": "The correct answer is B) Visual Studio Code. (.NET Core Development and the Future)"
    },
    {
        "id": "csharp_s15_q001",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which technology can be used to build web apps with C# in .NET?",
        "options": [
            "UWP",
            "WPF",
            "ASP.NET Core",
            "WinForms"
        ],
        "correctAnswer": "ASP.NET Core",
        "explanation": "The correct answer is C) ASP.NET Core. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q002",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which kind of app does Windows Forms create?",
        "options": [
            "Windows desktop apps",
            "Android apps",
            "Web apps only",
            "iOS apps"
        ],
        "correctAnswer": "Windows desktop apps",
        "explanation": "The correct answer is A) Windows desktop apps. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q003",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which XAML-based technology creates rich desktop UIs on Windows?",
        "options": [
            "LINQ",
            "ADO.NET",
            "WPF",
            "ASP.NET"
        ],
        "correctAnswer": "WPF",
        "explanation": "The correct answer is C) WPF. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q004",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "WPF stands for",
        "options": [
            "Windows Print Framework",
            "Windows Program Framework",
            "Windows Presentation Foundation",
            "Web Page Format"
        ],
        "correctAnswer": "Windows Presentation Foundation",
        "explanation": "The correct answer is C) Windows Presentation Foundation. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q005",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "UWP stands for",
        "options": [
            "Unified Web Platform",
            "Universal Web Pages",
            "User Windows Program",
            "Universal Windows Platform"
        ],
        "correctAnswer": "Universal Windows Platform",
        "explanation": "The correct answer is D) Universal Windows Platform. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q006",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "UWP apps can run on",
        "options": [
            "Linux only",
            "Android only",
            "multiple Windows 10 device families",
            "macOS only"
        ],
        "correctAnswer": "multiple Windows 10 device families",
        "explanation": "The correct answer is C) multiple Windows 10 device families. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q007",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "WPF user interfaces are defined in",
        "options": [
            "JSON",
            "HTML only",
            "CSS only",
            "XAML"
        ],
        "correctAnswer": "XAML",
        "explanation": "The correct answer is D) XAML. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q008",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "XAML stands for",
        "options": [
            "XML Active Module Language",
            "Extended Access Markup Layer",
            "XML Application Model Language",
            "Extensible Application Markup Language"
        ],
        "correctAnswer": "Extensible Application Markup Language",
        "explanation": "The correct answer is D) Extensible Application Markup Language. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q009",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Windows Forms apps are built with",
        "options": [
            "only code, no designer",
            "CSS styles",
            "drag-and-drop controls from the Toolbox",
            "HTML pages"
        ],
        "correctAnswer": "drag-and-drop controls from the Toolbox",
        "explanation": "The correct answer is C) drag-and-drop controls from the Toolbox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q010",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "In Windows Forms, the base class of a window is",
        "options": [
            "Page",
            "Window",
            "Frame",
            "Form"
        ],
        "correctAnswer": "Form",
        "explanation": "The correct answer is D) Form. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q011",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control displays text that a user can't edit?",
        "options": [
            "TextBox",
            "ComboBox",
            "Button",
            "Label"
        ],
        "correctAnswer": "Label",
        "explanation": "The correct answer is D) Label. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q012",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control accepts text input?",
        "options": [
            "Label",
            "ProgressBar",
            "TextBox",
            "PictureBox"
        ],
        "correctAnswer": "TextBox",
        "explanation": "The correct answer is C) TextBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q013",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control triggers an action when clicked?",
        "options": [
            "GroupBox",
            "Button",
            "Label",
            "Panel"
        ],
        "correctAnswer": "Button",
        "explanation": "The correct answer is B) Button. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q014",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which event is raised when a button is clicked?",
        "options": [
            "Click",
            "Paint",
            "Close",
            "Load"
        ],
        "correctAnswer": "Click",
        "explanation": "The correct answer is A) Click. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q015",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which event occurs when a form is first loaded?",
        "options": [
            "TextChanged",
            "Load",
            "Click",
            "Leave"
        ],
        "correctAnswer": "Load",
        "explanation": "The correct answer is B) Load. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q016",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which event fires when text in a TextBox changes?",
        "options": [
            "Click",
            "Enter",
            "TextChanged",
            "Shown"
        ],
        "correctAnswer": "TextChanged",
        "explanation": "The correct answer is C) TextChanged. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q017",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control presents a drop-down list of choices?",
        "options": [
            "ComboBox",
            "Button",
            "Label",
            "Panel"
        ],
        "correctAnswer": "ComboBox",
        "explanation": "The correct answer is A) ComboBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q018",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control lets users select one or more options independently?",
        "options": [
            "RadioButton",
            "Panel",
            "Label",
            "CheckBox"
        ],
        "correctAnswer": "CheckBox",
        "explanation": "The correct answer is D) CheckBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q019",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control forces selection of exactly one option from a group?",
        "options": [
            "Label",
            "RadioButton",
            "TextBox",
            "CheckBox"
        ],
        "correctAnswer": "RadioButton",
        "explanation": "The correct answer is B) RadioButton. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q020",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which method displays a message dialog in Windows Forms?",
        "options": [
            "MessageBox.Show()",
            "Dialog.Open()",
            "Console.WriteLine()",
            "Alert()"
        ],
        "correctAnswer": "MessageBox.Show()",
        "explanation": "The correct answer is A) MessageBox.Show(). (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q021",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which property sets the text displayed on a Button?",
        "options": [
            "Label",
            "Caption",
            "Title",
            "Text"
        ],
        "correctAnswer": "Text",
        "explanation": "The correct answer is D) Text. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q022",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which property sets the identifier name of a control in code?",
        "options": [
            "Text",
            "Name",
            "Tag",
            "ID only"
        ],
        "correctAnswer": "Name",
        "explanation": "The correct answer is B) Name. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q023",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which window in Visual Studio lets you change a control's properties?",
        "options": [
            "Properties window",
            "Output window",
            "Test Explorer",
            "Error List"
        ],
        "correctAnswer": "Properties window",
        "explanation": "The correct answer is A) Properties window. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q024",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which file in a Windows Forms project holds the designer-generated UI code?",
        "options": [
            "Form1.Designer.cs",
            "Program.cs only",
            "Form1.resx",
            "App.config"
        ],
        "correctAnswer": "Form1.Designer.cs",
        "explanation": "The correct answer is A) Form1.Designer.cs. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q025",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which file contains the Main entry point in a WinForms project?",
        "options": [
            "Program.cs",
            "App.xaml",
            "Form1.cs",
            "Form1.Designer.cs"
        ],
        "correctAnswer": "Program.cs",
        "explanation": "The correct answer is A) Program.cs. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q026",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which method starts the Windows Forms message loop?",
        "options": [
            "Main.Run()",
            "Form.Launch()",
            "Application.Run()",
            "Application.Start()"
        ],
        "correctAnswer": "Application.Run()",
        "explanation": "The correct answer is C) Application.Run(). (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q027",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which call displays a Form as a modal dialog?",
        "options": [
            "ShowDialog()",
            "Display()",
            "Show()",
            "Open()"
        ],
        "correctAnswer": "ShowDialog()",
        "explanation": "The correct answer is A) ShowDialog(). (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q028",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which is the correct way to show a non-modal form?",
        "options": [
            "form.ShowDialog()",
            "form.Hide()",
            "form.Open()",
            "form.Show()"
        ],
        "correctAnswer": "form.Show()",
        "explanation": "The correct answer is D) form.Show(). (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q029",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which technique separates UI from logic commonly used in WPF?",
        "options": [
            "Spaghetti",
            "MVC only in WPF",
            "MVVM",
            "ADO"
        ],
        "correctAnswer": "MVVM",
        "explanation": "The correct answer is C) MVVM. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q030",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which pattern is commonly used in ASP.NET Core web apps?",
        "options": [
            "MVC",
            "MVP only",
            "MVS",
            "MVVM only"
        ],
        "correctAnswer": "MVC",
        "explanation": "The correct answer is A) MVC. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q031",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "In MVC the \"C\" stands for",
        "options": [
            "Class",
            "Controller",
            "Component",
            "Control"
        ],
        "correctAnswer": "Controller",
        "explanation": "The correct answer is B) Controller. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q032",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "In MVC the \"V\" stands for",
        "options": [
            "Visual",
            "Value",
            "Variable",
            "View"
        ],
        "correctAnswer": "View",
        "explanation": "The correct answer is D) View. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q033",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "In MVC the \"M\" stands for",
        "options": [
            "Module",
            "Method",
            "Main",
            "Model"
        ],
        "correctAnswer": "Model",
        "explanation": "The correct answer is D) Model. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q034",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which file extension is used for Razor views in ASP.NET Core MVC?",
        "options": [
            ".php",
            ".cshtml",
            ".jsp",
            ".aspx only"
        ],
        "correctAnswer": ".cshtml",
        "explanation": "The correct answer is B) .cshtml. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q035",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which command creates a new ASP.NET Core MVC app?",
        "options": [
            "dotnet new mvc",
            "dotnet new php",
            "dotnet new html",
            "dotnet new web-form"
        ],
        "correctAnswer": "dotnet new mvc",
        "explanation": "The correct answer is A) dotnet new mvc. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q036",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which web server is built into ASP.NET Core projects for hosting?",
        "options": [
            "Kestrel",
            "Apache",
            "Tomcat",
            "Nginx only"
        ],
        "correctAnswer": "Kestrel",
        "explanation": "The correct answer is A) Kestrel. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q037",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which file configures services and request pipeline in ASP.NET Core?",
        "options": [
            "global.asax only",
            "web.xml",
            "Startup.cs or Program.cs",
            "httpd.conf"
        ],
        "correctAnswer": "Startup.cs or Program.cs",
        "explanation": "The correct answer is C) Startup.cs or Program.cs. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q038",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which XAML element is a basic button in WPF?",
        "options": [
            "<Click>",
            "<Button>",
            "<PushButton>",
            "<Btn>"
        ],
        "correctAnswer": "<Button>",
        "explanation": "The correct answer is B) <Button>. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q039",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which WPF layout container arranges children in rows and columns?",
        "options": [
            "Grid",
            "Canvas only",
            "Frame",
            "Table"
        ],
        "correctAnswer": "Grid",
        "explanation": "The correct answer is A) Grid. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q040",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which WPF container stacks children vertically or horizontally?",
        "options": [
            "StackPanel",
            "Grid",
            "Border",
            "Canvas"
        ],
        "correctAnswer": "StackPanel",
        "explanation": "The correct answer is A) StackPanel. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q041",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which attribute binds a WPF control property to data?",
        "options": [
            "{Attach ...}",
            "{Link ...}",
            "{Binding ...}",
            "{Source ...}"
        ],
        "correctAnswer": "{Binding ...}",
        "explanation": "The correct answer is C) {Binding ...}. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q042",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which is the code-behind file of MainWindow.xaml?",
        "options": [
            "Window.cs",
            "Main.cs",
            "MainWindow.cs.xaml",
            "MainWindow.xaml.cs"
        ],
        "correctAnswer": "MainWindow.xaml.cs",
        "explanation": "The correct answer is D) MainWindow.xaml.cs. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q043",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "UWP apps are distributed through",
        "options": [
            "F-Droid",
            "the App Store only",
            "Google Play",
            "the Microsoft Store"
        ],
        "correctAnswer": "the Microsoft Store",
        "explanation": "The correct answer is D) the Microsoft Store. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q044",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which Visual Studio template creates a Windows Forms app on .NET?",
        "options": [
            "Windows Forms App",
            "Console App",
            "Razor Class Library",
            "Class Library"
        ],
        "correctAnswer": "Windows Forms App",
        "explanation": "The correct answer is A) Windows Forms App. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q045",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "In Windows Forms, a collection of controls can be grouped inside a",
        "options": [
            "Panel or GroupBox",
            "Label",
            "Timer",
            "Process"
        ],
        "correctAnswer": "Panel or GroupBox",
        "explanation": "The correct answer is A) Panel or GroupBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q046",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control shows progress of a task?",
        "options": [
            "TextBox",
            "ListBox",
            "Panel",
            "ProgressBar"
        ],
        "correctAnswer": "ProgressBar",
        "explanation": "The correct answer is D) ProgressBar. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q047",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control lists multiple items and allows selection?",
        "options": [
            "ListBox",
            "PictureBox",
            "Label",
            "Button"
        ],
        "correctAnswer": "ListBox",
        "explanation": "The correct answer is A) ListBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q048",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control displays an image in Windows Forms?",
        "options": [
            "Timer",
            "PictureBox",
            "Label only",
            "Button only"
        ],
        "correctAnswer": "PictureBox",
        "explanation": "The correct answer is B) PictureBox. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q049",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which control executes code at regular intervals?",
        "options": [
            "Button",
            "Panel",
            "Label",
            "Timer"
        ],
        "correctAnswer": "Timer",
        "explanation": "The correct answer is D) Timer. (GUI/Desktop Apps with C#)"
    },
    {
        "id": "csharp_s15_q050",
        "category": "C#",
        "session": 15,
        "sessionTitle": "GUI/Desktop Apps with C#",
        "questionText": "Which of the following is a cross-platform UI technology for .NET?",
        "options": [
            ".NET MAUI",
            "Windows Forms",
            "WPF",
            "UWP"
        ],
        "correctAnswer": ".NET MAUI",
        "explanation": "The correct answer is A) .NET MAUI. (GUI/Desktop Apps with C#)"
    }
];

module.exports = {
    CSHARP_QUIZ_QUESTIONS,
    CSHARP_QUIZ_SESSIONS
};
module.exports.default = CSHARP_QUIZ_QUESTIONS;
