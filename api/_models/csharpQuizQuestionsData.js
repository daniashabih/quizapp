// 45 Curated, high-quality C# Quiz MCQs across 3 Sessions for Hangbug
// Session 1: C# Fundamentals & Syntax (15 questions)
// Session 2: C# Object-Oriented Programming & Collections (15 questions)
// Session 3: C# LINQ, Async & Modern .NET (15 questions)

const CSHARP_QUIZ_QUESTIONS = [
    // ═══════════════════════════════════════════════════════════
    // SESSION 1: C# Fundamentals & Syntax (15 Questions)
    // ═══════════════════════════════════════════════════════════
    {
        id: 'csharp_q_s1_01',
        category: 'C#',
        session: 1,
        questionText: 'What is the correct syntax to output "Hello Hangbug" to the console in C#?',
        options: [
            'Console.WriteLine("Hello Hangbug");',
            'print("Hello Hangbug");',
            'System.out.println("Hello Hangbug");',
            'Echo("Hello Hangbug");'
        ],
        correctAnswer: 'Console.WriteLine("Hello Hangbug");',
        explanation: 'In C#, `Console.WriteLine()` is part of the `System` namespace and prints a line of text followed by a newline to the standard output stream.'
    },
    {
        id: 'csharp_q_s1_02',
        category: 'C#',
        session: 1,
        questionText: 'Which C# data type is used to store true or false values?',
        options: ['bool', 'boolean', 'bit', 'binary'],
        correctAnswer: 'bool',
        explanation: 'The `bool` keyword is an alias for the `System.Boolean` structure representing logical truth values (`true` or `false`).'
    },
    {
        id: 'csharp_q_s1_03',
        category: 'C#',
        session: 1,
        questionText: 'Which keyword defines an immutable variable in C# whose value must be assigned at compile time?',
        options: ['const', 'readonly', 'static', 'sealed'],
        correctAnswer: 'const',
        explanation: '`const` fields are compile-time constants whose values cannot be changed after compilation. For runtime initialization, `readonly` is used.'
    },
    {
        id: 'csharp_q_s1_04',
        category: 'C#',
        session: 1,
        questionText: 'What will be the output of `Console.WriteLine(10 / 4);` in C#?',
        options: ['2', '2.5', '2.0', 'Compilation Error'],
        correctAnswer: '2',
        explanation: 'Because both 10 and 4 are integer literals, integer division is performed, truncating any fractional part and returning 2.'
    },
    {
        id: 'csharp_q_s1_05',
        category: 'C#',
        session: 1,
        questionText: 'Which operator is known as the Null-Coalescing Operator in C#?',
        options: ['??', '?.', '?:', '::'],
        correctAnswer: '??',
        explanation: 'The `??` operator returns the left-hand operand if it is not null; otherwise, it evaluates and returns the right-hand operand.'
    },
    {
        id: 'csharp_q_s1_06',
        category: 'C#',
        session: 1,
        questionText: 'How do you declare a nullable integer in C#?',
        options: ['int? x = null;', 'nullable<int> x;', 'int x = null;', 'opt int x = null;'],
        correctAnswer: 'int? x = null;',
        explanation: 'Appending `?` to a value type syntax sugar creates a `Nullable<T>`, allowing value types like `int` to hold null.'
    },
    {
        id: 'csharp_q_s1_07',
        category: 'C#',
        session: 1,
        questionText: 'What is the prefix used for string interpolation in modern C#?',
        options: ['$', '@', '#', '%'],
        correctAnswer: '$',
        explanation: 'The `$` character identifies a string literal as an interpolated string, allowing embedded expressions like `$"Hello {name}"`.'
    },
    {
        id: 'csharp_q_s1_08',
        category: 'C#',
        session: 1,
        questionText: 'Which keyword allows compiler type inference for local variables in C#?',
        options: ['var', 'let', 'auto', 'dynamic'],
        correctAnswer: 'var',
        explanation: '`var` instructs the compiler to infer the type of a local variable from its initialization expression while maintaining strong static typing.'
    },
    {
        id: 'csharp_q_s1_09',
        category: 'C#',
        session: 1,
        questionText: 'Which loop is guaranteed to execute its code block at least once in C#?',
        options: ['do-while', 'while', 'for', 'foreach'],
        correctAnswer: 'do-while',
        explanation: 'The `do-while` loop evaluates its conditional condition at the bottom of the loop body, guaranteeing at least one execution.'
    },
    {
        id: 'csharp_q_s1_10',
        category: 'C#',
        session: 1,
        questionText: 'What is the default access modifier for a class declared directly inside a namespace in C#?',
        options: ['internal', 'public', 'private', 'protected'],
        correctAnswer: 'internal',
        explanation: 'Top-level types (classes, structs, interfaces) in a namespace default to `internal` accessibility if no modifier is explicitly specified.'
    },
    {
        id: 'csharp_q_s1_11',
        category: 'C#',
        session: 1,
        questionText: 'Which keyword terminates the current loop iteration and moves to the next evaluation in C#?',
        options: ['continue', 'break', 'return', 'skip'],
        correctAnswer: 'continue',
        explanation: '`continue` immediately halts the remaining statements in the current loop body and passes control to the next iteration step.'
    },
    {
        id: 'csharp_q_s1_12',
        category: 'C#',
        session: 1,
        questionText: 'Which method converts a string representation of a number into an integer safely without throwing exceptions on format errors?',
        options: ['int.TryParse()', 'int.Parse()', 'Convert.ToInt32()', '(int)string'],
        correctAnswer: 'int.TryParse()',
        explanation: '`int.TryParse()` returns a boolean indicating whether the conversion succeeded and assigns the parsed value to an `out` parameter without throwing exceptions.'
    },
    {
        id: 'csharp_q_s1_13',
        category: 'C#',
        session: 1,
        questionText: 'What is the verbatim string literal prefix in C# that suppresses escape sequences?',
        options: ['@', '$', '#', '&'],
        correctAnswer: '@',
        explanation: 'The `@` prefix defines a verbatim string literal, which ignores escape characters like `\\` and preserves multi-line formatting.'
    },
    {
        id: 'csharp_q_s1_14',
        category: 'C#',
        session: 1,
        questionText: 'In C#, what is the difference between value types and reference types regarding memory allocation?',
        options: [
            'Value types are typically allocated on the stack; reference types allocate the object on the managed heap.',
            'Value types are always on the heap; reference types are on the stack.',
            'Both are always allocated in CPU registers.',
            'Value types cannot hold numeric values.'
        ],
        correctAnswer: 'Value types are typically allocated on the stack; reference types allocate the object on the managed heap.',
        explanation: 'Value types (`struct`, `int`, `enum`) store their data directly inline (often on the stack), whereas reference types (`class`, `string`) store a memory pointer referencing heap memory.'
    },
    {
        id: 'csharp_q_s1_15',
        category: 'C#',
        session: 1,
        questionText: 'Which statement is used to handle multiple condition branches matching discrete values cleanly in modern C#?',
        options: ['switch', 'goto', 'with', 'match'],
        correctAnswer: 'switch',
        explanation: 'The `switch` statement (and C# 8+ switch expressions) tests an expression against pattern-matching cases and constant values.'
    },

    // ═══════════════════════════════════════════════════════════
    // SESSION 2: C# OOP, Collections & Exception Handling (15 Questions)
    // ═══════════════════════════════════════════════════════════
    {
        id: 'csharp_q_s2_01',
        category: 'C#',
        session: 2,
        questionText: 'Which keyword allows a derived class method to replace a base class method with runtime polymorphism?',
        options: ['override', 'new', 'virtual', 'abstract'],
        correctAnswer: 'override',
        explanation: 'The `override` modifier is required in a derived class to extend or modify the abstract or virtual implementation of an inherited method.'
    },
    {
        id: 'csharp_q_s2_02',
        category: 'C#',
        session: 2,
        questionText: 'What is the keyword used to prevent a class from being inherited in C#?',
        options: ['sealed', 'final', 'static', 'const'],
        correctAnswer: 'sealed',
        explanation: 'Applying `sealed` to a class prevents other classes from inheriting from it. Applying it to an overridden member prevents further overriding.'
    },
    {
        id: 'csharp_q_s2_03',
        category: 'C#',
        session: 2,
        questionText: 'Which C# interface must a class implement to enable `foreach` iteration?',
        options: ['IEnumerable', 'IComparable', 'ICollection', 'IIterator'],
        correctAnswer: 'IEnumerable',
        explanation: '`IEnumerable` (or generic `IEnumerable<T>`) exposes the `GetEnumerator()` method required by the `foreach` statement.'
    },
    {
        id: 'csharp_q_s2_04',
        category: 'C#',
        session: 2,
        questionText: 'What is the purpose of the `finally` block in a try-catch-finally statement?',
        options: [
            'It executes code guaranteed to run whether an exception occurred or not.',
            'It only runs if an unhandled exception is thrown.',
            'It catches and silences all runtime errors automatically.',
            'It prevents the method from returning.'
        ],
        correctAnswer: 'It executes code guaranteed to run whether an exception occurred or not.',
        explanation: 'The `finally` block always executes when control leaves the `try` block, making it ideal for deterministic cleanup of unmanaged resources.'
    },
    {
        id: 'csharp_q_s2_05',
        category: 'C#',
        session: 2,
        questionText: 'Which generic collection in C# stores key-value pairs with O(1) average lookup time?',
        options: ['Dictionary<TKey, TValue>', 'List<T>', 'Queue<T>', 'Stack<T>'],
        correctAnswer: 'Dictionary<TKey, TValue>',
        explanation: '`Dictionary<TKey, TValue>` uses a hash table internally, providing constant time $O(1)$ average complexity for insertions and lookups.'
    },
    {
        id: 'csharp_q_s2_06',
        category: 'C#',
        session: 2,
        questionText: 'What is the difference between `throw;` and `throw ex;` inside a catch block in C#?',
        options: [
            '`throw;` preserves the original stack trace, while `throw ex;` resets the stack trace to the catch location.',
            '`throw ex;` is required for custom exceptions.',
            '`throw;` causes a compilation error in .NET 8.',
            'There is no difference in runtime behavior.'
        ],
        correctAnswer: '`throw;` preserves the original stack trace, while `throw ex;` resets the stack trace to the catch location.',
        explanation: 'Using `throw;` re-throws the current active exception preserving the call stack origin. `throw ex;` overwrites the stack trace, making debugging harder.'
    },
    {
        id: 'csharp_q_s2_07',
        category: 'C#',
        session: 2,
        questionText: 'Which keyword is used to call a base class constructor or method from a derived class?',
        options: ['base', 'super', 'parent', 'this'],
        correctAnswer: 'base',
        explanation: 'The `base` keyword accesses members of the base class from within a derived class (e.g. `base(param)` in constructor initializers).'
    },
    {
        id: 'csharp_q_s2_08',
        category: 'C#',
        session: 2,
        questionText: 'What is encapsulation in C# Object-Oriented Programming?',
        options: [
            'Hiding internal object state and exposing access through properties and methods.',
            'Inheriting properties from multiple parent classes.',
            'Overloading method signatures with different parameters.',
            'Compiling code to Intermediate Language (CIL).'
        ],
        correctAnswer: 'Hiding internal object state and exposing access through properties and methods.',
        explanation: 'Encapsulation restricts direct access to an object’s private fields and bundles behavior with data using access modifiers and properties.'
    },
    {
        id: 'csharp_q_s2_09',
        category: 'C#',
        session: 2,
        questionText: 'How many base classes can a single C# class inherit from directly?',
        options: ['Exactly 1', 'Up to 2', 'Unlimited', '0'],
        correctAnswer: 'Exactly 1',
        explanation: 'C# supports single class inheritance: a class may inherit from only one direct base class, but can implement multiple interfaces.'
    },
    {
        id: 'csharp_q_s2_10',
        category: 'C#',
        session: 2,
        questionText: 'Which C# feature allows adding new methods to existing types without modifying their source code?',
        options: ['Extension Methods', 'Partial Methods', 'Abstract Methods', 'Virtual Methods'],
        correctAnswer: 'Extension Methods',
        explanation: 'Extension methods are static methods in static classes where the first parameter has the `this` modifier, enabling fluent syntax on existing types.'
    },
    {
        id: 'csharp_q_s2_11',
        category: 'C#',
        session: 2,
        questionText: 'Which interface should a type implement to support deterministic resource cleanup via the `using` statement?',
        options: ['IDisposable', 'ICloneable', 'IComparable', 'ISerializable'],
        correctAnswer: 'IDisposable',
        explanation: '`IDisposable` defines the `Dispose()` method. Types implementing it can be wrapped in `using` blocks for automatic deterministic cleanup.'
    },
    {
        id: 'csharp_q_s2_12',
        category: 'C#',
        session: 2,
        questionText: 'What is the default value of an uninitialized reference type variable in C#?',
        options: ['null', '0', 'undefined', 'false'],
        correctAnswer: 'null',
        explanation: 'Reference type variables default to `null` before they are assigned a reference to an object in memory.'
    },
    {
        id: 'csharp_q_s2_13',
        category: 'C#',
        session: 2,
        questionText: 'What is Boxing in C#?',
        options: [
            'Converting a value type to a reference type (object).',
            'Converting an object back to a value type.',
            'Compressing code into a DLL assembly.',
            'Wrapping a method in a delegate.'
        ],
        correctAnswer: 'Converting a value type to a reference type (object).',
        explanation: 'Boxing is the process of converting a value type to the type `object` or to any interface implemented by this value type, allocating memory on the heap.'
    },
    {
        id: 'csharp_q_s2_14',
        category: 'C#',
        session: 2,
        questionText: 'Which collection represents a First-In, First-Out (FIFO) data structure in C#?',
        options: ['Queue<T>', 'Stack<T>', 'LinkedList<T>', 'HashSet<T>'],
        correctAnswer: 'Queue<T>',
        explanation: '`Queue<T>` provides FIFO semantics with `Enqueue()` and `Dequeue()` methods. `Stack<T>` is LIFO.'
    },
    {
        id: 'csharp_q_s2_15',
        category: 'C#',
        session: 2,
        questionText: 'What is the primary benefit of auto-implemented properties in C# (e.g. `public int Id { get; set; }`)?',
        options: [
            'The compiler automatically generates a private backing field behind the scenes.',
            'They bypass runtime access checks for high performance.',
            'They make the property read-only across all assemblies.',
            'They eliminate the need for constructors.'
        ],
        correctAnswer: 'The compiler automatically generates a private backing field behind the scenes.',
        explanation: 'Auto-implemented properties make property declaration more concise when no additional custom getter/setter logic is required; the compiler manages the backing field.'
    },

    // ═══════════════════════════════════════════════════════════
    // SESSION 3: C# LINQ, Async & Modern .NET (15 Questions)
    // ═══════════════════════════════════════════════════════════
    {
        id: 'csharp_q_s3_01',
        category: 'C#',
        session: 3,
        questionText: 'What does LINQ stand for in the .NET ecosystem?',
        options: [
            'Language Integrated Query',
            'Linked Integrated Network Query',
            'Language Internal Notation Quality',
            'Logical Interface Query'
        ],
        correctAnswer: 'Language Integrated Query',
        explanation: 'LINQ (Language Integrated Query) brings native data querying capabilities directly into C# syntax for collections, SQL, XML, and objects.'
    },
    {
        id: 'csharp_q_s3_02',
        category: 'C#',
        session: 3,
        questionText: 'What is deferred execution in LINQ?',
        options: [
            'The query is not executed when defined, but when iterated over.',
            'The query runs on a background thread after a fixed delay.',
            'The query is compiled directly into machine code at startup.',
            'The query throws an error if data is empty.'
        ],
        correctAnswer: 'The query is not executed when defined, but when iterated over.',
        explanation: 'Deferred execution means evaluation of a query expression is delayed until its value is actually needed (e.g. via `foreach`, `ToList()`, or `ToArray()`).'
    },
    {
        id: 'csharp_q_s3_03',
        category: 'C#',
        session: 3,
        questionText: 'Which LINQ operator projects each element of a sequence into a transformed form (equivalent to map)?',
        options: ['Select', 'Where', 'OrderBy', 'GroupBy'],
        correctAnswer: 'Select',
        explanation: '`Select` is the projection operator that maps each input element into a new representation or transformed type.'
    },
    {
        id: 'csharp_q_s3_04',
        category: 'C#',
        session: 3,
        questionText: 'Which LINQ method flattens nested sequences into a single sequence?',
        options: ['SelectMany', 'Select', 'Concat', 'Union'],
        correctAnswer: 'SelectMany',
        explanation: '`SelectMany` projects each element of a sequence to an `IEnumerable<T>` and flattens the resulting sequences into one sequence.'
    },
    {
        id: 'csharp_q_s3_05',
        category: 'C#',
        session: 3,
        questionText: 'Which pair of keywords enables asynchronous programming in C#?',
        options: ['async and await', 'thread and run', 'promise and then', 'defer and resume'],
        correctAnswer: 'async and await',
        explanation: 'The `async` and `await` keywords simplify asynchronous code by yielding execution back to the caller until the awaited Task completes.'
    },
    {
        id: 'csharp_q_s3_06',
        category: 'C#',
        session: 3,
        questionText: 'What return type is recommended for an async method that produces no return value in C#?',
        options: ['Task', 'void', 'Task<void>', 'Future'],
        correctAnswer: 'Task',
        explanation: 'Async methods without return values should return `Task`. Returning `async void` is only acceptable for event handlers because exceptions cannot be caught by callers.'
    },
    {
        id: 'csharp_q_s3_07',
        category: 'C#',
        session: 3,
        questionText: 'What is a `record` in modern C# (introduced in C# 9)?',
        options: [
            'A reference type with built-in value-based equality and non-destructive mutation.',
            'A database table wrapper created exclusively for SQL Server.',
            'A legacy struct syntax maintained for backward compatibility.',
            'A file storage format for serialized binary data.'
        ],
        correctAnswer: 'A reference type with built-in value-based equality and non-destructive mutation.',
        explanation: 'A `record` (or `record class`) provides concise syntax for immutable data models with value-based equality semantics, `with` expressions, and auto-generated string formatting.'
    },
    {
        id: 'csharp_q_s3_08',
        category: 'C#',
        session: 3,
        questionText: 'What does the `init` accessor do on a C# property?',
        options: [
            'Allows the property to be assigned only during object initialization.',
            'Resets the property to its default value at runtime.',
            'Requires the property to be initialized to zero.',
            'Executes a background task when the property is read.'
        ],
        correctAnswer: 'Allows the property to be assigned only during object initialization.',
        explanation: 'An `init` accessor makes a property immutable after object construction, allowing assignment only in constructors or object initializers.'
    },
    {
        id: 'csharp_q_s3_09',
        category: 'C#',
        session: 3,
        questionText: 'What is a delegate in C#?',
        options: [
            'A type-safe function pointer holding a reference to a method.',
            'A thread manager in the CLR.',
            'An assembly packaging manifest.',
            'A database connection pool.'
        ],
        correctAnswer: 'A type-safe function pointer holding a reference to a method.',
        explanation: 'A delegate is a reference type that can hold a reference to a method with a specific parameter list and return type.'
    },
    {
        id: 'csharp_q_s3_10',
        category: 'C#',
        session: 3,
        questionText: 'What is the built-in generic delegate type for a method that returns a value in C#?',
        options: ['Func<...>', 'Action<...>', 'Predicate<...>', 'Method<...>'],
        correctAnswer: 'Func<...>',
        explanation: '`Func<...>` represents a method that takes parameters and returns a value (the last type argument is the return type). `Action<...>` returns void.'
    },
    {
        id: 'csharp_q_s3_11',
        category: 'C#',
        session: 3,
        questionText: 'Which LINQ method returns the first element of a sequence or a default value if the sequence contains no elements?',
        options: ['FirstOrDefault()', 'First()', 'SingleOrDefault()', 'ElementAtOrDefault()'],
        correctAnswer: 'FirstOrDefault()',
        explanation: '`FirstOrDefault()` returns the first element or `default(T)` if empty. `First()` throws an `InvalidOperationException` if empty.'
    },
    {
        id: 'csharp_q_s3_12',
        category: 'C#',
        session: 3,
        questionText: 'What is Pattern Matching in modern C#?',
        options: [
            'Testing expressions against shape and type conditions concisely (e.g. `is`, `switch`).',
            'Searching text using regular expressions with Regex.',
            'Validating database foreign keys during compile time.',
            'Matching method signatures for method overloading.'
        ],
        correctAnswer: 'Testing expressions against shape and type conditions concisely (e.g. `is`, `switch`).',
        explanation: 'Pattern matching provides syntax for testing expressions and taking action when an expression matches a specific type, constant, relational, or property pattern.'
    },
    {
        id: 'csharp_q_s3_13',
        category: 'C#',
        session: 3,
        questionText: 'What is the purpose of `CancellationToken` in asynchronous .NET operations?',
        options: [
            'To propagate notification that an asynchronous operation should be canceled.',
            'To track memory allocation metrics for garbage collection.',
            'To store authentication tokens for HTTP requests.',
            'To lock a resource against multiple threads.'
        ],
        correctAnswer: 'To propagate notification that an asynchronous operation should be canceled.',
        explanation: 'A `CancellationToken` allows cooperative cancellation between threads, thread pool work items, or `Task` objects.'
    },
    {
        id: 'csharp_q_s3_14',
        category: 'C#',
        session: 3,
        questionText: 'What does the Garbage Collector (GC) in .NET manage?',
        options: [
            'Automatic reclamation of unused memory on the managed heap.',
            'Cleaning temporary files from disk.',
            'Closing open TCP network sockets automatically.',
            'Disposing unmanaged Win32 handles.'
        ],
        correctAnswer: 'Automatic reclamation of unused memory on the managed heap.',
        explanation: 'The .NET Garbage Collector manages the allocation and release of memory for managed objects on the managed heap using a generational GC algorithm.'
    },
    {
        id: 'csharp_q_s3_15',
        category: 'C#',
        session: 3,
        questionText: 'Which keyword in C# ensures that a block of code is executed by only one thread at a time?',
        options: ['lock', 'monitor', 'sync', 'atomic'],
        correctAnswer: 'lock',
        explanation: 'The `lock` statement acquires the mutual-exclusion lock for a given object, executes a statement block, and releases the lock automatically.'
    }
];

const CSHARP_QUIZ_SESSIONS = {
    1: 'C# Fundamentals & Syntax',
    2: 'C# OOP & Collections',
    3: 'C# LINQ, Async & Modern .NET'
};

module.exports = {
    CSHARP_QUIZ_QUESTIONS,
    CSHARP_QUIZ_SESSIONS
};
