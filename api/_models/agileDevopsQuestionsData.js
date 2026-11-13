/**
 * Comprehensive Question Bank for Agile & DevOps (16 Sessions, 939 Questions)
 * Category: Agile and DevOps
 */

const AGILE_DEVOPS_SESSIONS = {
  "1": "Software Characteristics",
  "2": "Software Development Life Cycle",
  "3": "Linear Process Models",
  "4": "Iterative Process Models",
  "5": "Specialized Process Models",
  "6": "Agile Software Development - I",
  "7": "Agile Software Development - II",
  "8": "Extreme Programming",
  "9": "Scrum",
  "10": "Agile Process Models - I",
  "11": "Agile Process Models - II",
  "12": "Comparing Agile with Traditional Models",
  "13": "Introduction to DevOps and Configuration Management",
  "14": "Continuous Integration and Delivery",
  "15": "Continuous Deployment and Monitoring",
  "16": "DevOps Tools"
};

const AGILE_DEVOPS_QUESTIONS = [
  {
    "id": "agile_devops_s01_q001",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "In which decade did electronic computers evolve?",
    "options": [
      "1950s",
      "1940s",
      "1960s",
      "1930s"
    ],
    "correctAnswer": "1940s",
    "explanation": "The correct answer is B) 1940s. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q002",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "In the early days of computing, which area posed the major challenge?",
    "options": [
      "Networking",
      "Software",
      "Databases",
      "Hardware"
    ],
    "correctAnswer": "Hardware",
    "explanation": "The correct answer is D) Hardware. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q003",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The term \"software engineering\" was coined at conferences sponsored by which body?",
    "options": [
      "IEEE Computer Society",
      "NATO Science Committee",
      "ISO",
      "ACM"
    ],
    "correctAnswer": "NATO Science Committee",
    "explanation": "The correct answer is B) NATO Science Committee. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q004",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The term software engineering was coined in Europe in which year?",
    "options": [
      "1968",
      "1960",
      "1950",
      "1975"
    ],
    "correctAnswer": "1960",
    "explanation": "The correct answer is B) 1960. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q005",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The 'software crisis' arose because:",
    "options": [
      "Programmers refused to document",
      "Techniques for simple programs could not scale to large software systems",
      "Hardware became too costly",
      "Languages were too high-level"
    ],
    "correctAnswer": "Techniques for simple programs could not scale to large software systems",
    "explanation": "The correct answer is B) Techniques for simple programs could not scale to large software systems. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q006",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "According to IEEE, software engineering is the application of a ______ approach to development, operation and maintenance of software.",
    "options": [
      "random, flexible",
      "informal, creative",
      "manual, sequential",
      "systematic, disciplined, quantifiable"
    ],
    "correctAnswer": "systematic, disciplined, quantifiable",
    "explanation": "The correct answer is D) systematic, disciplined, quantifiable. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q007",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which discipline's goal is to deal with the software crisis?",
    "options": [
      "Hardware engineering",
      "Data mining",
      "Software engineering",
      "Network engineering"
    ],
    "correctAnswer": "Software engineering",
    "explanation": "The correct answer is C) Software engineering. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q008",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software takes on a dual role. It is:",
    "options": [
      "A plan and a budget",
      "A product and a vehicle to deliver a product",
      "A tool and a toy",
      "Hardware and firmware"
    ],
    "correctAnswer": "A product and a vehicle to deliver a product",
    "explanation": "The correct answer is B) A product and a vehicle to deliver a product. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q009",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "As a product, software is best described as an:",
    "options": [
      "Information transformer",
      "Physical entity",
      "Manufacturing line",
      "Energy source"
    ],
    "correctAnswer": "Information transformer",
    "explanation": "The correct answer is A) Information transformer. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q010",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Operating systems, networks and software tools are examples of software acting as:",
    "options": [
      "Hardware",
      "The vehicle used to deliver a product",
      "A manual process",
      "A product only"
    ],
    "correctAnswer": "The vehicle used to deliver a product",
    "explanation": "The correct answer is B) The vehicle used to deliver a product. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q011",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "IEEE defines software as a collection of:",
    "options": [
      "Hardware and drivers",
      "Only source code and compilers",
      "Only computer programs",
      "Programs, procedures, rules, and associated documentation and data"
    ],
    "correctAnswer": "Programs, procedures, rules, and associated documentation and data",
    "explanation": "The correct answer is D) Programs, procedures, rules, and associated documentation and data. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q012",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which of the following is NOT a component of software?",
    "options": [
      "Instructions or computer programs",
      "Documentation",
      "Hardware circuits",
      "Data structures"
    ],
    "correctAnswer": "Hardware circuits",
    "explanation": "The correct answer is C) Hardware circuits. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q013",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Data structures in software are used to:",
    "options": [
      "Store information required by programs to work upon",
      "Test the code",
      "Provide the desired features",
      "Describe the use of programs"
    ],
    "correctAnswer": "Store information required by programs to work upon",
    "explanation": "The correct answer is A) Store information required by programs to work upon. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q014",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Documentation in software describes:",
    "options": [
      "The hardware layout",
      "The compiler options",
      "The data types only",
      "The operation and use of programs"
    ],
    "correctAnswer": "The operation and use of programs",
    "explanation": "The correct answer is D) The operation and use of programs. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q015",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Unlike a simple program, a programming system product is generally used by:",
    "options": [
      "Only the author",
      "Only hardware vendors",
      "People other than the developers",
      "Only testers"
    ],
    "correctAnswer": "People other than the developers",
    "explanation": "The correct answer is C) People other than the developers. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q016",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software falls under the category of:",
    "options": [
      "Manufactured good",
      "Programming system product",
      "Hardware product",
      "Program"
    ],
    "correctAnswer": "Programming system product",
    "explanation": "The correct answer is B) Programming system product. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q017",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Why is software generally provided with a proper user interface?",
    "options": [
      "To avoid testing",
      "Users have different backgrounds",
      "Because of hardware limits",
      "To increase file size"
    ],
    "correctAnswer": "Users have different backgrounds",
    "explanation": "The correct answer is B) Users have different backgrounds. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q018",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "A software process is defined as:",
    "options": [
      "A framework for the tasks required to build high-quality software",
      "A programming language",
      "A set of hardware components",
      "A user manual"
    ],
    "correctAnswer": "A framework for the tasks required to build high-quality software",
    "explanation": "The correct answer is A) A framework for the tasks required to build high-quality software. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q019",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The desired result of a software process is:",
    "options": [
      "Complex code",
      "Large documentation only",
      "Fast but poor software",
      "High-quality software at low cost"
    ],
    "correctAnswer": "High-quality software at low cost",
    "explanation": "The correct answer is D) High-quality software at low cost. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q020",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The fundamental objectives of a software process are:",
    "options": [
      "Speed and secrecy",
      "Simplicity and beauty",
      "Optimality and scalability",
      "Portability and security"
    ],
    "correctAnswer": "Optimality and scalability",
    "explanation": "The correct answer is C) Optimality and scalability. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q021",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "\"Optimality\" of a process means that it should:",
    "options": [
      "Be applicable for large projects",
      "Support change",
      "Be predictable",
      "Produce high-quality software at low cost"
    ],
    "correctAnswer": "Produce high-quality software at low cost",
    "explanation": "The correct answer is D) Produce high-quality software at low cost. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q022",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "\"Scalability\" of a process means that it should:",
    "options": [
      "Be applicable for large software projects",
      "Remove documentation",
      "Reduce testing",
      "Produce software at low cost"
    ],
    "correctAnswer": "Be applicable for large software projects",
    "explanation": "The correct answer is A) Be applicable for large software projects. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q023",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "A process that cannot handle large software projects is said to lack:",
    "options": [
      "Optimality",
      "Portability",
      "Maintainability",
      "Scalability"
    ],
    "correctAnswer": "Scalability",
    "explanation": "The correct answer is D) Scalability. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q024",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which property determines how accurately the outcome of a project can be predicted before completion?",
    "options": [
      "Predictability",
      "Maintainability",
      "Portability",
      "Testability"
    ],
    "correctAnswer": "Predictability",
    "explanation": "The correct answer is A) Predictability. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q025",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "A predictable process is also said to be under:",
    "options": [
      "Manual control",
      "Statistical control",
      "Hardware control",
      "Legal control"
    ],
    "correctAnswer": "Statistical control",
    "explanation": "The correct answer is B) Statistical control. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q026",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which cost generally exceeds the development cost during the life of software?",
    "options": [
      "Licensing cost",
      "Training cost",
      "Maintenance cost",
      "Hardware cost"
    ],
    "correctAnswer": "Maintenance cost",
    "explanation": "The correct answer is C) Maintenance cost. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q027",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which should be the goal of a process, according to the Bell Labs survey discussed?",
    "options": [
      "Reduce effort of design and coding",
      "Eliminate all testing",
      "Reduce the cost of testing and maintenance",
      "Reduce documentation"
    ],
    "correctAnswer": "Reduce the cost of testing and maintenance",
    "explanation": "The correct answer is C) Reduce the cost of testing and maintenance. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q028",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Errors should ideally be detected:",
    "options": [
      "In the phase in which they originated",
      "During maintenance",
      "Only during acceptance testing",
      "After deployment"
    ],
    "correctAnswer": "In the phase in which they originated",
    "explanation": "The correct answer is A) In the phase in which they originated. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q029",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The cost of correcting an error depends on:",
    "options": [
      "When the error is detected and corrected",
      "The programming language",
      "The hardware used",
      "The size of the team"
    ],
    "correctAnswer": "When the error is detected and corrected",
    "explanation": "The correct answer is A) When the error is detected and corrected. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q030",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "If an error is corrected after coding, then:",
    "options": [
      "Only the code changes",
      "Both design and code have to be changed",
      "Nothing changes",
      "Only requirements change"
    ],
    "correctAnswer": "Both design and code have to be changed",
    "explanation": "The correct answer is B) Both design and code have to be changed. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q031",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "A process that learns from previous projects and improves itself exhibits:",
    "options": [
      "Process improvement",
      "Predictability",
      "Scalability",
      "Testability"
    ],
    "correctAnswer": "Process improvement",
    "explanation": "The correct answer is A) Process improvement. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q032",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Why should a software process not be a static entity?",
    "options": [
      "Because languages change yearly",
      "Because it must improve to satisfy goals such as quality improvement and cost reduction",
      "Because hardware changes",
      "Because users demand it"
    ],
    "correctAnswer": "Because it must improve to satisfy goals such as quality improvement and cost reduction",
    "explanation": "The correct answer is B) Because it must improve to satisfy goals such as quality improvement and cost reduction. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q033",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The product of software engineering is a:",
    "options": [
      "Circuit",
      "Dam",
      "Plane",
      "Software system"
    ],
    "correctAnswer": "Software system",
    "explanation": "The correct answer is D) Software system. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q034",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software, unlike other engineered products, is:",
    "options": [
      "A physical entity",
      "Tangible",
      "Always manufactured",
      "A logical entity"
    ],
    "correctAnswer": "A logical entity",
    "explanation": "The correct answer is D) A logical entity. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q035",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software is developed or engineered; it is:",
    "options": [
      "Always automated",
      "Cheap to manufacture",
      "Manufactured on an assembly line",
      "Not manufactured"
    ],
    "correctAnswer": "Not manufactured",
    "explanation": "The correct answer is D) Not manufactured. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q036",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "For software, \"manufacturing\" is a trivial process of:",
    "options": [
      "Design",
      "Testing",
      "Duplication",
      "Assembly"
    ],
    "correctAnswer": "Duplication",
    "explanation": "The correct answer is C) Duplication. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q037",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software production primarily deals with:",
    "options": [
      "Hardware integration",
      "Design and implementation",
      "Manufacturing and packaging",
      "Assembly and sales"
    ],
    "correctAnswer": "Design and implementation",
    "explanation": "The correct answer is B) Design and implementation. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q038",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The characteristic that sets software apart from other engineering products, because it can be modified easily, is:",
    "options": [
      "Tangibility",
      "Rigidity",
      "Malleability",
      "Durability"
    ],
    "correctAnswer": "Malleability",
    "explanation": "The correct answer is C) Malleability. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q039",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "A change in software should be viewed as a change in:",
    "options": [
      "Hardware",
      "Code only",
      "Design rather than code",
      "Documentation only"
    ],
    "correctAnswer": "Design rather than code",
    "explanation": "The correct answer is C) Design rather than code. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q040",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The hardware failure rate curve is commonly known as the:",
    "options": [
      "Bell curve",
      "Bathtub curve",
      "Learning curve",
      "S-curve"
    ],
    "correctAnswer": "Bathtub curve",
    "explanation": "The correct answer is B) Bathtub curve. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q041",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Hardware shows a high failure rate in its early life because of:",
    "options": [
      "Dust",
      "Heat",
      "Manufacturing or design defects",
      "Wear and tear"
    ],
    "correctAnswer": "Manufacturing or design defects",
    "explanation": "The correct answer is C) Manufacturing or design defects. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q042",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Hardware failure rate rises again over time because of:",
    "options": [
      "Software bugs",
      "Better usage",
      "Cumulative environmental effects like dust, vibration and temperature",
      "Design defects"
    ],
    "correctAnswer": "Cumulative environmental effects like dust, vibration and temperature",
    "explanation": "The correct answer is C) Cumulative environmental effects like dust, vibration and temperature. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q043",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software is not susceptible to:",
    "options": [
      "Environmental maladies",
      "Design defects",
      "Errors",
      "Changes"
    ],
    "correctAnswer": "Environmental maladies",
    "explanation": "The correct answer is A) Environmental maladies. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q044",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "In the actual software failure curve, spikes appear because:",
    "options": [
      "Hardware wears out",
      "Power failures occur",
      "Users misuse it",
      "Changes made during maintenance introduce new defects"
    ],
    "correctAnswer": "Changes made during maintenance introduce new defects",
    "explanation": "The correct answer is D) Changes made during maintenance introduce new defects. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q045",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software is said to deteriorate because of:",
    "options": [
      "Overheating",
      "Continuous change requests",
      "Dust",
      "Environmental wear"
    ],
    "correctAnswer": "Continuous change requests",
    "explanation": "The correct answer is B) Continuous change requests. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q046",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "When a hardware component wears out, it is replaced by a spare part. For software:",
    "options": [
      "Spare parts are readily available",
      "Patches are called spare parts",
      "Spare parts are free",
      "No such spare parts exist"
    ],
    "correctAnswer": "No such spare parts exist",
    "explanation": "The correct answer is D) No such spare parts exist. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q047",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Maintenance of software compared to hardware is:",
    "options": [
      "The same",
      "Easier",
      "Much more difficult",
      "Not required"
    ],
    "correctAnswer": "Much more difficult",
    "explanation": "The correct answer is C) Much more difficult. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q048",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Most software is:",
    "options": [
      "Always off the shelf",
      "Assembled from existing components",
      "Hardware-based",
      "Custom-built"
    ],
    "correctAnswer": "Custom-built",
    "explanation": "The correct answer is D) Custom-built. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q049",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "The concept of building software from existing components is known as:",
    "options": [
      "Software deterioration",
      "Software reusability",
      "Software duplication",
      "Software piracy"
    ],
    "correctAnswer": "Software reusability",
    "explanation": "The correct answer is B) Software reusability. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q050",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which technology has helped create software engineering components?",
    "options": [
      "Batch processing",
      "Assembly language",
      "Object-oriented technology",
      "Procedural technology"
    ],
    "correctAnswer": "Object-oriented technology",
    "explanation": "The correct answer is C) Object-oriented technology. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q051",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software can be classified into which two categories?",
    "options": [
      "Hardware and firmware",
      "Free and paid",
      "Custom and packaged",
      "Application and system software"
    ],
    "correctAnswer": "Application and system software",
    "explanation": "The correct answer is D) Application and system software. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q052",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which of the following is application software?",
    "options": [
      "Linker",
      "Device driver",
      "Web browser",
      "Operating system"
    ],
    "correctAnswer": "Web browser",
    "explanation": "The correct answer is C) Web browser. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q053",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Which is an example of system software?",
    "options": [
      "Web browser",
      "Games",
      "Office software",
      "Debugger"
    ],
    "correctAnswer": "Debugger",
    "explanation": "The correct answer is D) Debugger. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q054",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Copyrighted software distributed free for a trial period is called:",
    "options": [
      "Freeware",
      "Custom software",
      "Shareware",
      "Public-domain software"
    ],
    "correctAnswer": "Shareware",
    "explanation": "The correct answer is C) Shareware. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q055",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Tailor-made software developed at a user's request is:",
    "options": [
      "Custom software",
      "Freeware",
      "Shareware",
      "Packaged software"
    ],
    "correctAnswer": "Custom software",
    "explanation": "The correct answer is A) Custom software. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q056",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software donated for public use with no copyright restrictions is:",
    "options": [
      "Shareware",
      "Custom software",
      "Public-domain software",
      "Packaged software"
    ],
    "correctAnswer": "Public-domain software",
    "explanation": "The correct answer is C) Public-domain software. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q057",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Copyrighted software provided at no cost is called:",
    "options": [
      "Custom software",
      "Freeware",
      "Shareware",
      "Packaged software"
    ],
    "correctAnswer": "Freeware",
    "explanation": "The correct answer is B) Freeware. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q058",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Software that serves as the interface between user, application software and hardware is:",
    "options": [
      "Browser",
      "Compiler",
      "Operating system",
      "Utility software"
    ],
    "correctAnswer": "Operating system",
    "explanation": "The correct answer is C) Operating system. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s01_q059",
    "category": "Agile and DevOps",
    "session": 1,
    "sessionTitle": "Software Characteristics",
    "questionText": "Anti-virus software, firewalls and disk defragmenters are examples of:",
    "options": [
      "Utility software",
      "Custom software",
      "Shareware",
      "Application software"
    ],
    "correctAnswer": "Utility software",
    "explanation": "The correct answer is A) Utility software. (Software Characteristics)"
  },
  {
    "id": "agile_devops_s02_q001",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "SDLC stands for:",
    "options": [
      "Software Development Life Cycle",
      "System Development Logic Cycle",
      "Software Design Life Cycle",
      "Software Deployment Life Chain"
    ],
    "correctAnswer": "Software Development Life Cycle",
    "explanation": "The correct answer is A) Software Development Life Cycle. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q002",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "SDLC is a process that consists of:",
    "options": [
      "Only coding tasks",
      "A single activity",
      "Only testing tasks",
      "A sequence of activities or phases governing the entire life cycle of software development"
    ],
    "correctAnswer": "A sequence of activities or phases governing the entire life cycle of software development",
    "explanation": "The correct answer is D) A sequence of activities or phases governing the entire life cycle of software development. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q003",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "SDLC is applied to:",
    "options": [
      "Only new software projects",
      "Only existing software",
      "Both building new software and enhancing existing software",
      "Hardware design only"
    ],
    "correctAnswer": "Both building new software and enhancing existing software",
    "explanation": "The correct answer is C) Both building new software and enhancing existing software. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q004",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which of the following is a business requirement that SDLC has to meet?",
    "options": [
      "High-quality software systems",
      "Strong management control",
      "Increased productivity",
      "All of the above"
    ],
    "correctAnswer": "All of the above",
    "explanation": "The correct answer is D) All of the above. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q005",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The cost vs. benefit ratio of a system is a measure of:",
    "options": [
      "Hardware speed",
      "Project success",
      "Team size",
      "Code size"
    ],
    "correctAnswer": "Project success",
    "explanation": "The correct answer is B) Project success. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q006",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Strong management control in SDLC requires developers to:",
    "options": [
      "Skip regular checks",
      "Ignore requirement changes",
      "Accurately estimate the time and resources needed for each project",
      "Avoid estimating"
    ],
    "correctAnswer": "Accurately estimate the time and resources needed for each project",
    "explanation": "The correct answer is C) Accurately estimate the time and resources needed for each project. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q007",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the 1940s and 50s, coding shifted from scientific applications to:",
    "options": [
      "Web applications",
      "Games",
      "Military applications only",
      "Business applications"
    ],
    "correctAnswer": "Business applications",
    "explanation": "The correct answer is D) Business applications. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q008",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which decade saw the need for analysis and design in addition to implementation?",
    "options": [
      "1960s",
      "1950s",
      "1940s",
      "1980s"
    ],
    "correctAnswer": "1960s",
    "explanation": "The correct answer is A) 1960s. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q009",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Early analysis techniques mentioned in the text include:",
    "options": [
      "UML and SysML",
      "DFD and ERD",
      "CASE and RAD",
      "ADS and TAG"
    ],
    "correctAnswer": "ADS and TAG",
    "explanation": "The correct answer is D) ADS and TAG. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q010",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "ADS stands for:",
    "options": [
      "Advanced Delivery Systems",
      "Automated Design Standards",
      "Accurately Defined Systems",
      "Applied Data Structures"
    ],
    "correctAnswer": "Accurately Defined Systems",
    "explanation": "The correct answer is C) Accurately Defined Systems. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q011",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "TAG stands for:",
    "options": [
      "Time Automated Grid",
      "Task Allocation Graph",
      "Technical Analysis Group",
      "Test Automation Guide"
    ],
    "correctAnswer": "Time Automated Grid",
    "explanation": "The correct answer is A) Time Automated Grid. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q012",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which new principle was incorporated into early analysis techniques?",
    "options": [
      "Working backwards from desired output to determine necessary input",
      "Skipping formal records",
      "Avoiding graphical representation",
      "Coding before analysis"
    ],
    "correctAnswer": "Working backwards from desired output to determine necessary input",
    "explanation": "The correct answer is A) Working backwards from desired output to determine necessary input. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q013",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The top-down approach in early SDLC helped eliminate:",
    "options": [
      "Design",
      "Testing",
      "Maintenance",
      "Premature coding"
    ],
    "correctAnswer": "Premature coding",
    "explanation": "The correct answer is D) Premature coding. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q014",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The top-down approach focused first on analysis, then design, and finally on:",
    "options": [
      "Maintenance",
      "Coding",
      "Deployment",
      "Testing"
    ],
    "correctAnswer": "Coding",
    "explanation": "The correct answer is B) Coding. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q015",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Capturing requirements refers to:",
    "options": [
      "Identifying and understanding the exact purpose and scope of the project",
      "Writing code",
      "Creating test cases",
      "Installing hardware"
    ],
    "correctAnswer": "Identifying and understanding the exact purpose and scope of the project",
    "explanation": "The correct answer is A) Identifying and understanding the exact purpose and scope of the project. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q016",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which is a reason why SDLC has become increasingly important?",
    "options": [
      "Increasing need for automation of everyday services",
      "Software never fails",
      "Decrease in software use",
      "Businesses never change"
    ],
    "correctAnswer": "Increasing need for automation of everyday services",
    "explanation": "The correct answer is A) Increasing need for automation of everyday services. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q017",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "For sensitive purposes such as updating medical records, software must:",
    "options": [
      "Allow occasional errors",
      "Skip testing",
      "Be run only once",
      "Have no errors no matter how often it is run"
    ],
    "correctAnswer": "Have no errors no matter how often it is run",
    "explanation": "The correct answer is D) Have no errors no matter how often it is run. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q018",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which is the first phase of a typical SDLC?",
    "options": [
      "Planning and Requirement Analysis",
      "Maintenance",
      "Testing",
      "Deployment"
    ],
    "correctAnswer": "Planning and Requirement Analysis",
    "explanation": "The correct answer is A) Planning and Requirement Analysis. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q019",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The SDLC starts with which phase, in which the client's problem is identified?",
    "options": [
      "Design",
      "Testing",
      "Problem Definition",
      "Coding"
    ],
    "correctAnswer": "Problem Definition",
    "explanation": "The correct answer is C) Problem Definition. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q020",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The basic goal of requirement analysis is to:",
    "options": [
      "Write the code",
      "Gather requirements and get a clear idea of the client's needs",
      "Install the system",
      "Test the system"
    ],
    "correctAnswer": "Gather requirements and get a clear idea of the client's needs",
    "explanation": "The correct answer is B) Gather requirements and get a clear idea of the client's needs. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q021",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which technique uses context-free questions to gain a basic understanding of the problem?",
    "options": [
      "Questionnaire",
      "Interviewing",
      "Record review",
      "Observation"
    ],
    "correctAnswer": "Interviewing",
    "explanation": "The correct answer is B) Interviewing. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q022",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which technique is ideal when a wide spectrum of responses is required from a large group such as factory workers?",
    "options": [
      "Prototyping",
      "Interviewing",
      "Record reviews",
      "Questionnaires"
    ],
    "correctAnswer": "Questionnaires",
    "explanation": "The correct answer is D) Questionnaires. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q023",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which technique helps the analyst understand data, its movement and usage within an organization by examining existing documents?",
    "options": [
      "Observation",
      "Questionnaires",
      "Interviewing",
      "Record reviews"
    ],
    "correctAnswer": "Record reviews",
    "explanation": "The correct answer is D) Record reviews. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q024",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which technique helps detect problems that users are unaware of or hesitant to talk about?",
    "options": [
      "Record reviews",
      "Interviewing",
      "Questionnaires",
      "Observation"
    ],
    "correctAnswer": "Observation",
    "explanation": "The correct answer is D) Observation. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q025",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "After gathering requirements, the team needs to:",
    "options": [
      "Ignore them",
      "Examine, categorize and prioritize them",
      "Discard them",
      "Only document them"
    ],
    "correctAnswer": "Examine, categorize and prioritize them",
    "explanation": "The correct answer is B) Examine, categorize and prioritize them. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q026",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "\"A system is a collection of interrelated components that work together to achieve some common objective.\" This describes:",
    "options": [
      "A module",
      "A system",
      "A process",
      "A product"
    ],
    "correctAnswer": "A system",
    "explanation": "The correct answer is B) A system. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q027",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "System analysis is the specification of:",
    "options": [
      "Where the system is deployed",
      "Who will test the system",
      "What the system is required to do",
      "How the system will be coded"
    ],
    "correctAnswer": "What the system is required to do",
    "explanation": "The correct answer is C) What the system is required to do. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q028",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which is an objective of system analysis?",
    "options": [
      "Establishing cost and schedule constraints",
      "Installing hardware",
      "Training users only",
      "Writing test scripts"
    ],
    "correctAnswer": "Establishing cost and schedule constraints",
    "explanation": "The correct answer is A) Establishing cost and schedule constraints. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q029",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which step is the first and foremost check in the software engineering practice to temper over-enthusiastic automation?",
    "options": [
      "Deployment",
      "Feasibility study",
      "Testing",
      "Coding"
    ],
    "correctAnswer": "Feasibility study",
    "explanation": "The correct answer is B) Feasibility study. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q030",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "A feasibility study checks whether the proposed system is possible, affordable and:",
    "options": [
      "Complex",
      "Acceptable",
      "Portable",
      "Profitable"
    ],
    "correctAnswer": "Acceptable",
    "explanation": "The correct answer is B) Acceptable. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q031",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which of these is NOT one of the aspects checked in a feasibility study?",
    "options": [
      "Obsolete",
      "Affordable",
      "Possible",
      "Acceptable"
    ],
    "correctAnswer": "Obsolete",
    "explanation": "The correct answer is A) Obsolete. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q032",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Determining the need for change within an organization is called:",
    "options": [
      "Legal analysis",
      "Technical feasibility",
      "Need analysis",
      "Cost-benefit analysis"
    ],
    "correctAnswer": "Need analysis",
    "explanation": "The correct answer is C) Need analysis. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q033",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Studying the effect of the change on the organization's economics is:",
    "options": [
      "Technical feasibility",
      "Cost-benefit analysis",
      "Evaluating alternatives",
      "Need analysis"
    ],
    "correctAnswer": "Cost-benefit analysis",
    "explanation": "The correct answer is B) Cost-benefit analysis. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q034",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Evaluating technologies to implement the change within cost and resource limits is:",
    "options": [
      "Need analysis",
      "Legal evaluation",
      "Cost-benefit analysis",
      "Technical feasibility"
    ],
    "correctAnswer": "Technical feasibility",
    "explanation": "The correct answer is D) Technical feasibility. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q035",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The document in which requirements are specified is the:",
    "options": [
      "Test Plan",
      "Requirement Specification Document (RSD)",
      "Design Specification",
      "User Manual"
    ],
    "correctAnswer": "Requirement Specification Document (RSD)",
    "explanation": "The correct answer is B) Requirement Specification Document (RSD). (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q036",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Requirement analysis helps to bridge the communication gap between:",
    "options": [
      "Tester and user",
      "Customer and developer",
      "Manager and tester",
      "Developer and tester"
    ],
    "correctAnswer": "Customer and developer",
    "explanation": "The correct answer is B) Customer and developer. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q037",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Functional analysis relates to the precise definition of:",
    "options": [
      "Functions and sub-functions to be performed by the system",
      "Test cases",
      "Hardware components",
      "User training"
    ],
    "correctAnswer": "Functions and sub-functions to be performed by the system",
    "explanation": "The correct answer is A) Functions and sub-functions to be performed by the system. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q038",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the car example, \"fuel-efficient engine giving x miles per gallon\" is a:",
    "options": [
      "Business rule",
      "Design constraint",
      "Performance requirement",
      "Function"
    ],
    "correctAnswer": "Performance requirement",
    "explanation": "The correct answer is C) Performance requirement. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q039",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the car example, \"size of the chassis\" is a:",
    "options": [
      "Test case",
      "Function",
      "Design constraint",
      "Performance requirement"
    ],
    "correctAnswer": "Design constraint",
    "explanation": "The correct answer is C) Design constraint. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q040",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the car example, \"power brakes\" is a:",
    "options": [
      "Design constraint",
      "Function",
      "Performance requirement",
      "Risk"
    ],
    "correctAnswer": "Function",
    "explanation": "The correct answer is B) Function. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q041",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which stage's final goal is to produce a model or prototype of the system?",
    "options": [
      "Requirement gathering",
      "Maintenance",
      "Design",
      "Testing"
    ],
    "correctAnswer": "Design",
    "explanation": "The correct answer is C) Design. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q042",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Design is best described as:",
    "options": [
      "Only a coding activity",
      "A one-time activity",
      "Only testing",
      "An iterative process in which requirements are translated into an outline for constructing software"
    ],
    "correctAnswer": "An iterative process in which requirements are translated into an outline for constructing software",
    "explanation": "The correct answer is D) An iterative process in which requirements are translated into an outline for constructing software. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q043",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The design model comprises data design, architectural design, interface design and:",
    "options": [
      "Test design",
      "Procedural design",
      "Hardware design",
      "Network design"
    ],
    "correctAnswer": "Procedural design",
    "explanation": "The correct answer is B) Procedural design. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q044",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "ER diagrams and data dictionary act as a source of information for:",
    "options": [
      "Interface design",
      "Architectural design",
      "Testing",
      "Data design"
    ],
    "correctAnswer": "Data design",
    "explanation": "The correct answer is D) Data design. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q045",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which design defines the relationships among the major structural elements of the program?",
    "options": [
      "Component-level design",
      "Architectural design",
      "Interface design",
      "Data design"
    ],
    "correctAnswer": "Architectural design",
    "explanation": "The correct answer is B) Architectural design. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q046",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which design describes how software communicates with other systems and with people who use it?",
    "options": [
      "Architectural design",
      "Procedural design",
      "Interface design",
      "Data design"
    ],
    "correctAnswer": "Interface design",
    "explanation": "The correct answer is C) Interface design. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q047",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Component-level design transforms structural elements of architecture into:",
    "options": [
      "User interfaces",
      "A procedural description of software components",
      "Test cases",
      "Data structures"
    ],
    "correctAnswer": "A procedural description of software components",
    "explanation": "The correct answer is B) A procedural description of software components. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q048",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "A good design should be modular, which means:",
    "options": [
      "It is logically partitioned into elements performing specific functions",
      "It avoids abstractions",
      "It has no structure",
      "It is a single block"
    ],
    "correctAnswer": "It is logically partitioned into elements performing specific functions",
    "explanation": "The correct answer is A) It is logically partitioned into elements performing specific functions. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q049",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "It is estimated that more than what percentage of software development problems arise at the building/implementation stage?",
    "options": [
      "20%",
      "80%",
      "10%",
      "50%"
    ],
    "correctAnswer": "80%",
    "explanation": "The correct answer is B) 80%. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q050",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which of the following is a standard implementation activity?",
    "options": [
      "Requirements interviewing",
      "Creation of an installation plan",
      "Prototyping",
      "Feasibility study"
    ],
    "correctAnswer": "Creation of an installation plan",
    "explanation": "The correct answer is B) Creation of an installation plan. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q051",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Physical procedures in implementation refer to:",
    "options": [
      "Unit tests",
      "Backup tapes",
      "Hardware wiring only",
      "Procedures the organization follows alongside the automated system that complement its functioning"
    ],
    "correctAnswer": "Procedures the organization follows alongside the automated system that complement its functioning",
    "explanation": "The correct answer is D) Procedures the organization follows alongside the automated system that complement its functioning. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q052",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "The best way to deal with user reluctance to a new system is to:",
    "options": [
      "Remove the old system overnight",
      "Make users aware and provide training before implementation",
      "Ignore it",
      "Hire new users"
    ],
    "correctAnswer": "Make users aware and provide training before implementation",
    "explanation": "The correct answer is B) Make users aware and provide training before implementation. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q053",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Unit testing is done by:",
    "options": [
      "The manager",
      "The customer",
      "Professional testers",
      "The developer after coding a component"
    ],
    "correctAnswer": "The developer after coding a component",
    "explanation": "The correct answer is D) The developer after coding a component. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q054",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which testing checks if all components compile and agree with each other?",
    "options": [
      "Acceptance testing",
      "Functional testing",
      "Sanity testing",
      "Unit testing"
    ],
    "correctAnswer": "Sanity testing",
    "explanation": "The correct answer is C) Sanity testing. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q055",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Functional testing is performed by:",
    "options": [
      "Managers",
      "End users only",
      "Professional testers",
      "Developers"
    ],
    "correctAnswer": "Professional testers",
    "explanation": "The correct answer is C) Professional testers. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q056",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Maintenance activities may account for what share of total project costs?",
    "options": [
      "5-10%",
      "20-30%",
      "60-70%",
      "90-95%"
    ],
    "correctAnswer": "60-70%",
    "explanation": "The correct answer is C) 60-70%. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q057",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "Which is NOT a maintenance activity?",
    "options": [
      "Correcting problems",
      "Enhancing the product",
      "Adapting to new environments",
      "Gathering initial requirements"
    ],
    "correctAnswer": "Gathering initial requirements",
    "explanation": "The correct answer is D) Gathering initial requirements. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q058",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the ABC Insurance case study, testing was proposed to be:",
    "options": [
      "Skipped",
      "Done by marketing",
      "Done by the customer",
      "Outsourced to third-party vendors"
    ],
    "correctAnswer": "Outsourced to third-party vendors",
    "explanation": "The correct answer is D) Outsourced to third-party vendors. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s02_q059",
    "category": "Agile and DevOps",
    "session": 2,
    "sessionTitle": "Software Development Life Cycle",
    "questionText": "In the ABC Insurance case, existing customer data was migrated:",
    "options": [
      "By the vendors",
      "Automatically in real time",
      "Manually as a one-time activity",
      "Never"
    ],
    "correctAnswer": "Manually as a one-time activity",
    "explanation": "The correct answer is C) Manually as a one-time activity. (Software Development Life Cycle)"
  },
  {
    "id": "agile_devops_s03_q001",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Software is different from other products mainly because it is:",
    "options": [
      "A physical entity",
      "Manufactured on assembly lines",
      "A logical entity",
      "Tangible"
    ],
    "correctAnswer": "A logical entity",
    "explanation": "The correct answer is C) A logical entity. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q002",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Software engineering essentially consists of a set of steps comprising:",
    "options": [
      "Only hardware",
      "Only languages",
      "Only tools",
      "Methods, tools and procedures"
    ],
    "correctAnswer": "Methods, tools and procedures",
    "explanation": "The correct answer is D) Methods, tools and procedures. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q003",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "A software process is a standardized approach to:",
    "options": [
      "Sell software",
      "Write manuals only",
      "Design hardware",
      "Plan, organize and execute a software development project"
    ],
    "correctAnswer": "Plan, organize and execute a software development project",
    "explanation": "The correct answer is D) Plan, organize and execute a software development project. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q004",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Software process models help to:",
    "options": [
      "Avoid documentation",
      "Predict the budget and review progress at each stage",
      "Eliminate testing",
      "Remove the customer"
    ],
    "correctAnswer": "Predict the budget and review progress at each stage",
    "explanation": "The correct answer is B) Predict the budget and review progress at each stage. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q005",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The process model chosen depends on:",
    "options": [
      "Only the budget",
      "The OS used",
      "Only the programmer's choice",
      "The software being built"
    ],
    "correctAnswer": "The software being built",
    "explanation": "The correct answer is D) The software being built. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q006",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The process models in the industry are broadly categorized as:",
    "options": [
      "Linear and Evolutionary",
      "Agile and Waterfall only",
      "Simple and Complex",
      "Manual and Automated"
    ],
    "correctAnswer": "Linear and Evolutionary",
    "explanation": "The correct answer is A) Linear and Evolutionary. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q007",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Linear process models are also referred to as:",
    "options": [
      "Traditional models",
      "Iterative models",
      "Agile models",
      "Evolutionary models"
    ],
    "correctAnswer": "Traditional models",
    "explanation": "The correct answer is A) Traditional models. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q008",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In a linear process model, each phase must be:",
    "options": [
      "Done in parallel",
      "Completed before moving to the next phase",
      "Skipped",
      "Repeated forever"
    ],
    "correctAnswer": "Completed before moving to the next phase",
    "explanation": "The correct answer is B) Completed before moving to the next phase. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q009",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The linear model begins at the:",
    "options": [
      "Maintenance level",
      "System level",
      "Coding level",
      "Test level"
    ],
    "correctAnswer": "System level",
    "explanation": "The correct answer is B) System level. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q010",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Linear models are built on the assumption that software can be:",
    "options": [
      "Changed any time freely",
      "Built without design",
      "Understood and described completely before a solution is designed",
      "Developed without requirements"
    ],
    "correctAnswer": "Understood and described completely before a solution is designed",
    "explanation": "The correct answer is C) Understood and described completely before a solution is designed. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q011",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Tight control in linear models is maintained through:",
    "options": [
      "Prototypes",
      "Pair programming",
      "Extensive written documentation, formal reviews and sign-offs",
      "Daily meetings"
    ],
    "correctAnswer": "Extensive written documentation, formal reviews and sign-offs",
    "explanation": "The correct answer is C) Extensive written documentation, formal reviews and sign-offs. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q012",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Which is an advantage of linear process models?",
    "options": [
      "Customer feedback each week",
      "Highly flexible to change",
      "Easy to understand and implement",
      "No documentation"
    ],
    "correctAnswer": "Easy to understand and implement",
    "explanation": "The correct answer is C) Easy to understand and implement. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q013",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Which advantage relates to clear hand-off between phases?",
    "options": [
      "Clear demarcation between two phases",
      "Dynamic scope",
      "Continuous feedback",
      "Early prototype"
    ],
    "correctAnswer": "Clear demarcation between two phases",
    "explanation": "The correct answer is A) Clear demarcation between two phases. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q014",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Milestone reviews in linear models encourage scrutiny of:",
    "options": [
      "Coding style",
      "Hardware",
      "Phase exit and entry criteria",
      "Marketing"
    ],
    "correctAnswer": "Phase exit and entry criteria",
    "explanation": "The correct answer is C) Phase exit and entry criteria. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q015",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Another name for the waterfall model is:",
    "options": [
      "Spiral model",
      "Agile model",
      "Linear sequential model / classic life cycle",
      "Prototype model"
    ],
    "correctAnswer": "Linear sequential model / classic life cycle",
    "explanation": "The correct answer is C) Linear sequential model / classic life cycle. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q016",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The waterfall model begins with:",
    "options": [
      "Testing",
      "Coding",
      "System/information engineering and modeling",
      "Maintenance"
    ],
    "correctAnswer": "System/information engineering and modeling",
    "explanation": "The correct answer is C) System/information engineering and modeling. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q017",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "System view is essential in waterfall because software must interface with:",
    "options": [
      "Hardware, people and databases",
      "Only code",
      "Only testers",
      "Only users"
    ],
    "correctAnswer": "Hardware, people and databases",
    "explanation": "The correct answer is A) Hardware, people and databases. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q018",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The feasibility of the proposed system is assessed during:",
    "options": [
      "Maintenance",
      "Coding",
      "System engineering and modeling",
      "Testing"
    ],
    "correctAnswer": "System engineering and modeling",
    "explanation": "The correct answer is C) System engineering and modeling. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q019",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In software requirements analysis, the analyst must understand the information domain and the required:",
    "options": [
      "Training plan",
      "Function, behavior, performance and interfacing",
      "Hardware prices",
      "Test scripts"
    ],
    "correctAnswer": "Function, behavior, performance and interfacing",
    "explanation": "The correct answer is B) Function, behavior, performance and interfacing. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q020",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Which is NOT one of the four attributes the design phase focuses on?",
    "options": [
      "Marketing strategy",
      "Interface representations",
      "Software architecture",
      "Data structure"
    ],
    "correctAnswer": "Marketing strategy",
    "explanation": "The correct answer is A) Marketing strategy. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q021",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The design process translates requirements into a representation that can be assessed for quality:",
    "options": [
      "During maintenance",
      "Before code generation begins",
      "After testing",
      "After deployment"
    ],
    "correctAnswer": "Before code generation begins",
    "explanation": "The correct answer is B) Before code generation begins. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q022",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "PDL is used in detailed design and stands for:",
    "options": [
      "Program Design Language",
      "Process Development Logic",
      "Procedural Data Layer",
      "Project Delivery List"
    ],
    "correctAnswer": "Program Design Language",
    "explanation": "The correct answer is A) Program Design Language. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q023",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The logic of a module in detailed design is usually specified in a language that is:",
    "options": [
      "Tied to the target language",
      "Assembly only",
      "Binary only",
      "Independent of the target implementation language"
    ],
    "correctAnswer": "Independent of the target implementation language",
    "explanation": "The correct answer is D) Independent of the target implementation language. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q024",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The coding phase translates:",
    "options": [
      "Code into test cases",
      "Requirements into design",
      "Design into code in a programming language",
      "Test cases into design"
    ],
    "correctAnswer": "Design into code in a programming language",
    "explanation": "The correct answer is C) Design into code in a programming language. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q025",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The coding phase affects which later phases?",
    "options": [
      "Feasibility",
      "None",
      "Requirements",
      "Testing and maintenance"
    ],
    "correctAnswer": "Testing and maintenance",
    "explanation": "The correct answer is D) Testing and maintenance. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q026",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In top-down implementation:",
    "options": [
      "Bottom modules are first",
      "Only test modules",
      "The main module is implemented first, then subordinates",
      "All modules together"
    ],
    "correctAnswer": "The main module is implemented first, then subordinates",
    "explanation": "The correct answer is C) The main module is implemented first, then subordinates. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q027",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In bottom-up implementation:",
    "options": [
      "Tests are first",
      "Modules at the bottom of the hierarchy are implemented first",
      "The main module is first",
      "Interface is first"
    ],
    "correctAnswer": "Modules at the bottom of the hierarchy are implemented first",
    "explanation": "The correct answer is B) Modules at the bottom of the hierarchy are implemented first. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q028",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Building parts of a system and testing them before integration is preferred because:",
    "options": [
      "It is not feasible to build the whole system in one go",
      "It needs no design",
      "It is cheaper in all cases",
      "It avoids coding"
    ],
    "correctAnswer": "It is not feasible to build the whole system in one go",
    "explanation": "The correct answer is A) It is not feasible to build the whole system in one go. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q029",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Testing focuses on logical internals and:",
    "options": [
      "Pricing",
      "Functional externals",
      "Marketing",
      "Documentation"
    ],
    "correctAnswer": "Functional externals",
    "explanation": "The correct answer is B) Functional externals. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q030",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The testing activity is carried out in two phases:",
    "options": [
      "Design and code",
      "Components before integration, then the integrated product",
      "Unit and deployment",
      "Alpha and beta only"
    ],
    "correctAnswer": "Components before integration, then the integrated product",
    "explanation": "The correct answer is B) Components before integration, then the integrated product. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q031",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Software maintenance reapplies each of the preceding phases to:",
    "options": [
      "Documents only",
      "Hardware",
      "A new program",
      "An existing program rather than a new one"
    ],
    "correctAnswer": "An existing program rather than a new one",
    "explanation": "The correct answer is D) An existing program rather than a new one. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q032",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Change after delivery may be required because of:",
    "options": [
      "Errors, environment changes or customer enhancements",
      "Only hardware cost",
      "Only licences",
      "Only errors"
    ],
    "correctAnswer": "Errors, environment changes or customer enhancements",
    "explanation": "The correct answer is A) Errors, environment changes or customer enhancements. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q033",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Each phase of waterfall ends in:",
    "options": [
      "A prototype",
      "A holiday",
      "A verification and validation activity",
      "A new requirement"
    ],
    "correctAnswer": "A verification and validation activity",
    "explanation": "The correct answer is C) A verification and validation activity. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q034",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The waterfall model is the ______ and most widely used paradigm.",
    "options": [
      "Oldest",
      "Smallest",
      "Newest",
      "Fastest"
    ],
    "correctAnswer": "Oldest",
    "explanation": "The correct answer is A) Oldest. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q035",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Waterfall is most appropriate when requirements are:",
    "options": [
      "Unknown",
      "Rapidly changing",
      "Unclear",
      "Clear, fixed and well documented"
    ],
    "correctAnswer": "Clear, fixed and well documented",
    "explanation": "The correct answer is D) Clear, fixed and well documented. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q036",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Which is a disadvantage of waterfall?",
    "options": [
      "Users can judge quality only at the end of the life cycle",
      "Easy to arrange tasks",
      "Well-defined milestones",
      "Clear stages"
    ],
    "correctAnswer": "Users can judge quality only at the end of the life cycle",
    "explanation": "The correct answer is A) Users can judge quality only at the end of the life cycle. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q037",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Waterfall follows the \"Big-bang\" approach, which means:",
    "options": [
      "The entire product is integrated at the end",
      "Frequent small releases",
      "Customer integrates",
      "Parallel releases"
    ],
    "correctAnswer": "The entire product is integrated at the end",
    "explanation": "The correct answer is A) The entire product is integrated at the end. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q038",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In waterfall, changes required at any phase:",
    "options": [
      "May end the project development",
      "Are welcomed",
      "Cost nothing",
      "Are always easy"
    ],
    "correctAnswer": "May end the project development",
    "explanation": "The correct answer is A) May end the project development. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q039",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Waterfall involves a ______ level of risk and uncertainty.",
    "options": [
      "High",
      "Zero",
      "Low",
      "No"
    ],
    "correctAnswer": "High",
    "explanation": "The correct answer is A) High. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q040",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The V-model is an extension of the:",
    "options": [
      "Scrum",
      "Spiral model",
      "Waterfall model",
      "XP"
    ],
    "correctAnswer": "Waterfall model",
    "explanation": "The correct answer is C) Waterfall model. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q041",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The V-model is also known as the:",
    "options": [
      "Variable model",
      "Vision model",
      "Verification and Validation model",
      "Version model"
    ],
    "correctAnswer": "Verification and Validation model",
    "explanation": "The correct answer is C) Verification and Validation model. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q042",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "\"Are you building the right thing?\" expresses:",
    "options": [
      "Validation",
      "Verification",
      "Maintenance",
      "Design"
    ],
    "correctAnswer": "Validation",
    "explanation": "The correct answer is A) Validation. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q043",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "\"Are you building the thing right?\" expresses:",
    "options": [
      "Verification",
      "Validation",
      "Planning",
      "Release"
    ],
    "correctAnswer": "Verification",
    "explanation": "The correct answer is A) Verification. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q044",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Verification is often an:",
    "options": [
      "Marketing process",
      "Internal process",
      "Legal process",
      "External process"
    ],
    "correctAnswer": "Internal process",
    "explanation": "The correct answer is B) Internal process. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q045",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Validation ensures the product meets the needs of:",
    "options": [
      "Only testers",
      "Customer and other stakeholders",
      "Only managers",
      "Only developers"
    ],
    "correctAnswer": "Customer and other stakeholders",
    "explanation": "The correct answer is B) Customer and other stakeholders. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q046",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The left side of the V represents:",
    "options": [
      "Validation",
      "Integration",
      "Decomposition of requirements and creation of specifications",
      "Maintenance"
    ],
    "correctAnswer": "Decomposition of requirements and creation of specifications",
    "explanation": "The correct answer is C) Decomposition of requirements and creation of specifications. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q047",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The right side of the V represents:",
    "options": [
      "Requirement decomposition",
      "Planning",
      "Design",
      "Integration of parts and validation"
    ],
    "correctAnswer": "Integration of parts and validation",
    "explanation": "The correct answer is D) Integration of parts and validation. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q048",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In the V-model, the user acceptance tests are designed in the:",
    "options": [
      "Coding phase",
      "Deployment",
      "Requirements analysis phase",
      "Module design phase"
    ],
    "correctAnswer": "Requirements analysis phase",
    "explanation": "The correct answer is C) Requirements analysis phase. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q049",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In the V-model, the system test plan is created during:",
    "options": [
      "Maintenance",
      "System design",
      "Unit testing",
      "Coding"
    ],
    "correctAnswer": "System design",
    "explanation": "The correct answer is B) System design. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q050",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The integration test plan is created in the:",
    "options": [
      "Maintenance",
      "Coding phase",
      "High-level design phase",
      "Unit test phase"
    ],
    "correctAnswer": "High-level design phase",
    "explanation": "The correct answer is C) High-level design phase. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q051",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "The unit test design is developed during:",
    "options": [
      "Requirement analysis",
      "Architecture design",
      "Acceptance",
      "Module design (low-level design)"
    ],
    "correctAnswer": "Module design (low-level design)",
    "explanation": "The correct answer is D) Module design (low-level design). (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q052",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Another name for module design is:",
    "options": [
      "Low-level design",
      "System design",
      "High-level design",
      "Architecture"
    ],
    "correctAnswer": "Low-level design",
    "explanation": "The correct answer is A) Low-level design. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q053",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Unit testing verifies the internal logic of code by testing every possible branch; this is known as:",
    "options": [
      "Stress testing",
      "Regression",
      "Test coverage",
      "Smoke testing"
    ],
    "correctAnswer": "Test coverage",
    "explanation": "The correct answer is C) Test coverage. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q054",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Black box testing is usually done at which stage of the V-model?",
    "options": [
      "Maintenance",
      "Coding",
      "System and architecture design",
      "Module design"
    ],
    "correctAnswer": "System and architecture design",
    "explanation": "The correct answer is C) System and architecture design. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q055",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "Which is a disadvantage of the V-model?",
    "options": [
      "Higher chance of success",
      "Easy to understand",
      "Very rigid, like waterfall",
      "Specific deliverables"
    ],
    "correctAnswer": "Very rigid, like waterfall",
    "explanation": "The correct answer is C) Very rigid, like waterfall. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q056",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "A V-model advantage over waterfall is that:",
    "options": [
      "It allows scope changes easily",
      "Test plans are developed early",
      "It supports prototypes",
      "It is more flexible"
    ],
    "correctAnswer": "Test plans are developed early",
    "explanation": "The correct answer is B) Test plans are developed early. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q057",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "In the V-model, no early prototypes are available because:",
    "options": [
      "Testing is skipped",
      "Users reject prototypes",
      "It's too costly",
      "Software is developed in the implementation phase"
    ],
    "correctAnswer": "Software is developed in the implementation phase",
    "explanation": "The correct answer is D) Software is developed in the implementation phase. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s03_q058",
    "category": "Agile and DevOps",
    "session": 3,
    "sessionTitle": "Linear Process Models",
    "questionText": "A drawback of linear models noted in the text is that:",
    "options": [
      "They are too flexible",
      "An initial design is likely flawed, and late discovery of design defects causes costly over-runs",
      "Defects are found early",
      "They never need documents"
    ],
    "correctAnswer": "An initial design is likely flawed, and late discovery of design defects causes costly over-runs",
    "explanation": "The correct answer is B) An initial design is likely flawed, and late discovery of design defects causes costly over-runs. (Linear Process Models)"
  },
  {
    "id": "agile_devops_s04_q001",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Prototyping was developed to overcome the limitations of the:",
    "options": [
      "Scrum",
      "Spiral model",
      "XP",
      "Waterfall model"
    ],
    "correctAnswer": "Waterfall model",
    "explanation": "The correct answer is D) Waterfall model. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q002",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A prototype is best described as:",
    "options": [
      "A model or simulation of the real thing",
      "The final product",
      "A test plan",
      "A contract"
    ],
    "correctAnswer": "A model or simulation of the real thing",
    "explanation": "The correct answer is A) A model or simulation of the real thing. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q003",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A prototype may display functionality but may not actually hold:",
    "options": [
      "The actual logic/ full internals of the final product",
      "A user interface",
      "Any screens",
      "Any users"
    ],
    "correctAnswer": "The actual logic/ full internals of the final product",
    "explanation": "The correct answer is A) The actual logic/ full internals of the final product. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q004",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Software prototyping helps to know customer requirements at:",
    "options": [
      "Deployment",
      "An initial stage",
      "Only the end",
      "Maintenance"
    ],
    "correctAnswer": "An initial stage",
    "explanation": "The correct answer is B) An initial stage. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q005",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which organizations are mentioned as following prototyping?",
    "options": [
      "Microsoft, Disney and Boeing",
      "Google, Apple and Intel",
      "Toyota, Ford and GM",
      "Oracle, SAP and IBM"
    ],
    "correctAnswer": "Microsoft, Disney and Boeing",
    "explanation": "The correct answer is A) Microsoft, Disney and Boeing. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q006",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the first step of designing a prototype, which requirements are identified?",
    "options": [
      "Performance and security details",
      "Very basic requirements, especially user interface",
      "Maintenance needs",
      "Internal design details"
    ],
    "correctAnswer": "Very basic requirements, especially user interface",
    "explanation": "The correct answer is B) Very basic requirements, especially user interface. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q007",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which aspects are NOT considered in the basic requirements identification step?",
    "options": [
      "Basic features",
      "User interface",
      "Internal design, performance and security",
      "Screens"
    ],
    "correctAnswer": "Internal design, performance and security",
    "explanation": "The correct answer is C) Internal design, performance and security. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q008",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The initial prototype illustrates:",
    "options": [
      "Very basic requirements and user interfaces",
      "Final database",
      "Deployment scripts",
      "Marketing plans"
    ],
    "correctAnswer": "Very basic requirements and user interfaces",
    "explanation": "The correct answer is A) Very basic requirements and user interfaces. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q009",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the review step of prototyping, the prototype is presented to:",
    "options": [
      "Only developers",
      "Customer and other stakeholders",
      "Only testers",
      "Only managers"
    ],
    "correctAnswer": "Customer and other stakeholders",
    "explanation": "The correct answer is B) Customer and other stakeholders. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q010",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the revision and enhancement step, factors negotiated with the customer include:",
    "options": [
      "Colors only",
      "Time, budget constraints and technical feasibility",
      "Logo only",
      "Staff holidays"
    ],
    "correctAnswer": "Time, budget constraints and technical feasibility",
    "explanation": "The correct answer is B) Time, budget constraints and technical feasibility. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q011",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The prototype cycle repeats until:",
    "options": [
      "Budget ends",
      "Customer is satisfied",
      "Testing completes",
      "Developers get bored"
    ],
    "correctAnswer": "Customer is satisfied",
    "explanation": "The correct answer is B) Customer is satisfied. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q012",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A vertical prototype is:",
    "options": [
      "A sales demo",
      "A UI-level view of the entire system",
      "A detailed explanation of a specific function or sub-system",
      "A paper sketch"
    ],
    "correctAnswer": "A detailed explanation of a specific function or sub-system",
    "explanation": "The correct answer is C) A detailed explanation of a specific function or sub-system. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q013",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Vertical prototypes are:",
    "options": [
      "Technical in nature",
      "Only visual",
      "Non-technical",
      "Used for sales"
    ],
    "correctAnswer": "Technical in nature",
    "explanation": "The correct answer is A) Technical in nature. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q014",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A horizontal prototype displays:",
    "options": [
      "Test cases",
      "Internal functions in depth",
      "The user interface giving a wider view of the entire system",
      "Database structure"
    ],
    "correctAnswer": "The user interface giving a wider view of the entire system",
    "explanation": "The correct answer is C) The user interface giving a wider view of the entire system. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q015",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Horizontal prototypes may be used in:",
    "options": [
      "Unit testing",
      "Deployment",
      "Sales demos",
      "Code review"
    ],
    "correctAnswer": "Sales demos",
    "explanation": "The correct answer is C) Sales demos. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q016",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The prototype model is best suited for projects that:",
    "options": [
      "Do heavy data processing with little UI",
      "Need a lot of interaction with end users",
      "Are embedded firmware",
      "Have no users"
    ],
    "correctAnswer": "Need a lot of interaction with end users",
    "explanation": "The correct answer is B) Need a lot of interaction with end users. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q017",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which projects typically do NOT benefit from prototyping?",
    "options": [
      "Online systems",
      "Heavy data processing with very little user interface",
      "Web interfaces",
      "HCI systems"
    ],
    "correctAnswer": "Heavy data processing with very little user interface",
    "explanation": "The correct answer is B) Heavy data processing with very little user interface. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q018",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Prototyping is useful when users are:",
    "options": [
      "Hostile",
      "Unwilling",
      "Never available",
      "Uncomfortable with hypothetical models"
    ],
    "correctAnswer": "Uncomfortable with hypothetical models",
    "explanation": "The correct answer is D) Uncomfortable with hypothetical models. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q019",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Prototyping is considered when requirements are:",
    "options": [
      "Uncertain",
      "Fixed",
      "Frozen",
      "Complete"
    ],
    "correctAnswer": "Uncertain",
    "explanation": "The correct answer is A) Uncertain. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q020",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Prototyping is beneficial when the project has:",
    "options": [
      "A long development time",
      "A fixed design",
      "No users",
      "Zero risk"
    ],
    "correctAnswer": "A long development time",
    "explanation": "The correct answer is A) A long development time. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q021",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A critical system needed immediately is a good case for prototyping because:",
    "options": [
      "It removes users",
      "It avoids testing",
      "It is cheaper",
      "Prototyping tools are designed for quick implementation"
    ],
    "correctAnswer": "Prototyping tools are designed for quick implementation",
    "explanation": "The correct answer is D) Prototyping tools are designed for quick implementation. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q022",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which is an advantage of prototyping?",
    "options": [
      "No customer feedback",
      "Active involvement of users",
      "No iteration",
      "Zero change requests"
    ],
    "correctAnswer": "Active involvement of users",
    "explanation": "The correct answer is B) Active involvement of users. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q023",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Prototyping helps detect problems:",
    "options": [
      "Later",
      "Earlier",
      "Only after delivery",
      "Never"
    ],
    "correctAnswer": "Earlier",
    "explanation": "The correct answer is B) Earlier. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q024",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The major disadvantage of prototyping is:",
    "options": [
      "Lack of user involvement",
      "Excessive change requests",
      "No early view",
      "No feedback"
    ],
    "correctAnswer": "Excessive change requests",
    "explanation": "The correct answer is B) Excessive change requests. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q025",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Why do users request repeated changes in prototyping?",
    "options": [
      "They dislike prototypes",
      "They re-examine the prototype at each stage and think of new features",
      "The team asks for it",
      "It is required by law"
    ],
    "correctAnswer": "They re-examine the prototype at each stage and think of new features",
    "explanation": "The correct answer is B) They re-examine the prototype at each stage and think of new features. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q026",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Evolutionary models are:",
    "options": [
      "Iterative",
      "One-shot",
      "Linear",
      "Sequential"
    ],
    "correctAnswer": "Iterative",
    "explanation": "The correct answer is A) Iterative. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q027",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Evolutionary models enable engineers to develop:",
    "options": [
      "Hardware",
      "One version only",
      "Only documents",
      "Increasingly more complete versions of software"
    ],
    "correctAnswer": "Increasingly more complete versions of software",
    "explanation": "The correct answer is D) Increasingly more complete versions of software. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q028",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the Waterfall model, tasks are contained:",
    "options": [
      "Randomly",
      "Time-based",
      "Functionally",
      "Per user"
    ],
    "correctAnswer": "Functionally",
    "explanation": "The correct answer is C) Functionally. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q029",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the iterative model, tasks are contained:",
    "options": [
      "Time-based",
      "By user",
      "Functionally",
      "By document"
    ],
    "correctAnswer": "Time-based",
    "explanation": "The correct answer is A) Time-based. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q030",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Unlike Waterfall, the iterative model does not start with:",
    "options": [
      "All requirements upfront",
      "A part of the software",
      "Implementation",
      "Review"
    ],
    "correctAnswer": "All requirements upfront",
    "explanation": "The correct answer is A) All requirements upfront. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q031",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In an iterative process, a new version of software is created:",
    "options": [
      "Once per year",
      "For each cycle",
      "Only at the end",
      "Never"
    ],
    "correctAnswer": "For each cycle",
    "explanation": "The correct answer is B) For each cycle. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q032",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Every iteration acts like a:",
    "options": [
      "Maintenance task",
      "Unit test",
      "Mini waterfall model",
      "Release"
    ],
    "correctAnswer": "Mini waterfall model",
    "explanation": "The correct answer is C) Mini waterfall model. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q033",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "At the end of each iteration, what is delivered?",
    "options": [
      "Nothing",
      "Working software",
      "Only plans",
      "Only documents"
    ],
    "correctAnswer": "Working software",
    "explanation": "The correct answer is B) Working software. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q034",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The key to successful iterative development is correct validation of requirements, verification and:",
    "options": [
      "Coding standards",
      "Testing of each version against requirements",
      "Team size",
      "Budget cuts"
    ],
    "correctAnswer": "Testing of each version against requirements",
    "explanation": "The correct answer is B) Testing of each version against requirements. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q035",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which is a benefit of the iterative approach?",
    "options": [
      "It tolerates changing requirements",
      "It is slower always",
      "It forbids change",
      "It has big-bang integration"
    ],
    "correctAnswer": "It tolerates changing requirements",
    "explanation": "The correct answer is A) It tolerates changing requirements. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q036",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the iterative approach, integration is:",
    "options": [
      "Progressive",
      "Done by customer",
      "One big bang at the end",
      "Never done"
    ],
    "correctAnswer": "Progressive",
    "explanation": "The correct answer is A) Progressive. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q037",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Integration in non-iterative projects may take up to what portion of total effort?",
    "options": [
      "90%",
      "40%",
      "5%",
      "10%"
    ],
    "correctAnswer": "40%",
    "explanation": "The correct answer is B) 40%. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q038",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Iterative integration is broken into how many smaller integrations (per the text)?",
    "options": [
      "One",
      "Two to three",
      "Six to nine",
      "Ten to twenty"
    ],
    "correctAnswer": "Six to nine",
    "explanation": "The correct answer is C) Six to nine. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q039",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In iterative development, risks are:",
    "options": [
      "Mitigated earlier",
      "Ignored",
      "Increased",
      "Discovered at the end"
    ],
    "correctAnswer": "Mitigated earlier",
    "explanation": "The correct answer is A) Mitigated earlier. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q040",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In iterative development, testers start testing:",
    "options": [
      "Never",
      "After release",
      "Early",
      "Late"
    ],
    "correctAnswer": "Early",
    "explanation": "The correct answer is C) Early. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q041",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Iterative approach facilitates:",
    "options": [
      "Late testing",
      "Reuse",
      "Duplication",
      "Rigid designs"
    ],
    "correctAnswer": "Reuse",
    "explanation": "The correct answer is B) Reuse. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q042",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Iterative development results in a more:",
    "options": [
      "Fragile product",
      "Robust product",
      "Costly product always",
      "Undocumented product"
    ],
    "correctAnswer": "Robust product",
    "explanation": "The correct answer is B) Robust product. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q043",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "COTS stands for:",
    "options": [
      "Custom Off-The-Shelf",
      "Common Open Technology Standard",
      "Commercial-Off-the-Shelf",
      "Cost of Time Savings"
    ],
    "correctAnswer": "Commercial-Off-the-Shelf",
    "explanation": "The correct answer is C) Commercial-Off-the-Shelf. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q044",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A problem of the initial release in evolutionary development is that it may be:",
    "options": [
      "Too secure",
      "Optimized for demonstration, so architecture does not scale",
      "Too detailed",
      "Fully tested"
    ],
    "correctAnswer": "Optimized for demonstration, so architecture does not scale",
    "explanation": "The correct answer is B) Optimized for demonstration, so architecture does not scale. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q045",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Initial releases often defer considerations such as:",
    "options": [
      "User interface",
      "Screens",
      "Security, fault-tolerance and distributed processing",
      "Logos"
    ],
    "correctAnswer": "Security, fault-tolerance and distributed processing",
    "explanation": "The correct answer is C) Security, fault-tolerance and distributed processing. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q046",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which model was proposed by Boehm in 1988?",
    "options": [
      "Waterfall model",
      "Prototype model",
      "V-model",
      "Spiral model"
    ],
    "correctAnswer": "Spiral model",
    "explanation": "The correct answer is D) Spiral model. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q047",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The spiral model couples the iterative nature of prototyping with:",
    "options": [
      "Controlled, systematic aspects of the linear sequential model",
      "Scrum events",
      "Kanban",
      "Pair programming"
    ],
    "correctAnswer": "Controlled, systematic aspects of the linear sequential model",
    "explanation": "The correct answer is A) Controlled, systematic aspects of the linear sequential model. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q048",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A key feature that determines the next step in spiral model is:",
    "options": [
      "Risk assessment",
      "Team size",
      "Brand",
      "Colour scheme"
    ],
    "correctAnswer": "Risk assessment",
    "explanation": "The correct answer is A) Risk assessment. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q049",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the spiral model, inner cycles represent:",
    "options": [
      "Final testing",
      "Deployment",
      "Maintenance",
      "Early phases such as requirements analysis and prototyping"
    ],
    "correctAnswer": "Early phases such as requirements analysis and prototyping",
    "explanation": "The correct answer is D) Early phases such as requirements analysis and prototyping. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q050",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The spiral model is divided into framework activities also called:",
    "options": [
      "Task regions",
      "Sprints",
      "Epics",
      "Stories"
    ],
    "correctAnswer": "Task regions",
    "explanation": "The correct answer is A) Task regions. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q051",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "How many task regions does the spiral model in the text contain?",
    "options": [
      "Six",
      "Five",
      "Four",
      "Three"
    ],
    "correctAnswer": "Six",
    "explanation": "The correct answer is A) Six. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q052",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the spiral model, which task region defines resources and timelines?",
    "options": [
      "Planning",
      "Customer evaluation",
      "Engineering",
      "Risk analysis"
    ],
    "correctAnswer": "Planning",
    "explanation": "The correct answer is A) Planning. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q053",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which task region assesses technical and management risks?",
    "options": [
      "Risk analysis",
      "Planning",
      "Context",
      "Construction"
    ],
    "correctAnswer": "Risk analysis",
    "explanation": "The correct answer is A) Risk analysis. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q054",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which task region builds representations of the application?",
    "options": [
      "Risk analysis",
      "Engineering",
      "Evaluation",
      "Planning"
    ],
    "correctAnswer": "Engineering",
    "explanation": "The correct answer is B) Engineering. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q055",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which task region constructs, tests, installs and provides user support?",
    "options": [
      "Construction and release",
      "Understanding the context",
      "Risk analysis",
      "Planning"
    ],
    "correctAnswer": "Construction and release",
    "explanation": "The correct answer is A) Construction and release. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q056",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Which task region obtains customer feedback?",
    "options": [
      "Customer evaluation",
      "Planning",
      "Engineering",
      "Risk analysis"
    ],
    "correctAnswer": "Customer evaluation",
    "explanation": "The correct answer is A) Customer evaluation. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q057",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "In the spiral model, the team moves around the spiral in which direction?",
    "options": [
      "Top to bottom",
      "Randomly",
      "Counter-clockwise",
      "Clockwise, beginning at the core"
    ],
    "correctAnswer": "Clockwise, beginning at the core",
    "explanation": "The correct answer is D) Clockwise, beginning at the core. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q058",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "The spiral model uses prototyping as a:",
    "options": [
      "Final product",
      "Test tool",
      "Marketing tool",
      "Risk reduction mechanism"
    ],
    "correctAnswer": "Risk reduction mechanism",
    "explanation": "The correct answer is D) Risk reduction mechanism. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q059",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "A disadvantage of the spiral model is that it:",
    "options": [
      "Demands considerable risk assessment expertise",
      "Is too simple",
      "Needs no expertise",
      "Ignores risk"
    ],
    "correctAnswer": "Demands considerable risk assessment expertise",
    "explanation": "The correct answer is A) Demands considerable risk assessment expertise. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s04_q060",
    "category": "Agile and DevOps",
    "session": 4,
    "sessionTitle": "Iterative Process Models",
    "questionText": "Spiral model is suitable when the customer:",
    "options": [
      "Has fixed requirements",
      "Is not sure of requirements",
      "Has no requirements",
      "Doesn't pay"
    ],
    "correctAnswer": "Is not sure of requirements",
    "explanation": "The correct answer is B) Is not sure of requirements. (Iterative Process Models)"
  },
  {
    "id": "agile_devops_s05_q001",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Traditional software engineering methods are considered:",
    "options": [
      "Obsolete",
      "Informal",
      "Process-heavy and cumbersome",
      "Light and fast"
    ],
    "correctAnswer": "Process-heavy and cumbersome",
    "explanation": "The correct answer is C) Process-heavy and cumbersome. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q002",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD stands for:",
    "options": [
      "Rapid Application Development",
      "Random Application Design",
      "Real-time Application Delivery",
      "Rapid Algorithm Deployment"
    ],
    "correctAnswer": "Rapid Application Development",
    "explanation": "The correct answer is A) Rapid Application Development. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q003",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD uses very little:",
    "options": [
      "Coding",
      "Testing",
      "Planning",
      "Prototyping"
    ],
    "correctAnswer": "Planning",
    "explanation": "The correct answer is C) Planning. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q004",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD relies on the concept of:",
    "options": [
      "Waterfall",
      "Spiral",
      "Sequential only",
      "Parallelism"
    ],
    "correctAnswer": "Parallelism",
    "explanation": "The correct answer is D) Parallelism. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q005",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In RAD, several prototypes representing functional modules are:",
    "options": [
      "Discarded",
      "Never combined",
      "Developed one at a time",
      "Developed in parallel and later combined"
    ],
    "correctAnswer": "Developed in parallel and later combined",
    "explanation": "The correct answer is D) Developed in parallel and later combined. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q006",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD employs which development strategies?",
    "options": [
      "Big-bang",
      "Random",
      "Linear only",
      "Iterative and incremental"
    ],
    "correctAnswer": "Iterative and incremental",
    "explanation": "The correct answer is D) Iterative and incremental. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q007",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD uses small dedicated teams working on:",
    "options": [
      "Only documentation",
      "One shared module",
      "Their own modules progressively",
      "Only testing"
    ],
    "correctAnswer": "Their own modules progressively",
    "explanation": "The correct answer is C) Their own modules progressively. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q008",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "How many main objectives does the RAD process meet in the text?",
    "options": [
      "Five",
      "Two",
      "Four",
      "Three"
    ],
    "correctAnswer": "Three",
    "explanation": "The correct answer is D) Three. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q009",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which is a RAD objective?",
    "options": [
      "Timely and speedy delivery of a working application",
      "Long delivery cycle",
      "Maximum documentation",
      "Zero user interaction"
    ],
    "correctAnswer": "Timely and speedy delivery of a working application",
    "explanation": "The correct answer is A) Timely and speedy delivery of a working application. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q010",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "How many phases are there in the RAD model discussed?",
    "options": [
      "Five",
      "Six",
      "Three",
      "Four"
    ],
    "correctAnswer": "Five",
    "explanation": "The correct answer is A) Five. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q011",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The first phase of RAD is:",
    "options": [
      "Data modeling",
      "Process modeling",
      "Application generation",
      "Business modeling"
    ],
    "correctAnswer": "Business modeling",
    "explanation": "The correct answer is D) Business modeling. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q012",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In RAD, which phase identifies the flow of information between business functions?",
    "options": [
      "Data modeling",
      "Process modeling",
      "Business modeling",
      "Testing and turnover"
    ],
    "correctAnswer": "Business modeling",
    "explanation": "The correct answer is C) Business modeling. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q013",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In RAD, which phase reviews gathered information in terms of data objects?",
    "options": [
      "Process modeling",
      "Business modeling",
      "Application generation",
      "Data modeling"
    ],
    "correctAnswer": "Data modeling",
    "explanation": "The correct answer is D) Data modeling. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q014",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In a banking app, data objects such as customers and accounts are identified in:",
    "options": [
      "Testing",
      "Data modeling",
      "Business modeling",
      "Application generation"
    ],
    "correctAnswer": "Data modeling",
    "explanation": "The correct answer is B) Data modeling. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q015",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In RAD, which phase describes how insertion, deletion or update is performed on a data object?",
    "options": [
      "Turnover",
      "Business modeling",
      "Process modeling",
      "Data modeling"
    ],
    "correctAnswer": "Process modeling",
    "explanation": "The correct answer is C) Process modeling. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q016",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Prototypes of actual systems are built in which RAD phase?",
    "options": [
      "Application generation",
      "Business modeling",
      "Data modeling",
      "Process modeling"
    ],
    "correctAnswer": "Application generation",
    "explanation": "The correct answer is A) Application generation. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q017",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In RAD, testing time is reduced because:",
    "options": [
      "Only the final product is tested",
      "Testing is skipped",
      "Users test everything",
      "Each prototype is tested independently"
    ],
    "correctAnswer": "Each prototype is tested independently",
    "explanation": "The correct answer is D) Each prototype is tested independently. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q018",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD is suitable when:",
    "options": [
      "Skilled staff are unavailable",
      "A system needs to be delivered as working modules in short time",
      "Requirements are unknown with no tools",
      "Budget is very low"
    ],
    "correctAnswer": "A system needs to be delivered as working modules in short time",
    "explanation": "The correct answer is B) A system needs to be delivered as working modules in short time. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q019",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD requires resources such as:",
    "options": [
      "Unskilled staff",
      "Only a low budget",
      "No tools",
      "Modeling designers, high budget and automated code-generating tools"
    ],
    "correctAnswer": "Modeling designers, high budget and automated code-generating tools",
    "explanation": "The correct answer is D) Modeling designers, high budget and automated code-generating tools. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q020",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "An advantage of RAD is that:",
    "options": [
      "It ignores customers",
      "It is cheapest for tiny projects",
      "It requires no skills",
      "Reusability of prototypes saves cost and time"
    ],
    "correctAnswer": "Reusability of prototypes saves cost and time",
    "explanation": "The correct answer is D) Reusability of prototypes saves cost and time. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q021",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "A disadvantage of RAD is:",
    "options": [
      "No customer feedback",
      "Too slow",
      "No prototypes",
      "Higher dependency on technical skills"
    ],
    "correctAnswer": "Higher dependency on technical skills",
    "explanation": "The correct answer is D) Higher dependency on technical skills. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q022",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RAD is not suitable for low-cost projects because:",
    "options": [
      "It lacks prototypes",
      "It is too slow",
      "Automated code generation cost is high",
      "It lacks users"
    ],
    "correctAnswer": "Automated code generation cost is high",
    "explanation": "The correct answer is C) Automated code generation cost is high. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q023",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Rapid development in RAD may compromise:",
    "options": [
      "Speed",
      "Standardization, reliability and consistency",
      "Customer involvement",
      "Modularity"
    ],
    "correctAnswer": "Standardization, reliability and consistency",
    "explanation": "The correct answer is B) Standardization, reliability and consistency. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q024",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In component-based development, an application is built from:",
    "options": [
      "Only databases",
      "Discrete executable components developed relatively independently",
      "Only objects",
      "One monolithic block"
    ],
    "correctAnswer": "Discrete executable components developed relatively independently",
    "explanation": "The correct answer is B) Discrete executable components developed relatively independently. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q025",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Component-based development allows upgrading by:",
    "options": [
      "Reinstalling OS",
      "Recompiling everything",
      "Replacing the whole application",
      "Upgrading only some of the components"
    ],
    "correctAnswer": "Upgrading only some of the components",
    "explanation": "The correct answer is D) Upgrading only some of the components. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q026",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Sharing components between applications creates opportunities for reuse but also:",
    "options": [
      "Higher cost always",
      "Inter-project dependencies",
      "No benefit",
      "Lower quality"
    ],
    "correctAnswer": "Inter-project dependencies",
    "explanation": "The correct answer is B) Inter-project dependencies. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q027",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The paradigm that models the real world as a series of objects is:",
    "options": [
      "Object-oriented",
      "Logic",
      "Procedural",
      "Functional"
    ],
    "correctAnswer": "Object-oriented",
    "explanation": "The correct answer is A) Object-oriented. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q028",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Object-oriented classes encapsulate:",
    "options": [
      "Only data",
      "Data and the algorithms that manipulate them",
      "Only UI",
      "Only algorithms"
    ],
    "correctAnswer": "Data and the algorithms that manipulate them",
    "explanation": "The correct answer is B) Data and the algorithms that manipulate them. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q029",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The component assembly model incorporates many characteristics of the:",
    "options": [
      "V-model",
      "Waterfall model",
      "Spiral model",
      "RAD model"
    ],
    "correctAnswer": "Spiral model",
    "explanation": "The correct answer is C) Spiral model. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q030",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The component assembly model builds applications from:",
    "options": [
      "Hand-written code only",
      "Prepackaged software components (classes)",
      "Documents",
      "Hardware"
    ],
    "correctAnswer": "Prepackaged software components (classes)",
    "explanation": "The correct answer is B) Prepackaged software components (classes). (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q031",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The engineering activity in component assembly begins with:",
    "options": [
      "Identification of candidate classes",
      "Testing",
      "Coding",
      "Deployment"
    ],
    "correctAnswer": "Identification of candidate classes",
    "explanation": "The correct answer is A) Identification of candidate classes. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q032",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "The component assembly model leads to:",
    "options": [
      "Software reuse",
      "Less productivity",
      "Code duplication",
      "Longer cycles"
    ],
    "correctAnswer": "Software reuse",
    "explanation": "The correct answer is A) Software reuse. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q033",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Reusability studies reported component assembly leads to what reduction in development cycle time?",
    "options": [
      "70%",
      "20%",
      "50%",
      "5%"
    ],
    "correctAnswer": "70%",
    "explanation": "The correct answer is A) 70%. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q034",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which is an architecture commonly used in component-based development?",
    "options": [
      "CORBA",
      "DFD",
      "UML",
      "ODBC"
    ],
    "correctAnswer": "CORBA",
    "explanation": "The correct answer is A) CORBA. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q035",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "CORBA stands for:",
    "options": [
      "Common Open Resource Bus Architecture",
      "Central Object Remote Binding API",
      "Common Object Request Broker Architecture",
      "Component Object Reuse Base Application"
    ],
    "correctAnswer": "Common Object Request Broker Architecture",
    "explanation": "The correct answer is C) Common Object Request Broker Architecture. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q036",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "RMI stands for:",
    "options": [
      "Relay Message Interface",
      "Remote Memory Interface",
      "Remote Method Invocation",
      "Rapid Module Integration"
    ],
    "correctAnswer": "Remote Method Invocation",
    "explanation": "The correct answer is C) Remote Method Invocation. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q037",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "SOAP stands for:",
    "options": [
      "Service Oriented Access Pattern",
      "System Operation Access Protocol",
      "Simple Object Access Protocol",
      "Standard Object Application Process"
    ],
    "correctAnswer": "Simple Object Access Protocol",
    "explanation": "The correct answer is C) Simple Object Access Protocol. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q038",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which is an advantage of component-based development?",
    "options": [
      "Reusable and easy to maintain",
      "Hard to test",
      "Not portable",
      "Expensive"
    ],
    "correctAnswer": "Reusable and easy to maintain",
    "explanation": "The correct answer is A) Reusable and easy to maintain. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q039",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which way of reconfiguring component-based software removes unnecessary and redundant steps?",
    "options": [
      "Duplication",
      "Integration",
      "Simplification",
      "Transformation"
    ],
    "correctAnswer": "Simplification",
    "explanation": "The correct answer is C) Simplification. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q040",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Combining unconnected processes into a larger coordinated process is:",
    "options": [
      "Transformation",
      "Simplification",
      "Reduction",
      "Integration"
    ],
    "correctAnswer": "Integration",
    "explanation": "The correct answer is D) Integration. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q041",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "A disadvantage of component-based development is:",
    "options": [
      "Too much reuse",
      "High cost of testing",
      "Not enough standards governing middleware",
      "Low flexibility only"
    ],
    "correctAnswer": "Not enough standards governing middleware",
    "explanation": "The correct answer is C) Not enough standards governing middleware. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q042",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "AOSD stands for:",
    "options": [
      "Automated Object Software Design",
      "Agile Object Software Development",
      "Aspect-Oriented Software Development",
      "Application-Oriented System Design"
    ],
    "correctAnswer": "Aspect-Oriented Software Development",
    "explanation": "The correct answer is C) Aspect-Oriented Software Development. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q043",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "AOSD originated from research at:",
    "options": [
      "IBM Labs",
      "Bell Labs",
      "MIT",
      "Xerox Palo Alto Research Center"
    ],
    "correctAnswer": "Xerox Palo Alto Research Center",
    "explanation": "The correct answer is D) Xerox Palo Alto Research Center. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q044",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "AOSD separates secondary functions from the main program's:",
    "options": [
      "Database",
      "Hardware",
      "Business logic",
      "User interface"
    ],
    "correctAnswer": "Business logic",
    "explanation": "The correct answer is C) Business logic. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q045",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Cross-cutting concerns are changes that:",
    "options": [
      "Are isolated in one class",
      "Are only in UI",
      "Are only in database",
      "Cannot be isolated in a particular class and appear at many places"
    ],
    "correctAnswer": "Cannot be isolated in a particular class and appear at many places",
    "explanation": "The correct answer is D) Cannot be isolated in a particular class and appear at many places. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q046",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Any demand, requirement or expectation on a software system by a stakeholder is a:",
    "options": [
      "Aspect",
      "Concern",
      "Join point",
      "Weaver"
    ],
    "correctAnswer": "Concern",
    "explanation": "The correct answer is B) Concern. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q047",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "A module that contains a concern is called:",
    "options": [
      "A weaver",
      "A pointcut",
      "A join point",
      "An aspect"
    ],
    "correctAnswer": "An aspect",
    "explanation": "The correct answer is D) An aspect. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q048",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "A well-defined point in program execution where an aspect is applied is a:",
    "options": [
      "Weaver",
      "Advice body",
      "Join point",
      "Pointcut"
    ],
    "correctAnswer": "Join point",
    "explanation": "The correct answer is C) Join point. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q049",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "A specifically defined subset of join points is a:",
    "options": [
      "Aspect",
      "Pointcut",
      "Concern",
      "Weaver"
    ],
    "correctAnswer": "Pointcut",
    "explanation": "The correct answer is B) Pointcut. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q050",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Code executed when a join point is reached is the:",
    "options": [
      "Aspect",
      "Pointcut",
      "Weaver",
      "Advice body"
    ],
    "correctAnswer": "Advice body",
    "explanation": "The correct answer is D) Advice body. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q051",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Weavers are special compilers that:",
    "options": [
      "Test code",
      "Compose the aspect's implementation with the main program",
      "Compress code",
      "Debug code"
    ],
    "correctAnswer": "Compose the aspect's implementation with the main program",
    "explanation": "The correct answer is B) Compose the aspect's implementation with the main program. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q052",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which is an advantage of AOSD?",
    "options": [
      "Overhead",
      "Security risks",
      "Increased modularity",
      "Lack of UML support"
    ],
    "correctAnswer": "Increased modularity",
    "explanation": "The correct answer is C) Increased modularity. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q053",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which is a disadvantage of AOSD?",
    "options": [
      "Increased reusability",
      "Increased maintainability",
      "Lack of systematic methods of testing",
      "Reduced code size"
    ],
    "correctAnswer": "Lack of systematic methods of testing",
    "explanation": "The correct answer is C) Lack of systematic methods of testing. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q054",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Standardized processes are essential for:",
    "options": [
      "Higher costs",
      "Predictability and good estimation",
      "Randomness",
      "Avoiding quality"
    ],
    "correctAnswer": "Predictability and good estimation",
    "explanation": "The correct answer is B) Predictability and good estimation. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q055",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Tailoring is:",
    "options": [
      "Hiring staff",
      "Testing",
      "Adjusting an organization's standard process to suit a particular project",
      "Writing code"
    ],
    "correctAnswer": "Adjusting an organization's standard process to suit a particular project",
    "explanation": "The correct answer is C) Adjusting an organization's standard process to suit a particular project. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q056",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Process may be tailored with respect to scope, formality, frequency and:",
    "options": [
      "Granularity",
      "Language",
      "Region",
      "Colour"
    ],
    "correctAnswer": "Granularity",
    "explanation": "The correct answer is A) Granularity. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q057",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Which factor may need to be considered for tailoring a process?",
    "options": [
      "Only brand",
      "Only colour",
      "Skill level of the team, peak team size, and criticality of the application",
      "Only location"
    ],
    "correctAnswer": "Skill level of the team, peak team size, and criticality of the application",
    "explanation": "The correct answer is C) Skill level of the team, peak team size, and criticality of the application. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q058",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "Web Engineering is an ______ process.",
    "options": [
      "Rigid linear",
      "Adaptable and incremental (evolutionary)",
      "Manual",
      "One-shot"
    ],
    "correctAnswer": "Adaptable and incremental (evolutionary)",
    "explanation": "The correct answer is B) Adaptable and incremental (evolutionary). (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q059",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In Web engineering, which framework activity identifies goals and scope of the WebApp?",
    "options": [
      "Formulation",
      "Planning",
      "Page generation",
      "Modeling"
    ],
    "correctAnswer": "Formulation",
    "explanation": "The correct answer is A) Formulation. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s05_q060",
    "category": "Agile and DevOps",
    "session": 5,
    "sessionTitle": "Specialized Process Models",
    "questionText": "In Web engineering, the Modeling activity incorporates two parallel tasks: content design and:",
    "options": [
      "Database design",
      "Cost design",
      "Test design",
      "User interface design"
    ],
    "correctAnswer": "User interface design",
    "explanation": "The correct answer is D) User interface design. (Specialized Process Models)"
  },
  {
    "id": "agile_devops_s06_q001",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Traditional models such as waterfall assume that:",
    "options": [
      "Every requirement must be identified before design and implementation begins",
      "Customers are always involved",
      "Design is skipped",
      "Requirements evolve throughout"
    ],
    "correctAnswer": "Every requirement must be identified before design and implementation begins",
    "explanation": "The correct answer is A) Every requirement must be identified before design and implementation begins. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q002",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile is a solution for businesses wanting development processes that are:",
    "options": [
      "Slow and detailed",
      "Heavy and bureaucratic",
      "Lightweight, fast and easy to understand",
      "Document-driven"
    ],
    "correctAnswer": "Lightweight, fast and easy to understand",
    "explanation": "The correct answer is C) Lightweight, fast and easy to understand. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q003",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which industries benefit most from Agile due to rapidly changing needs?",
    "options": [
      "Civil construction",
      "Heavy manufacturing",
      "Mobile app development and Web-based applications",
      "Aerospace hardware"
    ],
    "correctAnswer": "Mobile app development and Web-based applications",
    "explanation": "The correct answer is C) Mobile app development and Web-based applications. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q004",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Goldman (1995) defined agility as:",
    "options": [
      "Dynamic, context-specific, aggressively change-embracing and growth-oriented",
      "Static and predictable",
      "Document-focused",
      "Cost-cutting and efficiency"
    ],
    "correctAnswer": "Dynamic, context-specific, aggressively change-embracing and growth-oriented",
    "explanation": "The correct answer is A) Dynamic, context-specific, aggressively change-embracing and growth-oriented. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q005",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile in software development is a style of adapting a process model that combines:",
    "options": [
      "Only contracts",
      "Philosophy and a set of development guidelines",
      "Only tools",
      "Only documents"
    ],
    "correctAnswer": "Philosophy and a set of development guidelines",
    "explanation": "The correct answer is B) Philosophy and a set of development guidelines. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q006",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In an Agile paradigm, each aspect of development is:",
    "options": [
      "Ignored",
      "Done once",
      "Frozen early",
      "Continually revisited throughout the life cycle"
    ],
    "correctAnswer": "Continually revisited throughout the life cycle",
    "explanation": "The correct answer is D) Continually revisited throughout the life cycle. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q007",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "The \"analysis paralysis\" phenomenon is less likely in Agile because:",
    "options": [
      "Documents are mandatory",
      "Plans are fixed",
      "Teams skip analysis entirely",
      "Teams develop software and gather requirements simultaneously"
    ],
    "correctAnswer": "Teams develop software and gather requirements simultaneously",
    "explanation": "The correct answer is D) Teams develop software and gather requirements simultaneously. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q008",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In the text, the work cycle in Agile is limited to about:",
    "options": [
      "Two months",
      "Two weeks",
      "Two years",
      "Two days"
    ],
    "correctAnswer": "Two weeks",
    "explanation": "The correct answer is B) Two weeks. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q009",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile SDLC follows the principle of:",
    "options": [
      "Increments and iterations",
      "Prototype discard",
      "One big release",
      "Waterfall phases"
    ],
    "correctAnswer": "Increments and iterations",
    "explanation": "The correct answer is A) Increments and iterations. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q010",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Short fixed-duration iterations in Agile are known as:",
    "options": [
      "Time-boxes",
      "Epics",
      "Phases",
      "Releases"
    ],
    "correctAnswer": "Time-boxes",
    "explanation": "The correct answer is A) Time-boxes. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q011",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which key feature states each iteration is a mini-increment built on top of the previous one?",
    "options": [
      "Adaptive",
      "Discipline",
      "Fixed time",
      "Iterative"
    ],
    "correctAnswer": "Iterative",
    "explanation": "The correct answer is D) Iterative. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q012",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which feature involves a lot of client involvement and face-to-face interaction?",
    "options": [
      "Discipline",
      "Fixed time",
      "Active customer involvement",
      "Simplicity"
    ],
    "correctAnswer": "Active customer involvement",
    "explanation": "The correct answer is C) Active customer involvement. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q013",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "The 80/20 rule in Agile is used to decide:",
    "options": [
      "The 20% of features used 80% of the time",
      "Hardware",
      "Budget",
      "Team size"
    ],
    "correctAnswer": "The 20% of features used 80% of the time",
    "explanation": "The correct answer is A) The 20% of features used 80% of the time. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q014",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In Agile, high priority features are:",
    "options": [
      "Developed first",
      "Developed last",
      "Dropped",
      "Not planned"
    ],
    "correctAnswer": "Developed first",
    "explanation": "The correct answer is A) Developed first. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q015",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In Agile, because the whole team is empowered to take decisions:",
    "options": [
      "A manager must approve everything",
      "There is no separate team to manage the project",
      "A separate PMO is needed",
      "Decisions are delayed"
    ],
    "correctAnswer": "There is no separate team to manage the project",
    "explanation": "The correct answer is B) There is no separate team to manage the project. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q016",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "\"People centric\" in Agile means more emphasis on:",
    "options": [
      "Processes",
      "Tools",
      "Contracts",
      "Suitably skilled people than following processes"
    ],
    "correctAnswer": "Suitably skilled people than following processes",
    "explanation": "The correct answer is D) Suitably skilled people than following processes. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q017",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile is based on ______ whereas traditional models are based on ______.",
    "options": [
      "Fixed; fixed",
      "Linear; spiral",
      "Predictive approach; adaptive methods",
      "Adaptive methods; predictive approach"
    ],
    "correctAnswer": "Adaptive methods; predictive approach",
    "explanation": "The correct answer is D) Adaptive methods; predictive approach. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q018",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Predictive teams depend entirely on:",
    "options": [
      "Planning and requirement analysis done at the beginning",
      "Prototypes",
      "Customer input",
      "Daily feedback"
    ],
    "correctAnswer": "Planning and requirement analysis done at the beginning",
    "explanation": "The correct answer is A) Planning and requirement analysis done at the beginning. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q019",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In traditional models, changes in later stages go through:",
    "options": [
      "Strict prioritization and change control management",
      "Immediate approval",
      "No process",
      "Free acceptance"
    ],
    "correctAnswer": "Strict prioritization and change control management",
    "explanation": "The correct answer is A) Strict prioritization and change control management. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q020",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile teams typically are:",
    "options": [
      "Large and siloed",
      "Separate by function",
      "Co-located and collaborative",
      "Always remote"
    ],
    "correctAnswer": "Co-located and collaborative",
    "explanation": "The correct answer is C) Co-located and collaborative. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q021",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In traditional development, requirements are:",
    "options": [
      "Unknown",
      "Evolving",
      "Fixed initially",
      "Ignored"
    ],
    "correctAnswer": "Fixed initially",
    "explanation": "The correct answer is C) Fixed initially. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q022",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In Agile, requirements:",
    "options": [
      "Are fixed initially",
      "Evolve during the life cycle",
      "Are never written",
      "Never change"
    ],
    "correctAnswer": "Evolve during the life cycle",
    "explanation": "The correct answer is B) Evolve during the life cycle. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q023",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "The Agile manifesto emerged in which year?",
    "options": [
      "2001",
      "2005",
      "1995",
      "1999"
    ],
    "correctAnswer": "2001",
    "explanation": "The correct answer is A) 2001. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q024",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "The Agile manifesto emerged at a ski lodge in:",
    "options": [
      "Switzerland",
      "Utah",
      "Oregon",
      "Colorado"
    ],
    "correctAnswer": "Utah",
    "explanation": "The correct answer is B) Utah. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q025",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "How many principles does the Agile manifesto consist of?",
    "options": [
      "Eight",
      "Ten",
      "Twelve",
      "Four"
    ],
    "correctAnswer": "Twelve",
    "explanation": "The correct answer is C) Twelve. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q026",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "\"Individuals and interactions\" are valued over:",
    "options": [
      "Contracts",
      "Documentation",
      "Processes and tools",
      "Plans"
    ],
    "correctAnswer": "Processes and tools",
    "explanation": "The correct answer is C) Processes and tools. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q027",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "\"Working software\" is valued over:",
    "options": [
      "Customer collaboration",
      "Individuals",
      "Comprehensive documentation",
      "Planning"
    ],
    "correctAnswer": "Comprehensive documentation",
    "explanation": "The correct answer is C) Comprehensive documentation. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q028",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "\"Customer collaboration\" is valued over:",
    "options": [
      "Plans",
      "Processes",
      "Working software",
      "Contract negotiation"
    ],
    "correctAnswer": "Contract negotiation",
    "explanation": "The correct answer is D) Contract negotiation. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q029",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In the manifesto, the items on the right have value, but the items on the left are valued:",
    "options": [
      "More",
      "Equally",
      "Not at all",
      "Less"
    ],
    "correctAnswer": "More",
    "explanation": "The correct answer is A) More. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q030",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which is the first core value of the Agile manifesto?",
    "options": [
      "Working software over documentation",
      "Customer collaboration over contracts",
      "Individuals and interactions over processes and tools",
      "Responding to change over plans"
    ],
    "correctAnswer": "Individuals and interactions over processes and tools",
    "explanation": "The correct answer is C) Individuals and interactions over processes and tools. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q031",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Inspect-and-adapt cycles work only when team members exhibit respect, transparency, trust and:",
    "options": [
      "Competition",
      "Isolation",
      "Secrecy",
      "Engagement"
    ],
    "correctAnswer": "Engagement",
    "explanation": "The correct answer is D) Engagement. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q032",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Positive conflict in teams leads to:",
    "options": [
      "Lower productivity",
      "Innovation and resolution of conflicting agendas",
      "Chaos",
      "Delay"
    ],
    "correctAnswer": "Innovation and resolution of conflicting agendas",
    "explanation": "The correct answer is B) Innovation and resolution of conflicting agendas. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q033",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile promotes self-organization by encouraging members to:",
    "options": [
      "Wait for orders",
      "Avoid planning",
      "Select items from a prioritized work list and manage their own work",
      "Skip reviews"
    ],
    "correctAnswer": "Select items from a prioritized work list and manage their own work",
    "explanation": "The correct answer is C) Select items from a prioritized work list and manage their own work. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q034",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Industry data suggests Agile projects have about what success rate versus traditional projects?",
    "options": [
      "Ten times",
      "Half",
      "Twice as much",
      "Same"
    ],
    "correctAnswer": "Twice as much",
    "explanation": "The correct answer is C) Twice as much. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q035",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Industry reports predict more than what percent of product requirements change during development?",
    "options": [
      "60",
      "90",
      "30",
      "10"
    ],
    "correctAnswer": "60",
    "explanation": "The correct answer is A) 60. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q036",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "\"Humphrey's Law\" states that:",
    "options": [
      "More programmers speed delivery",
      "Customers never know what they want until they see working software",
      "A system's value grows as the square of users",
      "Software reflects org structure"
    ],
    "correctAnswer": "Customers never know what they want until they see working software",
    "explanation": "The correct answer is B) Customers never know what they want until they see working software. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q037",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which law states that a system's value grows as approximately the square of the number of users?",
    "options": [
      "Humphrey's Law",
      "Metcalfe's Law",
      "Brooks's Law",
      "Conway's Law"
    ],
    "correctAnswer": "Metcalfe's Law",
    "explanation": "The correct answer is B) Metcalfe's Law. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q038",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In Agile, 20% of features are said to hold ______ of the value.",
    "options": [
      "100%",
      "80%",
      "20%",
      "50%"
    ],
    "correctAnswer": "80%",
    "explanation": "The correct answer is B) 80%. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q039",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Approximately what percentage of developers use Agile today according to the text?",
    "options": [
      "95-100%",
      "10-20%",
      "30-40%",
      "60-80%"
    ],
    "correctAnswer": "60-80%",
    "explanation": "The correct answer is D) 60-80%. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q040",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which Agile principle uses working software to measure progress?",
    "options": [
      "Principle 7",
      "Principle 12",
      "Principle 1",
      "Principle 4"
    ],
    "correctAnswer": "Principle 7",
    "explanation": "The correct answer is A) Principle 7. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q041",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which Agile principle advocates sustainable development at a constant pace?",
    "options": [
      "Principle 9",
      "Principle 5",
      "Principle 3",
      "Principle 8"
    ],
    "correctAnswer": "Principle 8",
    "explanation": "The correct answer is D) Principle 8. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q042",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "The best architectures, requirements and designs arise from:",
    "options": [
      "Customers only",
      "Self-organizing teams",
      "Managers",
      "Senior architects only"
    ],
    "correctAnswer": "Self-organizing teams",
    "explanation": "The correct answer is B) Self-organizing teams. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q043",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Extreme Programming derives its name from taking successful traditional practices to:",
    "options": [
      "Minimal levels",
      "Extreme levels",
      "Fewer levels",
      "Standard levels"
    ],
    "correctAnswer": "Extreme levels",
    "explanation": "The correct answer is B) Extreme levels. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q044",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Scrum is described as:",
    "options": [
      "A modeling language",
      "A testing tool",
      "An iterative and incremental Agile framework for managing software projects",
      "A linear model"
    ],
    "correctAnswer": "An iterative and incremental Agile framework for managing software projects",
    "explanation": "The correct answer is C) An iterative and incremental Agile framework for managing software projects. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q045",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Scrum follows an ______ approach.",
    "options": [
      "Formal",
      "Linear",
      "Empirical",
      "Predictive"
    ],
    "correctAnswer": "Empirical",
    "explanation": "The correct answer is C) Empirical. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q046",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "ASD stands for:",
    "options": [
      "Agile Standard Delivery",
      "Adaptive Software Development",
      "Automated Software Design",
      "Applied System Development"
    ],
    "correctAnswer": "Adaptive Software Development",
    "explanation": "The correct answer is B) Adaptive Software Development. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q047",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "ASD is used in business transactions involving:",
    "options": [
      "Simple tasks",
      "No risk",
      "Low value",
      "Considerable risks"
    ],
    "correctAnswer": "Considerable risks",
    "explanation": "The correct answer is D) Considerable risks. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q048",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Lean advises making decisions:",
    "options": [
      "Never",
      "Randomly",
      "As late as possible",
      "As early as possible"
    ],
    "correctAnswer": "As late as possible",
    "explanation": "The correct answer is C) As late as possible. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q049",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "AUP is a simplified version of:",
    "options": [
      "XP",
      "Scrum",
      "RAD",
      "Rational Unified Process (RUP)"
    ],
    "correctAnswer": "Rational Unified Process (RUP)",
    "explanation": "The correct answer is D) Rational Unified Process (RUP). (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q050",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Crystal methodologies are mainly applied to teams of about:",
    "options": [
      "6-8 members",
      "200+ members",
      "50-100 members",
      "1 member"
    ],
    "correctAnswer": "6-8 members",
    "explanation": "The correct answer is A) 6-8 members. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q051",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Crystal is suitable for systems that are:",
    "options": [
      "Life-critical",
      "Military only",
      "Not life-critical",
      "Safety-critical only"
    ],
    "correctAnswer": "Not life-critical",
    "explanation": "The correct answer is C) Not life-critical. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q052",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "DSDM is mainly used for projects with:",
    "options": [
      "No requirements",
      "A rigid schedule and budget",
      "No schedule",
      "Unlimited budget"
    ],
    "correctAnswer": "A rigid schedule and budget",
    "explanation": "The correct answer is B) A rigid schedule and budget. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q053",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "DSDM's Pareto principle states that:",
    "options": [
      "20% from 80%",
      "50% from 50%",
      "100% from 100%",
      "80% of business benefit comes from 20% of requirements"
    ],
    "correctAnswer": "80% of business benefit comes from 20% of requirements",
    "explanation": "The correct answer is D) 80% of business benefit comes from 20% of requirements. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q054",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "DSDM stands for:",
    "options": [
      "Dynamic Systems Development Method",
      "Dynamic Software Design Method",
      "Distributed System Development Method",
      "Digital Software Delivery Model"
    ],
    "correctAnswer": "Dynamic Systems Development Method",
    "explanation": "The correct answer is A) Dynamic Systems Development Method. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q055",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile methods are NOT appropriate for projects that:",
    "options": [
      "Involve active customers",
      "Need fast delivery",
      "Have changing requirements",
      "Have ample time for development"
    ],
    "correctAnswer": "Have ample time for development",
    "explanation": "The correct answer is D) Have ample time for development. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q056",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Agile is not used for projects where documents must be:",
    "options": [
      "Visual",
      "Informal",
      "Short",
      "Prepared and signed off at each stage"
    ],
    "correctAnswer": "Prepared and signed off at each stage",
    "explanation": "The correct answer is D) Prepared and signed off at each stage. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q057",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In the case study, Company B decided to:",
    "options": [
      "Use open source only",
      "Outsource",
      "Hire a chief software architect to come up with the design",
      "Use whiteboarding"
    ],
    "correctAnswer": "Hire a chief software architect to come up with the design",
    "explanation": "The correct answer is C) Hire a chief software architect to come up with the design. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q058",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "RUP was developed by:",
    "options": [
      "Oracle",
      "Microsoft",
      "Google",
      "IBM"
    ],
    "correctAnswer": "IBM",
    "explanation": "The correct answer is D) IBM. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q059",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "Which is NOT a RUP phase?",
    "options": [
      "Inception",
      "Deployment",
      "Transition",
      "Elaboration"
    ],
    "correctAnswer": "Deployment",
    "explanation": "The correct answer is B) Deployment. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s06_q060",
    "category": "Agile and DevOps",
    "session": 6,
    "sessionTitle": "Agile Software Development - I",
    "questionText": "In RUP, the project idea is defined and feasibility decided during:",
    "options": [
      "Construction",
      "Transition",
      "Inception",
      "Elaboration"
    ],
    "correctAnswer": "Inception",
    "explanation": "The correct answer is C) Inception. (Agile Software Development - I)"
  },
  {
    "id": "agile_devops_s07_q001",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The key difference between Agile phases and waterfall phases is that Agile phases incorporate:",
    "options": [
      "Collaboration, iteration and an incremental approach",
      "Single big release",
      "Strict sign-offs",
      "Heavy documentation"
    ],
    "correctAnswer": "Collaboration, iteration and an incremental approach",
    "explanation": "The correct answer is A) Collaboration, iteration and an incremental approach. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q002",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In Agile, new features identified during the life cycle are planned across:",
    "options": [
      "Sprints",
      "Waterfalls",
      "Spirals",
      "Gates"
    ],
    "correctAnswer": "Sprints",
    "explanation": "The correct answer is A) Sprints. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q003",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A sprint is:",
    "options": [
      "A document",
      "A meeting only",
      "A testing tool",
      "The most basic unit of development, a fixed period of time in which a task is completed and ready for review"
    ],
    "correctAnswer": "The most basic unit of development, a fixed period of time in which a task is completed and ready for review",
    "explanation": "The correct answer is D) The most basic unit of development, a fixed period of time in which a task is completed and ready for review. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q004",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The duration of each sprint depends on:",
    "options": [
      "The manager's mood",
      "The OS",
      "The budget only",
      "The feature to be developed"
    ],
    "correctAnswer": "The feature to be developed",
    "explanation": "The correct answer is D) The feature to be developed. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q005",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Requirements Analysis phase may consist of which three sub-stages?",
    "options": [
      "Design, Build, Deploy",
      "Vision, Roadmap, Backlog",
      "Planning, Coding, Testing",
      "Conception, Initiation and Analysis"
    ],
    "correctAnswer": "Conception, Initiation and Analysis",
    "explanation": "The correct answer is D) Conception, Initiation and Analysis. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q006",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Conception phase is sometimes called:",
    "options": [
      "Iteration 0",
      "Iteration -1",
      "Iteration 2",
      "Iteration 1"
    ],
    "correctAnswer": "Iteration -1",
    "explanation": "The correct answer is B) Iteration -1. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q007",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Initiation phase is sometimes called:",
    "options": [
      "Iteration 5",
      "Iteration 0",
      "Iteration 1",
      "Iteration -1"
    ],
    "correctAnswer": "Iteration 0",
    "explanation": "The correct answer is B) Iteration 0. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q008",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Conception phase helps to:",
    "options": [
      "Test code",
      "Deploy software",
      "Write release notes",
      "Define the problem or business opportunity and identify a feasible strategy"
    ],
    "correctAnswer": "Define the problem or business opportunity and identify a feasible strategy",
    "explanation": "The correct answer is D) Define the problem or business opportunity and identify a feasible strategy. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q009",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Initiation phase takes place during roughly the first:",
    "options": [
      "One year",
      "One quarter",
      "One day",
      "One week"
    ],
    "correctAnswer": "One week",
    "explanation": "The correct answer is D) One week. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q010",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In the Initiation phase, the project is initiated through:",
    "options": [
      "Coding",
      "Deployment",
      "Retrospective",
      "A feasibility study and working with stakeholders to determine initial requirements"
    ],
    "correctAnswer": "A feasibility study and working with stakeholders to determine initial requirements",
    "explanation": "The correct answer is D) A feasibility study and working with stakeholders to determine initial requirements. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q011",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which phase involves creating design strategies to model the system?",
    "options": [
      "Testing",
      "Analysis",
      "Deployment",
      "Design"
    ],
    "correctAnswer": "Design",
    "explanation": "The correct answer is D) Design. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q012",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which is the final stage of Agile development?",
    "options": [
      "Design",
      "Testing",
      "Conception",
      "Deployment"
    ],
    "correctAnswer": "Deployment",
    "explanation": "The correct answer is D) Deployment. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q013",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In traditional approaches, stakeholder sign-off is needed:",
    "options": [
      "Never",
      "Only at start",
      "Only at the end",
      "After completion of each phase"
    ],
    "correctAnswer": "After completion of each phase",
    "explanation": "The correct answer is D) After completion of each phase. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q014",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In Agile, to push development to the next phase, what is needed?",
    "options": [
      "Manager's approval only",
      "Approval from stakeholders for each requirement",
      "No approval",
      "Sign-off of all requirements"
    ],
    "correctAnswer": "Approval from stakeholders for each requirement",
    "explanation": "The correct answer is B) Approval from stakeholders for each requirement. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q015",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In software engineering, an artifact is:",
    "options": [
      "Only a user",
      "Any form of portrayal denoting an intermediate or end product of the development process",
      "Only hardware",
      "Only code"
    ],
    "correctAnswer": "Any form of portrayal denoting an intermediate or end product of the development process",
    "explanation": "The correct answer is B) Any form of portrayal denoting an intermediate or end product of the development process. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q016",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which is an example of an artifact?",
    "options": [
      "A meeting room",
      "Requirements specification",
      "A holiday",
      "A coffee machine"
    ],
    "correctAnswer": "Requirements specification",
    "explanation": "The correct answer is B) Requirements specification. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q017",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which Agile artifact is a short overview statement showing how a product supports the organization's strategies?",
    "options": [
      "Product vision statement",
      "Release plan",
      "Increment",
      "Product backlog"
    ],
    "correctAnswer": "Product vision statement",
    "explanation": "The correct answer is A) Product vision statement. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q018",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Product backlog comprises:",
    "options": [
      "Only bugs",
      "Only completed tasks",
      "A prioritized list of tasks for the project",
      "A list of users"
    ],
    "correctAnswer": "A prioritized list of tasks for the project",
    "explanation": "The correct answer is C) A prioritized list of tasks for the project. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q019",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Product roadmap comprises:",
    "options": [
      "Meeting notes",
      "Test results",
      "Current sprint tasks",
      "Product requirements with approximate time frames"
    ],
    "correctAnswer": "Product requirements with approximate time frames",
    "explanation": "The correct answer is D) Product requirements with approximate time frames. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q020",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Release plan comprises:",
    "options": [
      "Bugs",
      "Defects",
      "Daily tasks",
      "An evolving timetable describing features to be delivered in upcoming releases"
    ],
    "correctAnswer": "An evolving timetable describing features to be delivered in upcoming releases",
    "explanation": "The correct answer is D) An evolving timetable describing features to be delivered in upcoming releases. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q021",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "The Sprint backlog comprises:",
    "options": [
      "Release notes",
      "Completed tasks",
      "Tasks to be completed within the current sprint",
      "All project tasks"
    ],
    "correctAnswer": "Tasks to be completed within the current sprint",
    "explanation": "The correct answer is C) Tasks to be completed within the current sprint. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q022",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Tasks in the sprint backlog must be ranked by:",
    "options": [
      "Desired order of implementation (urgency and dependencies)",
      "Cost",
      "Alphabetical order",
      "Developer age"
    ],
    "correctAnswer": "Desired order of implementation (urgency and dependencies)",
    "explanation": "The correct answer is A) Desired order of implementation (urgency and dependencies). (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q023",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "An Increment indicates:",
    "options": [
      "The backlog",
      "Budget",
      "Product functionality at the end of each sprint",
      "Start of the sprint"
    ],
    "correctAnswer": "Product functionality at the end of each sprint",
    "explanation": "The correct answer is C) Product functionality at the end of each sprint. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q024",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which is an advantage of Agile?",
    "options": [
      "Needs heavy documentation",
      "Promotes teamwork and cross training",
      "Handles complex dependencies well",
      "Requires an overall rigid plan"
    ],
    "correctAnswer": "Promotes teamwork and cross training",
    "explanation": "The correct answer is B) Promotes teamwork and cross training. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q025",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which is a disadvantage of Agile?",
    "options": [
      "Minimum rules",
      "Very realistic in approach",
      "Not suitable for handling complex dependencies",
      "Easy to manage"
    ],
    "correctAnswer": "Not suitable for handling complex dependencies",
    "explanation": "The correct answer is C) Not suitable for handling complex dependencies. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q026",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which statement about Agile is an advantage?",
    "options": [
      "Needs large resource",
      "Delivers partial working solutions early in the cycle",
      "Requires no customer",
      "Needs lots of documents"
    ],
    "correctAnswer": "Delivers partial working solutions early in the cycle",
    "explanation": "The correct answer is B) Delivers partial working solutions early in the cycle. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q027",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A disadvantage of Agile is that it:",
    "options": [
      "Needs minimal skills",
      "Has too many rules",
      "Requires skilled manpower",
      "Is too slow"
    ],
    "correctAnswer": "Requires skilled manpower",
    "explanation": "The correct answer is C) Requires skilled manpower. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q028",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Minimum documentation in Agile can lead to:",
    "options": [
      "Lower speed",
      "Better auditing",
      "Better planning",
      "Difficulty in knowledge transfer to new team members"
    ],
    "correctAnswer": "Difficulty in knowledge transfer to new team members",
    "explanation": "The correct answer is D) Difficulty in knowledge transfer to new team members. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q029",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Agile is heavily dependent on:",
    "options": [
      "Contracts",
      "Customer interaction",
      "Tools",
      "Documentation"
    ],
    "correctAnswer": "Customer interaction",
    "explanation": "The correct answer is B) Customer interaction. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q030",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Agile requires a strong:",
    "options": [
      "Contract",
      "Change management system",
      "Hardware",
      "Procurement"
    ],
    "correctAnswer": "Change management system",
    "explanation": "The correct answer is B) Change management system. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q031",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Velocity is measured by:",
    "options": [
      "The quantity of work the team members together accomplish in one iteration",
      "Lines of code",
      "Team size",
      "Cost"
    ],
    "correctAnswer": "The quantity of work the team members together accomplish in one iteration",
    "explanation": "The correct answer is A) The quantity of work the team members together accomplish in one iteration. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q032",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Velocity is used to measure:",
    "options": [
      "Customer satisfaction",
      "Server speed",
      "The time taken for a team to deliver upcoming outcomes based on past performance",
      "Defects"
    ],
    "correctAnswer": "The time taken for a team to deliver upcoming outcomes based on past performance",
    "explanation": "The correct answer is C) The time taken for a team to deliver upcoming outcomes based on past performance. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q033",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In the first iteration, the team's velocity is:",
    "options": [
      "Known exactly",
      "Zero by definition forever",
      "Unknown, so an approximate assumption is made",
      "Always 100"
    ],
    "correctAnswer": "Unknown, so an approximate assumption is made",
    "explanation": "The correct answer is C) Unknown, so an approximate assumption is made. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q034",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Story points are used in which framework for estimating work?",
    "options": [
      "RUP",
      "XP",
      "Scrum",
      "Waterfall"
    ],
    "correctAnswer": "Scrum",
    "explanation": "The correct answer is C) Scrum. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q035",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which units are used in XP for estimating work?",
    "options": [
      "Function points",
      "Story points",
      "Hours",
      "Craft units"
    ],
    "correctAnswer": "Craft units",
    "explanation": "The correct answer is D) Craft units. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q036",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "If team size changes, the velocity must be:",
    "options": [
      "Recalculated",
      "Doubled",
      "Kept same",
      "Ignored"
    ],
    "correctAnswer": "Recalculated",
    "explanation": "The correct answer is A) Recalculated. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q037",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A team completes 20 stories in a sprint with 3 story points each. Its velocity is:",
    "options": [
      "17",
      "23",
      "60",
      "6"
    ],
    "correctAnswer": "60",
    "explanation": "The correct answer is C) 60. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q038",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A backlog has 400 story points and the team averages 40 points per sprint. Sprints required:",
    "options": [
      "4",
      "8",
      "40",
      "10"
    ],
    "correctAnswer": "10",
    "explanation": "The correct answer is D) 10. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q039",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Velocity data is depicted in:",
    "options": [
      "ER diagrams",
      "Org charts",
      "Gantt charts",
      "Burndown and burnup charts"
    ],
    "correctAnswer": "Burndown and burnup charts",
    "explanation": "The correct answer is D) Burndown and burnup charts. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q040",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Big visible charts are charts:",
    "options": [
      "Placed near Agile team workspaces to convey progress",
      "Only for managers",
      "Hidden",
      "Only digital"
    ],
    "correctAnswer": "Placed near Agile team workspaces to convey progress",
    "explanation": "The correct answer is A) Placed near Agile team workspaces to convey progress. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q041",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Big visible charts implement which Agile values?",
    "options": [
      "Competition",
      "Transparency and communication",
      "Contracts",
      "Secrecy"
    ],
    "correctAnswer": "Transparency and communication",
    "explanation": "The correct answer is B) Transparency and communication. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q042",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A burndown chart tracks:",
    "options": [
      "Work done",
      "Work remaining on the project",
      "Costs",
      "Defects"
    ],
    "correctAnswer": "Work remaining on the project",
    "explanation": "The correct answer is B) Work remaining on the project. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q043",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In a burndown chart, the vertical axis measures:",
    "options": [
      "Iterations",
      "Defects",
      "Work remaining",
      "Cost"
    ],
    "correctAnswer": "Work remaining",
    "explanation": "The correct answer is C) Work remaining. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q044",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In a burndown chart, the horizontal axis marks:",
    "options": [
      "Work remaining",
      "Iterations",
      "Time of day",
      "Team members"
    ],
    "correctAnswer": "Iterations",
    "explanation": "The correct answer is B) Iterations. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q045",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Sprint burndowns are often tracked using:",
    "options": [
      "Story points",
      "Defects",
      "Effort remaining",
      "Velocity"
    ],
    "correctAnswer": "Effort remaining",
    "explanation": "The correct answer is C) Effort remaining. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q046",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Release burndowns are often tracked using:",
    "options": [
      "Story points",
      "Effort remaining",
      "Hours",
      "Bugs"
    ],
    "correctAnswer": "Story points",
    "explanation": "The correct answer is A) Story points. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q047",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A burnup chart tracks:",
    "options": [
      "Defects",
      "Work remaining only",
      "Costs",
      "The amount of work done"
    ],
    "correctAnswer": "The amount of work done",
    "explanation": "The correct answer is D) The amount of work done. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q048",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A burnup chart can show what that a burndown chart finds difficult to show?",
    "options": [
      "Team size",
      "Changing goal or scope of the project",
      "Defects",
      "Cost"
    ],
    "correctAnswer": "Changing goal or scope of the project",
    "explanation": "The correct answer is B) Changing goal or scope of the project. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q049",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In a burnup chart, the bottom line represents:",
    "options": [
      "Cost",
      "Total scope",
      "Time",
      "Work done"
    ],
    "correctAnswer": "Work done",
    "explanation": "The correct answer is D) Work done. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q050",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "In a burnup chart, the top line represents:",
    "options": [
      "Work done",
      "Total scope",
      "Cost",
      "Defects"
    ],
    "correctAnswer": "Total scope",
    "explanation": "The correct answer is B) Total scope. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q051",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Scope creep in a burnup chart is seen when:",
    "options": [
      "Team grows",
      "Defects rise",
      "The total scope line keeps increasing",
      "The work done line falls"
    ],
    "correctAnswer": "The total scope line keeps increasing",
    "explanation": "The correct answer is C) The total scope line keeps increasing. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q052",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Process improvement charts are used to:",
    "options": [
      "Track budget",
      "Measure specific issues the team would like to improve",
      "Track bugs",
      "Track attendance"
    ],
    "correctAnswer": "Measure specific issues the team would like to improve",
    "explanation": "The correct answer is B) Measure specific issues the team would like to improve. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q053",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Process improvement charts stay:",
    "options": [
      "Forever",
      "Only as long as they are necessary",
      "Only in meetings",
      "Hidden"
    ],
    "correctAnswer": "Only as long as they are necessary",
    "explanation": "The correct answer is B) Only as long as they are necessary. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q054",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Which is an example of a big visible chart apart from burndown?",
    "options": [
      "Iteration and release planning boards",
      "Test script",
      "Source code",
      "Contract"
    ],
    "correctAnswer": "Iteration and release planning boards",
    "explanation": "The correct answer is A) Iteration and release planning boards. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q055",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "An informative workspace is:",
    "options": [
      "A contract",
      "A meeting",
      "A practice with feedback mechanisms built into the workspace",
      "A software tool"
    ],
    "correctAnswer": "A practice with feedback mechanisms built into the workspace",
    "explanation": "The correct answer is C) A practice with feedback mechanisms built into the workspace. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q056",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "An important feature of an informative workspace is that it:",
    "options": [
      "Is only virtual",
      "Advertises information into the room",
      "Requires interruptions",
      "Hides information"
    ],
    "correctAnswer": "Advertises information into the room",
    "explanation": "The correct answer is B) Advertises information into the room. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q057",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Why are hand-drawn charts a solution in informative workspaces?",
    "options": [
      "They look better",
      "They're mandatory",
      "They need no update",
      "Projectors/plasma screens everywhere are difficult and expensive"
    ],
    "correctAnswer": "Projectors/plasma screens everywhere are difficult and expensive",
    "explanation": "The correct answer is D) Projectors/plasma screens everywhere are difficult and expensive. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q058",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A task board has at minimum these columns:",
    "options": [
      "To-do, in-progress, done",
      "Plan, Do, Check",
      "Open, Closed, Hold",
      "Backlog, Review, Release"
    ],
    "correctAnswer": "To-do, in-progress, done",
    "explanation": "The correct answer is A) To-do, in-progress, done. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q059",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "A task board mostly displays:",
    "options": [
      "The work to be performed during the current iteration",
      "Marketing tasks",
      "The entire product history",
      "Only completed tasks"
    ],
    "correctAnswer": "The work to be performed during the current iteration",
    "explanation": "The correct answer is A) The work to be performed during the current iteration. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s07_q060",
    "category": "Agile and DevOps",
    "session": 7,
    "sessionTitle": "Agile Software Development - II",
    "questionText": "Ideally, a task board consists of:",
    "options": [
      "Only emails",
      "Only software",
      "Only spreadsheets",
      "Note cards or sticky notes affixed to a wall"
    ],
    "correctAnswer": "Note cards or sticky notes affixed to a wall",
    "explanation": "The correct answer is D) Note cards or sticky notes affixed to a wall. (Agile Software Development - II)"
  },
  {
    "id": "agile_devops_s08_q001",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "XP concentrates mainly on:",
    "options": [
      "Project management only",
      "Hardware design",
      "Marketing",
      "Software development rather than project management"
    ],
    "correctAnswer": "Software development rather than project management",
    "explanation": "The correct answer is D) Software development rather than project management. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q002",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The first XP project was started in:",
    "options": [
      "1990",
      "2010",
      "1996",
      "2001"
    ],
    "correctAnswer": "1996",
    "explanation": "The correct answer is C) 1996. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q003",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "XP was designed so that organizations could adopt:",
    "options": [
      "Only one practice",
      "The whole methodology or parts of it",
      "Nothing",
      "Only the whole"
    ],
    "correctAnswer": "The whole methodology or parts of it",
    "explanation": "The correct answer is B) The whole methodology or parts of it. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q004",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The main focus of XP is on:",
    "options": [
      "Documentation",
      "Tools",
      "Customer satisfaction",
      "Contracts"
    ],
    "correctAnswer": "Customer satisfaction",
    "explanation": "The correct answer is C) Customer satisfaction. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q005",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "An advantage of XP is that it empowers developers to handle changes in requirements:",
    "options": [
      "Confidently, even late in the life cycle",
      "Never",
      "With heavy approval",
      "Only early"
    ],
    "correctAnswer": "Confidently, even late in the life cycle",
    "explanation": "The correct answer is A) Confidently, even late in the life cycle. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q006",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In XP the customer:",
    "options": [
      "Is outside the project",
      "Only signs contracts",
      "Stays away",
      "Is an integral part of the team and sits with the team"
    ],
    "correctAnswer": "Is an integral part of the team and sits with the team",
    "explanation": "The correct answer is D) Is an integral part of the team and sits with the team. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q007",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The XP practice \"Sit together\" means:",
    "options": [
      "Developers work alone",
      "Managers sit separately",
      "The whole team works from one open space",
      "Everyone works remotely"
    ],
    "correctAnswer": "The whole team works from one open space",
    "explanation": "The correct answer is C) The whole team works from one open space. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q008",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The XP practice \"Energized team\" discourages:",
    "options": [
      "Overtime work",
      "Design",
      "Pair programming",
      "Testing"
    ],
    "correctAnswer": "Overtime work",
    "explanation": "The correct answer is A) Overtime work. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q009",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Pair programming refers to:",
    "options": [
      "Two teams on two projects",
      "Two programmers working together at one computer on the same design",
      "Two managers meeting",
      "One programmer and one tester on two computers"
    ],
    "correctAnswer": "Two programmers working together at one computer on the same design",
    "explanation": "The correct answer is B) Two programmers working together at one computer on the same design. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q010",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "User stories in XP are:",
    "options": [
      "Short statements of customer-visible functionality",
      "Test scripts",
      "Design diagrams",
      "Long specification documents"
    ],
    "correctAnswer": "Short statements of customer-visible functionality",
    "explanation": "The correct answer is A) Short statements of customer-visible functionality. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q011",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In XP, who estimates the user stories?",
    "options": [
      "Developers",
      "Tracker",
      "Manager",
      "Customer"
    ],
    "correctAnswer": "Developers",
    "explanation": "The correct answer is A) Developers. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q012",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The XP \"Weekly cycle\" begins with:",
    "options": [
      "A deployment",
      "A retrospective",
      "A release",
      "A meeting to review progress and decide stories for the week"
    ],
    "correctAnswer": "A meeting to review progress and decide stories for the week",
    "explanation": "The correct answer is D) A meeting to review progress and decide stories for the week. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q013",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Quarterly cycle, the team picks:",
    "options": [
      "A single bug",
      "A theme or themes for the quarter",
      "The hardware",
      "The tools"
    ],
    "correctAnswer": "A theme or themes for the quarter",
    "explanation": "The correct answer is B) A theme or themes for the quarter. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q014",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "\"Ten-minute build\" promotes:",
    "options": [
      "Regular testing by running tests within ten minutes",
      "Manual testing",
      "Long builds",
      "Rare testing"
    ],
    "correctAnswer": "Regular testing by running tests within ten minutes",
    "explanation": "The correct answer is A) Regular testing by running tests within ten minutes. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q015",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In \"Test-first programming\", a user story is fulfilled when:",
    "options": [
      "It passes the acceptance test",
      "It is documented",
      "It is coded",
      "The manager approves"
    ],
    "correctAnswer": "It passes the acceptance test",
    "explanation": "The correct answer is A) It passes the acceptance test. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q016",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "TDD stands for:",
    "options": [
      "Task-Driven Delivery",
      "Test-Deployment Design",
      "Test-Driven Development",
      "Time-Driven Design"
    ],
    "correctAnswer": "Test-Driven Development",
    "explanation": "The correct answer is C) Test-Driven Development. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q017",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "After a test passes in TDD, the developer:",
    "options": [
      "Deletes the test",
      "Refactors the new code to acceptable standards",
      "Ignores it",
      "Ships it"
    ],
    "correctAnswer": "Refactors the new code to acceptable standards",
    "explanation": "The correct answer is B) Refactors the new code to acceptable standards. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q018",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In Continuous integration, programmers check in code:",
    "options": [
      "Several times a day, only if all unit tests pass",
      "Once a month",
      "Without tests",
      "Never"
    ],
    "correctAnswer": "Several times a day, only if all unit tests pass",
    "explanation": "The correct answer is A) Several times a day, only if all unit tests pass. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q019",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Incremental design means:",
    "options": [
      "Designing only at the end",
      "Never designing",
      "Designing the system every day using experience gained rather than all in advance",
      "Designing all upfront"
    ],
    "correctAnswer": "Designing the system every day using experience gained rather than all in advance",
    "explanation": "The correct answer is C) Designing the system every day using experience gained rather than all in advance. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q020",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In XP, short use cases (stories) can be put on:",
    "options": [
      "An index card",
      "A database",
      "An email",
      "A formal document"
    ],
    "correctAnswer": "An index card",
    "explanation": "The correct answer is A) An index card. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q021",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "User stories must be:",
    "options": [
      "Long and detailed",
      "Technical only",
      "Unordered",
      "Testable, estimable and business-oriented"
    ],
    "correctAnswer": "Testable, estimable and business-oriented",
    "explanation": "The correct answer is D) Testable, estimable and business-oriented. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q022",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "An iteration in XP is typically:",
    "options": [
      "One day",
      "One year",
      "One to two weeks long",
      "Three months"
    ],
    "correctAnswer": "One to two weeks long",
    "explanation": "The correct answer is C) One to two weeks long. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q023",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "How many values is XP based on?",
    "options": [
      "Five",
      "Six",
      "Three",
      "Four"
    ],
    "correctAnswer": "Five",
    "explanation": "The correct answer is A) Five. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q024",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The XP value \"Simplicity\" means:",
    "options": [
      "Ignore requirements",
      "Build everything upfront",
      "Add extras",
      "Design and code only what is in the current requirements"
    ],
    "correctAnswer": "Design and code only what is in the current requirements",
    "explanation": "The correct answer is D) Design and code only what is in the current requirements. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q025",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The XP value \"Feedback\" includes:",
    "options": [
      "Feedback after death phase",
      "Only manager feedback",
      "Customer feedback at the end of each iteration and release",
      "No feedback"
    ],
    "correctAnswer": "Customer feedback at the end of each iteration and release",
    "explanation": "The correct answer is C) Customer feedback at the end of each iteration and release. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q026",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "How many phases are in the XP life cycle described?",
    "options": [
      "Seven",
      "Five",
      "Six",
      "Four"
    ],
    "correctAnswer": "Six",
    "explanation": "The correct answer is C) Six. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q027",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Exploration phase, customers write:",
    "options": [
      "Test cases",
      "Source code",
      "Release notes",
      "Story cards for the first release"
    ],
    "correctAnswer": "Story cards for the first release",
    "explanation": "The correct answer is D) Story cards for the first release. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q028",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In Exploration, the team builds a prototype to check:",
    "options": [
      "User training",
      "Technology and architectural capabilities",
      "Marketing",
      "Pricing"
    ],
    "correctAnswer": "Technology and architectural capabilities",
    "explanation": "The correct answer is B) Technology and architectural capabilities. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q029",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The Planning phase usually takes:",
    "options": [
      "Two weeks",
      "One year",
      "A couple of days",
      "Several months"
    ],
    "correctAnswer": "A couple of days",
    "explanation": "The correct answer is C) A couple of days. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q030",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Iterations to Release phase, each iteration takes:",
    "options": [
      "Six months",
      "One day",
      "One to four weeks",
      "One year"
    ],
    "correctAnswer": "One to four weeks",
    "explanation": "The correct answer is C) One to four weeks. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q031",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The first iteration in \"Iterations to Release\" creates:",
    "options": [
      "The final product",
      "Nothing",
      "A prototype of the whole system",
      "Only documents"
    ],
    "correctAnswer": "A prototype of the whole system",
    "explanation": "The correct answer is C) A prototype of the whole system. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q032",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Productionizing phase, the system goes through:",
    "options": [
      "Retirement",
      "Requirement writing",
      "Initial design",
      "Extra testing and performance checks"
    ],
    "correctAnswer": "Extra testing and performance checks",
    "explanation": "The correct answer is D) Extra testing and performance checks. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q033",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Maintenance phase, development velocity:",
    "options": [
      "Is unchanged",
      "Increases",
      "Decreases",
      "Doubles"
    ],
    "correctAnswer": "Decreases",
    "explanation": "The correct answer is C) Decreases. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q034",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the Death phase:",
    "options": [
      "The project starts",
      "Planning starts",
      "Testing starts",
      "Customer requirements are met and no more stories exist; documentation is done"
    ],
    "correctAnswer": "Customer requirements are met and no more stories exist; documentation is done",
    "explanation": "The correct answer is D) Customer requirements are met and no more stories exist; documentation is done. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q035",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which is NOT a reason for the Death phase?",
    "options": [
      "More stories are added",
      "The system doesn't deliver desired output",
      "The system becomes too expensive to develop further",
      "Customer needs are met"
    ],
    "correctAnswer": "More stories are added",
    "explanation": "The correct answer is A) More stories are added. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q036",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "User story cards contain:",
    "options": [
      "Short requirement descriptions as a commitment to further conversation",
      "Test results",
      "Full requirement statements",
      "Source code"
    ],
    "correctAnswer": "Short requirement descriptions as a commitment to further conversation",
    "explanation": "The correct answer is A) Short requirement descriptions as a commitment to further conversation. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q037",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The task list represents:",
    "options": [
      "Defects",
      "Releases",
      "Meetings",
      "Tasks of user stories for an iteration"
    ],
    "correctAnswer": "Tasks of user stories for an iteration",
    "explanation": "The correct answer is D) Tasks of user stories for an iteration. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q038",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In XP, programmers are:",
    "options": [
      "Not assigned tasks but volunteer for them",
      "Assigned by the coach",
      "Assigned by tracker",
      "Assigned tasks by the manager"
    ],
    "correctAnswer": "Not assigned tasks but volunteer for them",
    "explanation": "The correct answer is A) Not assigned tasks but volunteer for them. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q039",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "CRC cards are recorded during:",
    "options": [
      "A design brainstorming session",
      "Maintenance",
      "Deployment",
      "Testing"
    ],
    "correctAnswer": "A design brainstorming session",
    "explanation": "The correct answer is A) A design brainstorming session. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q040",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Customer Acceptance Tests are developed by:",
    "options": [
      "The tracker",
      "The coach",
      "The customer",
      "The programmer"
    ],
    "correctAnswer": "The customer",
    "explanation": "The correct answer is C) The customer. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q041",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Successful conclusion of customer acceptance tests denotes:",
    "options": [
      "Completion of a user story",
      "A release delay",
      "A bug",
      "The start of a story"
    ],
    "correctAnswer": "Completion of a user story",
    "explanation": "The correct answer is A) Completion of a user story. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q042",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Visible wall graphs usually depict:",
    "options": [
      "Office timings",
      "Number of stories completed and test cases passed",
      "Salaries",
      "Hours worked"
    ],
    "correctAnswer": "Number of stories completed and test cases passed",
    "explanation": "The correct answer is B) Number of stories completed and test cases passed. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q043",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which XP role teaches the team the XP process and monitors it?",
    "options": [
      "Coach",
      "Customer",
      "Manager",
      "Tester"
    ],
    "correctAnswer": "Coach",
    "explanation": "The correct answer is A) Coach. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q044",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The coach in XP is basically a:",
    "options": [
      "Customer",
      "Manager",
      "Tester",
      "Programmer, not a manager"
    ],
    "correctAnswer": "Programmer, not a manager",
    "explanation": "The correct answer is D) Programmer, not a manager. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q045",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which XP role traces estimates and provides feedback to improve future ones?",
    "options": [
      "Tester",
      "Coach",
      "Tracker",
      "Manager"
    ],
    "correctAnswer": "Tracker",
    "explanation": "The correct answer is C) Tracker. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q046",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which XP role helps customers write tests, runs functional tests and broadcasts results?",
    "options": [
      "Manager",
      "Coach",
      "Tracker",
      "Tester"
    ],
    "correctAnswer": "Tester",
    "explanation": "The correct answer is D) Tester. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q047",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which is an advantage of XP?",
    "options": [
      "Heavy planning",
      "High documentation",
      "Rigid process",
      "Robustness"
    ],
    "correctAnswer": "Robustness",
    "explanation": "The correct answer is D) Robustness. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q048",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "XP bases cost estimates on:",
    "options": [
      "Team size",
      "Number of meetings",
      "Developer hours",
      "Software features instead of developer activity"
    ],
    "correctAnswer": "Software features instead of developer activity",
    "explanation": "The correct answer is D) Software features instead of developer activity. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q049",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In XP, resilience refers to:",
    "options": [
      "No changes",
      "Readily adopting changed requirements",
      "Rigid scope",
      "Fixed contracts"
    ],
    "correctAnswer": "Readily adopting changed requirements",
    "explanation": "The correct answer is B) Readily adopting changed requirements. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q050",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "XP provides cost savings by:",
    "options": [
      "Longer cycles",
      "Cutting unproductive activities like unnecessary paperwork and meetings",
      "Adding more meetings",
      "More documents"
    ],
    "correctAnswer": "Cutting unproductive activities like unnecessary paperwork and meetings",
    "explanation": "The correct answer is B) Cutting unproductive activities like unnecessary paperwork and meetings. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q051",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "XP reduces risk by:",
    "options": [
      "Using a single coder",
      "Relying on one architect",
      "More documentation",
      "Distributing risk so there is less dependency on any one person"
    ],
    "correctAnswer": "Distributing risk so there is less dependency on any one person",
    "explanation": "The correct answer is D) Distributing risk so there is less dependency on any one person. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q052",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "A disadvantage of XP is that it is:",
    "options": [
      "Design-centric",
      "Code-centric and not design-centric",
      "Too slow",
      "Too heavy"
    ],
    "correctAnswer": "Code-centric and not design-centric",
    "explanation": "The correct answer is B) Code-centric and not design-centric. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q053",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "A disadvantage of XP is that:",
    "options": [
      "It measures quality too much",
      "It is too rigid",
      "It does not measure or plan the quality aspect",
      "It has too much documentation"
    ],
    "correctAnswer": "It does not measure or plan the quality aspect",
    "explanation": "The correct answer is C) It does not measure or plan the quality aspect. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q054",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Too much refactoring in XP can be:",
    "options": [
      "A waste of time",
      "Highly productive always",
      "Free",
      "Required"
    ],
    "correctAnswer": "A waste of time",
    "explanation": "The correct answer is A) A waste of time. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q055",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "In the case study, WDSGlobal formed regions in:",
    "options": [
      "Americas, Asia and Europe",
      "Asia only",
      "Africa, Asia and Europe",
      "Americas and Europe only"
    ],
    "correctAnswer": "Americas, Asia and Europe",
    "explanation": "The correct answer is A) Americas, Asia and Europe. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q056",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which source control system had performance issues, taking up to 40 minutes to synchronize?",
    "options": [
      "Perforce",
      "Git",
      "CVS",
      "SVN"
    ],
    "correctAnswer": "CVS",
    "explanation": "The correct answer is C) CVS. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q057",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The new source control system chosen was:",
    "options": [
      "SVN",
      "CVS",
      "Perforce",
      "Mercurial"
    ],
    "correctAnswer": "Perforce",
    "explanation": "The correct answer is C) Perforce. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q058",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "The \"Boot Camp\" was meant to:",
    "options": [
      "Buy equipment",
      "Develop mutual trust by working together at the UK office",
      "Reduce staff",
      "Train managers"
    ],
    "correctAnswer": "Develop mutual trust by working together at the UK office",
    "explanation": "The correct answer is B) Develop mutual trust by working together at the UK office. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q059",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "\"Rotating Guru\" involved:",
    "options": [
      "Replacing the manager",
      "A senior XP team member visiting regions to help",
      "A guru from outside",
      "Closing the UK office"
    ],
    "correctAnswer": "A senior XP team member visiting regions to help",
    "explanation": "The correct answer is B) A senior XP team member visiting regions to help. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s08_q060",
    "category": "Agile and DevOps",
    "session": 8,
    "sessionTitle": "Extreme Programming",
    "questionText": "Which user acceptance testing framework was adopted in the case study?",
    "options": [
      "QTP",
      "Cucumber",
      "Selenium",
      "JUnit"
    ],
    "correctAnswer": "Selenium",
    "explanation": "The correct answer is C) Selenium. (Extreme Programming)"
  },
  {
    "id": "agile_devops_s09_q001",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum is best described as:",
    "options": [
      "A testing tool",
      "An Agile framework for developing complex products",
      "A programming language",
      "A rigid process"
    ],
    "correctAnswer": "An Agile framework for developing complex products",
    "explanation": "The correct answer is B) An Agile framework for developing complex products. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q002",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum has been used to manage complex product development since:",
    "options": [
      "The early 1990s",
      "The 1970s",
      "2015",
      "2005"
    ],
    "correctAnswer": "The early 1990s",
    "explanation": "The correct answer is A) The early 1990s. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q003",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum is not a process or technique but a:",
    "options": [
      "Framework within which various processes and techniques can be employed",
      "Language",
      "Contract",
      "Tool"
    ],
    "correctAnswer": "Framework within which various processes and techniques can be employed",
    "explanation": "The correct answer is A) Framework within which various processes and techniques can be employed. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q004",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Each sprint delivers:",
    "options": [
      "Only documents",
      "A prototype to discard",
      "Only a plan",
      "A product increment"
    ],
    "correctAnswer": "A product increment",
    "explanation": "The correct answer is D) A product increment. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q005",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum includes how many essential artifacts?",
    "options": [
      "Four",
      "Two",
      "Three",
      "Five"
    ],
    "correctAnswer": "Three",
    "explanation": "The correct answer is C) Three. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q006",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The product backlog is a:",
    "options": [
      "Finished product",
      "Detailed plan for the next sprint",
      "List of requirements in the order in which they are to be built",
      "Meeting"
    ],
    "correctAnswer": "List of requirements in the order in which they are to be built",
    "explanation": "The correct answer is C) List of requirements in the order in which they are to be built. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q007",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The sprint backlog is a:",
    "options": [
      "Detailed plan for development during the next sprint",
      "Release plan",
      "Risk register",
      "List of all product features"
    ],
    "correctAnswer": "Detailed plan for development during the next sprint",
    "explanation": "The correct answer is A) Detailed plan for development during the next sprint. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q008",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum is based on:",
    "options": [
      "Empirical process control theory (empiricism)",
      "Formal methods",
      "Waterfall",
      "Predictive planning"
    ],
    "correctAnswer": "Empirical process control theory (empiricism)",
    "explanation": "The correct answer is A) Empirical process control theory (empiricism). (Scrum)"
  },
  {
    "id": "agile_devops_s09_q009",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Empiricism states that knowledge comes from:",
    "options": [
      "Theory only",
      "Documents",
      "Authority",
      "Experience derived from what is already known"
    ],
    "correctAnswer": "Experience derived from what is already known",
    "explanation": "The correct answer is D) Experience derived from what is already known. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q010",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Transparency requires significant aspects of the process to be:",
    "options": [
      "Defined by a common standard",
      "Hidden",
      "Random",
      "Complex"
    ],
    "correctAnswer": "Defined by a common standard",
    "explanation": "The correct answer is A) Defined by a common standard. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q011",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In Scrum, inspection should not be:",
    "options": [
      "Performed by skilled inspectors",
      "So frequent that it gets in the way of work",
      "Done on artifacts",
      "Done at point of work"
    ],
    "correctAnswer": "So frequent that it gets in the way of work",
    "explanation": "The correct answer is B) So frequent that it gets in the way of work. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q012",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Adaptation means that if a process deviates from acceptable limits, it is:",
    "options": [
      "Stopped",
      "Documented only",
      "Ignored",
      "Adjusted quickly"
    ],
    "correctAnswer": "Adjusted quickly",
    "explanation": "The correct answer is D) Adjusted quickly. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q013",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Which is a rule/characteristic of Scrum?",
    "options": [
      "Freeze requirements",
      "Always have a product ready enough to be despatched",
      "Avoid a common language",
      "Skip testing"
    ],
    "correctAnswer": "Always have a product ready enough to be despatched",
    "explanation": "The correct answer is B) Always have a product ready enough to be despatched. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q014",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum breaks down large products into:",
    "options": [
      "One large block",
      "Smaller manageable chunks",
      "Only documents",
      "Only tasks"
    ],
    "correctAnswer": "Smaller manageable chunks",
    "explanation": "The correct answer is B) Smaller manageable chunks. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q015",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Scrum value \"Focus\" means:",
    "options": [
      "Focusing on documents",
      "Ignoring tasks",
      "Focusing on all tasks",
      "The team focuses on only a few things at a time"
    ],
    "correctAnswer": "The team focuses on only a few things at a time",
    "explanation": "The correct answer is D) The team focuses on only a few things at a time. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q016",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Scrum value \"Courage\" arises because the team:",
    "options": [
      "Has no resources",
      "Feels supported with resources to undertake bigger challenges",
      "Is hidden",
      "Is micromanaged"
    ],
    "correctAnswer": "Feels supported with resources to undertake bigger challenges",
    "explanation": "The correct answer is B) Feels supported with resources to undertake bigger challenges. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q017",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Scrum value \"Commitment\" arises because the team:",
    "options": [
      "Has no goals",
      "Is controlled",
      "Avoids success",
      "Is in control of its own destiny"
    ],
    "correctAnswer": "Is in control of its own destiny",
    "explanation": "The correct answer is D) Is in control of its own destiny. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q018",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Scrum value \"Respect\" means members:",
    "options": [
      "Work alone",
      "Hide failures",
      "Respect each other and help each other become worthy of respect",
      "Compete"
    ],
    "correctAnswer": "Respect each other and help each other become worthy of respect",
    "explanation": "The correct answer is C) Respect each other and help each other become worthy of respect. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q019",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Which phase includes system architecture modification and high-level design?",
    "options": [
      "Development sprint",
      "Closure",
      "Planning",
      "Architecture"
    ],
    "correctAnswer": "Architecture",
    "explanation": "The correct answer is D) Architecture. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q020",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In which phase is a design review meeting held with each team putting forth strategies?",
    "options": [
      "Architecture",
      "Closure",
      "Sprint",
      "Planning"
    ],
    "correctAnswer": "Architecture",
    "explanation": "The correct answer is A) Architecture. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q021",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In a Scrum development sprint, which step closes the packets and creates an executable version?",
    "options": [
      "Wrap",
      "Adjust",
      "Develop",
      "Review"
    ],
    "correctAnswer": "Wrap",
    "explanation": "The correct answer is A) Wrap. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q022",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The \"Review\" step in a sprint involves:",
    "options": [
      "Only the manager",
      "Planning",
      "Coding",
      "All teams meeting to present progress, raise issues and update the backlog"
    ],
    "correctAnswer": "All teams meeting to present progress, raise issues and update the backlog",
    "explanation": "The correct answer is D) All teams meeting to present progress, raise issues and update the backlog. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q023",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The \"Adjust\" step in a sprint:",
    "options": [
      "Skips testing",
      "Starts new release",
      "Includes information from the review meeting into appropriate packets",
      "Ends project"
    ],
    "correctAnswer": "Includes information from the review meeting into appropriate packets",
    "explanation": "The correct answer is C) Includes information from the review meeting into appropriate packets. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q024",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Closure includes integration, system test, user documentation, training and:",
    "options": [
      "Prototyping",
      "Requirement gathering",
      "Coding",
      "Marketing material preparation"
    ],
    "correctAnswer": "Marketing material preparation",
    "explanation": "The correct answer is D) Marketing material preparation. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q025",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Scrum uses time-boxed events so that:",
    "options": [
      "No more than a fixed amount of time is wasted in planning",
      "Meetings are random",
      "Time is unlimited",
      "Events are never-ending"
    ],
    "correctAnswer": "No more than a fixed amount of time is wasted in planning",
    "explanation": "The correct answer is A) No more than a fixed amount of time is wasted in planning. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q026",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "A sprint is a:",
    "options": [
      "Repeatable work cycle in which a usable, potentially shippable increment is created",
      "Meeting",
      "Release",
      "One-time event"
    ],
    "correctAnswer": "Repeatable work cycle in which a usable, potentially shippable increment is created",
    "explanation": "The correct answer is A) Repeatable work cycle in which a usable, potentially shippable increment is created. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q027",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The duration of a sprint is usually:",
    "options": [
      "One month or less",
      "One year",
      "Six months",
      "Three months"
    ],
    "correctAnswer": "One month or less",
    "explanation": "The correct answer is A) One month or less. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q028",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Sprints limit risk to:",
    "options": [
      "Two years",
      "One week",
      "One year",
      "One calendar month"
    ],
    "correctAnswer": "One calendar month",
    "explanation": "The correct answer is D) One calendar month. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q029",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Only the ______ has the authority to cancel a sprint.",
    "options": [
      "Customer",
      "Product owner",
      "Scrum master",
      "Development team"
    ],
    "correctAnswer": "Product owner",
    "explanation": "The correct answer is B) Product owner. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q030",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Sprint Planning Meeting is time-boxed to what maximum for a one-month sprint?",
    "options": [
      "Eight hours",
      "Fifteen minutes",
      "Two hours",
      "Four hours"
    ],
    "correctAnswer": "Eight hours",
    "explanation": "The correct answer is A) Eight hours. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q031",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Sprint Planning Meeting consists of how many parts?",
    "options": [
      "Four",
      "Three",
      "One",
      "Two"
    ],
    "correctAnswer": "Two",
    "explanation": "The correct answer is D) Two. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q032",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Who selects items from the product backlog during sprint planning?",
    "options": [
      "The development team",
      "The stakeholders",
      "The product owner",
      "The Scrum master"
    ],
    "correctAnswer": "The development team",
    "explanation": "The correct answer is A) The development team. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q033",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The product backlog items selected for a sprint along with the plan form the:",
    "options": [
      "Roadmap",
      "Product backlog",
      "Release plan",
      "Sprint backlog"
    ],
    "correctAnswer": "Sprint backlog",
    "explanation": "The correct answer is D) Sprint backlog. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q034",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "By the end of sprint planning, planned work is divided into units of:",
    "options": [
      "One day or less",
      "One month",
      "One week",
      "Two days"
    ],
    "correctAnswer": "One day or less",
    "explanation": "The correct answer is A) One day or less. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q035",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Daily Scrum is held:",
    "options": [
      "Weekly",
      "Monthly",
      "At random times",
      "At the same place and time each day"
    ],
    "correctAnswer": "At the same place and time each day",
    "explanation": "The correct answer is D) At the same place and time each day. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q036",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Daily Scrum is the responsibility of the:",
    "options": [
      "Stakeholders",
      "Development team",
      "Product owner",
      "Customer"
    ],
    "correctAnswer": "Development team",
    "explanation": "The correct answer is B) Development team. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q037",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Sprint Review for a one-month sprint is time-boxed to:",
    "options": [
      "One hour",
      "Two hours",
      "Four hours",
      "Eight hours"
    ],
    "correctAnswer": "Four hours",
    "explanation": "The correct answer is C) Four hours. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q038",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In the Sprint Review, the team presents:",
    "options": [
      "Salaries",
      "Contracts",
      "The budget",
      "The product increment to stakeholders for feedback"
    ],
    "correctAnswer": "The product increment to stakeholders for feedback",
    "explanation": "The correct answer is D) The product increment to stakeholders for feedback. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q039",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Sprint Retrospective for a one-month sprint is time-boxed to:",
    "options": [
      "Three hours",
      "Eight hours",
      "Four hours",
      "Fifteen minutes"
    ],
    "correctAnswer": "Three hours",
    "explanation": "The correct answer is A) Three hours. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q040",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The purpose of the Sprint Retrospective is to:",
    "options": [
      "Review the previous sprint and plan process improvements",
      "Estimate cost",
      "Demonstrate product",
      "Plan the release"
    ],
    "correctAnswer": "Review the previous sprint and plan process improvements",
    "explanation": "The correct answer is A) Review the previous sprint and plan process improvements. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q041",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Who is the only person responsible for managing the product backlog?",
    "options": [
      "Development team",
      "Product owner",
      "Customer",
      "Scrum master"
    ],
    "correctAnswer": "Product owner",
    "explanation": "The correct answer is B) Product owner. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q042",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The product owner is:",
    "options": [
      "A committee",
      "A single person, not a committee",
      "The whole team",
      "The customer organization"
    ],
    "correctAnswer": "A single person, not a committee",
    "explanation": "The correct answer is B) A single person, not a committee. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q043",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The development team is responsible for:",
    "options": [
      "Handling funds",
      "Managing the backlog",
      "Delivering a potentially releasable increment at the end of each sprint",
      "Prioritizing the backlog"
    ],
    "correctAnswer": "Delivering a potentially releasable increment at the end of each sprint",
    "explanation": "The correct answer is C) Delivering a potentially releasable increment at the end of each sprint. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q044",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The ideal development team size excludes:",
    "options": [
      "Testers",
      "Developers",
      "Product owner and Scrum master",
      "Designers"
    ],
    "correctAnswer": "Product owner and Scrum master",
    "explanation": "The correct answer is C) Product owner and Scrum master. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q045",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Fewer than how many team members decreases interaction and causes skill constraints?",
    "options": [
      "Seven",
      "Five",
      "Three",
      "Ten"
    ],
    "correctAnswer": "Three",
    "explanation": "The correct answer is C) Three. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q046",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The Scrum Master's responsibility is to ensure:",
    "options": [
      "The code compiles",
      "The team follows Scrum practices and rules",
      "The product ships",
      "The budget is met"
    ],
    "correctAnswer": "The team follows Scrum practices and rules",
    "explanation": "The correct answer is B) The team follows Scrum practices and rules. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q047",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Removing obstacles that hinder team progress is a duty of the:",
    "options": [
      "Customer",
      "Product owner",
      "Tester",
      "Scrum master"
    ],
    "correctAnswer": "Scrum master",
    "explanation": "The correct answer is D) Scrum master. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q048",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The product backlog exists:",
    "options": [
      "For one sprint",
      "Until the first release",
      "Never",
      "As long as the product exists"
    ],
    "correctAnswer": "As long as the product exists",
    "explanation": "The correct answer is D) As long as the product exists. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q049",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "A product backlog is called a \"living artefact\" because:",
    "options": [
      "It is hidden",
      "Requirements keep getting updated",
      "It never changes",
      "It is written in a book"
    ],
    "correctAnswer": "Requirements keep getting updated",
    "explanation": "The correct answer is B) Requirements keep getting updated. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q050",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Who is responsible for all estimates in backlog grooming?",
    "options": [
      "The development team",
      "The customer",
      "The product owner",
      "The Scrum master"
    ],
    "correctAnswer": "The development team",
    "explanation": "The correct answer is A) The development team. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q051",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Who can change the sprint backlog during a sprint?",
    "options": [
      "Product owner",
      "Scrum master",
      "Only the development team",
      "Customer"
    ],
    "correctAnswer": "Only the development team",
    "explanation": "The correct answer is C) Only the development team. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q052",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The sprint burndown chart is a:",
    "options": [
      "Org chart",
      "Budget chart",
      "Leading indicator of whether the team will meet its goals",
      "Lagging indicator only"
    ],
    "correctAnswer": "Leading indicator of whether the team will meet its goals",
    "explanation": "The correct answer is C) Leading indicator of whether the team will meet its goals. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q053",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Story points are used to:",
    "options": [
      "Assign people",
      "Measure cost",
      "Compare the size of features",
      "Measure time"
    ],
    "correctAnswer": "Compare the size of features",
    "explanation": "The correct answer is C) Compare the size of features. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q054",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The impediment backlog is:",
    "options": [
      "A release plan",
      "A list of things that prevent the team from progressing or improving",
      "A test plan",
      "A feature list"
    ],
    "correctAnswer": "A list of things that prevent the team from progressing or improving",
    "explanation": "The correct answer is B) A list of things that prevent the team from progressing or improving. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q055",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In the Dutch Railways case, the first attempt to build the PUB system used:",
    "options": [
      "Scrum",
      "A traditional waterfall approach",
      "XP",
      "Prototyping"
    ],
    "correctAnswer": "A traditional waterfall approach",
    "explanation": "The correct answer is B) A traditional waterfall approach. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q056",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "The first vendor's project was cancelled after:",
    "options": [
      "One year",
      "Ten years",
      "Three years",
      "Six months"
    ],
    "correctAnswer": "Three years",
    "explanation": "The correct answer is C) Three years. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q057",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In the case study, who filled the product owner role?",
    "options": [
      "A vendor",
      "Two business analysts",
      "A single manager",
      "The CEO"
    ],
    "correctAnswer": "Two business analysts",
    "explanation": "The correct answer is B) Two business analysts. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q058",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "Which tool did the distributed Scrum teams use to track sprint progress?",
    "options": [
      "Trello",
      "MS Project",
      "Jira only",
      "ScrumWorks"
    ],
    "correctAnswer": "ScrumWorks",
    "explanation": "The correct answer is D) ScrumWorks. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q059",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In the case study, a separate team with architectural focus was created to:",
    "options": [
      "Test code",
      "Write code",
      "Handle payroll",
      "Gather non-functional requirements"
    ],
    "correctAnswer": "Gather non-functional requirements",
    "explanation": "The correct answer is D) Gather non-functional requirements. (Scrum)"
  },
  {
    "id": "agile_devops_s09_q060",
    "category": "Agile and DevOps",
    "session": 9,
    "sessionTitle": "Scrum",
    "questionText": "In the case study, extensive Dutch documentation was handled by:",
    "options": [
      "The product owner",
      "A hired technical writer",
      "The developers",
      "The testers"
    ],
    "correctAnswer": "A hired technical writer",
    "explanation": "The correct answer is B) A hired technical writer. (Scrum)"
  },
  {
    "id": "agile_devops_s10_q001",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "ASD focuses on:",
    "options": [
      "Rapid creation, application and evolution of software systems",
      "Heavy planning",
      "Documentation",
      "Hardware design"
    ],
    "correctAnswer": "Rapid creation, application and evolution of software systems",
    "explanation": "The correct answer is A) Rapid creation, application and evolution of software systems. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q002",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "ASD was derived from:",
    "options": [
      "Waterfall",
      "Rapid Application Development",
      "V-model",
      "Spiral"
    ],
    "correctAnswer": "Rapid Application Development",
    "explanation": "The correct answer is B) Rapid Application Development. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q003",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Iterations in ASD are called:",
    "options": [
      "Sprints",
      "Adaptive cycles",
      "Phases",
      "Time-boxes"
    ],
    "correctAnswer": "Adaptive cycles",
    "explanation": "The correct answer is B) Adaptive cycles. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q004",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "The adaptive life cycle has how many main phases?",
    "options": [
      "Three",
      "Four",
      "Two",
      "Five"
    ],
    "correctAnswer": "Three",
    "explanation": "The correct answer is A) Three. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q005",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "The three phases of the ASD life cycle are:",
    "options": [
      "Speculate, Collaborate, Learn",
      "Plan, Do, Check",
      "Think, Build, Ship",
      "Explore, Plan, Release"
    ],
    "correctAnswer": "Speculate, Collaborate, Learn",
    "explanation": "The correct answer is A) Speculate, Collaborate, Learn. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q006",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "How many main steps are there in the Speculate phase?",
    "options": [
      "Four",
      "Three",
      "Five",
      "Six"
    ],
    "correctAnswer": "Five",
    "explanation": "The correct answer is C) Five. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q007",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "For a larger project, initiation takes about:",
    "options": [
      "One year",
      "Two to three weeks",
      "One hour",
      "Two days"
    ],
    "correctAnswer": "Two to three weeks",
    "explanation": "The correct answer is B) Two to three weeks. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q008",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In ASD, the project time-box is fixed based on:",
    "options": [
      "Scope, requirements, estimates and resource availability",
      "Team name",
      "Fixed budget only",
      "Colour"
    ],
    "correctAnswer": "Scope, requirements, estimates and resource availability",
    "explanation": "The correct answer is A) Scope, requirements, estimates and resource availability. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q009",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "ASD projects work best with:",
    "options": [
      "One-day iterations",
      "One-year iterations",
      "Six-month iterations",
      "Two-week iterations"
    ],
    "correctAnswer": "Two-week iterations",
    "explanation": "The correct answer is D) Two-week iterations. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q010",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Similar to the Sprint Goal in Scrum, in ASD the team develops:",
    "options": [
      "A contract",
      "A budget",
      "A theme for each iteration",
      "A defect list"
    ],
    "correctAnswer": "A theme for each iteration",
    "explanation": "The correct answer is C) A theme for each iteration. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q011",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In ASD, who decides the priority of features?",
    "options": [
      "The tester",
      "The project manager",
      "The customer",
      "The vendor"
    ],
    "correctAnswer": "The customer",
    "explanation": "The correct answer is C) The customer. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q012",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In the Collaborate phase, collaboration is based on:",
    "options": [
      "Trust and respect",
      "Secrecy",
      "Hierarchy",
      "Contracts"
    ],
    "correctAnswer": "Trust and respect",
    "explanation": "The correct answer is A) Trust and respect. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q013",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Who is included in collaboration in ASD?",
    "options": [
      "Only customers",
      "Customer, development team, consultants and vendors",
      "Only developers",
      "Only managers"
    ],
    "correctAnswer": "Customer, development team, consultants and vendors",
    "explanation": "The correct answer is B) Customer, development team, consultants and vendors. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q014",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "How many things are learned at the end of each ASD iteration?",
    "options": [
      "Four",
      "Three",
      "Two",
      "Five"
    ],
    "correctAnswer": "Four",
    "explanation": "The correct answer is A) Four. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q015",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "ASD recommends which group for customer feedback?",
    "options": [
      "Marketing group",
      "Customer focus group",
      "Vendor group",
      "Test group"
    ],
    "correctAnswer": "Customer focus group",
    "explanation": "The correct answer is B) Customer focus group. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q016",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Second priority in ASD learning is:",
    "options": [
      "Technical quality",
      "People review",
      "Status",
      "Budget"
    ],
    "correctAnswer": "Technical quality",
    "explanation": "The correct answer is A) Technical quality. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q017",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In ASD, mini retrospectives help to review:",
    "options": [
      "Budget",
      "Hardware",
      "Contract",
      "People and process"
    ],
    "correctAnswer": "People and process",
    "explanation": "The correct answer is D) People and process. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q018",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "The end of each iteration in ASD is marked by:",
    "options": [
      "Contracts",
      "Completed deliverables",
      "Documents",
      "Completed features"
    ],
    "correctAnswer": "Completed features",
    "explanation": "The correct answer is D) Completed features. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q019",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "A disadvantage of ASD is that it is:",
    "options": [
      "Not scalable",
      "Too cheap",
      "Too fast",
      "Too well documented"
    ],
    "correctAnswer": "Not scalable",
    "explanation": "The correct answer is A) Not scalable. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q020",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "DSDM provides a framework for developing systems that meet:",
    "options": [
      "Unlimited time",
      "Only cost constraints",
      "No constraints",
      "Rigid time constraints through incremental prototyping"
    ],
    "correctAnswer": "Rigid time constraints through incremental prototyping",
    "explanation": "The correct answer is D) Rigid time constraints through incremental prototyping. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q021",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "DSDM is a ______ method.",
    "options": [
      "Waterfall",
      "Prototype",
      "Spiral",
      "RAD"
    ],
    "correctAnswer": "RAD",
    "explanation": "The correct answer is D) RAD. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q022",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "A typical DSDM project delivers an operational system within:",
    "options": [
      "Six months",
      "Ten years",
      "Two weeks",
      "One day"
    ],
    "correctAnswer": "Six months",
    "explanation": "The correct answer is A) Six months. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q023",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "According to DSDM, most projects fail because of:",
    "options": [
      "Languages",
      "Budget",
      "Technology",
      "People issues rather than technology"
    ],
    "correctAnswer": "People issues rather than technology",
    "explanation": "The correct answer is D) People issues rather than technology. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q024",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "How many underlying principles does DSDM have?",
    "options": [
      "Five",
      "Twelve",
      "Nine",
      "Seven"
    ],
    "correctAnswer": "Nine",
    "explanation": "The correct answer is C) Nine. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q025",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which is a DSDM principle?",
    "options": [
      "Active user involvement is essential",
      "Testing at the end",
      "Documents first",
      "No changes allowed"
    ],
    "correctAnswer": "Active user involvement is essential",
    "explanation": "The correct answer is A) Active user involvement is essential. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q026",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In DSDM, the essential criterion for acceptance of deliverables is:",
    "options": [
      "Budget",
      "Time",
      "Compliance to business purpose",
      "Documentation"
    ],
    "correctAnswer": "Compliance to business purpose",
    "explanation": "The correct answer is C) Compliance to business purpose. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q027",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In DSDM, all changes during development are:",
    "options": [
      "Final",
      "Irreversible",
      "Forbidden",
      "Reversible"
    ],
    "correctAnswer": "Reversible",
    "explanation": "The correct answer is D) Reversible. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q028",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In DSDM, testing is:",
    "options": [
      "Skipped",
      "Integrated throughout the life cycle",
      "Outsourced",
      "Done at the end"
    ],
    "correctAnswer": "Integrated throughout the life cycle",
    "explanation": "The correct answer is B) Integrated throughout the life cycle. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q029",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In DSDM, what is fixed and what is allowed to change?",
    "options": [
      "Requirements fixed; time changes",
      "All change",
      "Time and resources fixed; requirements change",
      "All fixed"
    ],
    "correctAnswer": "Time and resources fixed; requirements change",
    "explanation": "The correct answer is C) Time and resources fixed; requirements change. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q030",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "The most important technique used in the DSDM feasibility study phase is:",
    "options": [
      "Surveys",
      "Workshops",
      "Prototyping",
      "Contracts"
    ],
    "correctAnswer": "Workshops",
    "explanation": "The correct answer is B) Workshops. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q031",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Deliverables of the Feasibility Study include the Feasibility Report, Feasibility Prototype, Global Outline Plan and:",
    "options": [
      "Risk Log",
      "Contract",
      "Test Plan",
      "Release Notes"
    ],
    "correctAnswer": "Risk Log",
    "explanation": "The correct answer is A) Risk Log. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q032",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In the Business Study phase, requirements are prioritized and grouped into:",
    "options": [
      "A feasibility report",
      "A contract",
      "A risk log",
      "A requirement list"
    ],
    "correctAnswer": "A requirement list",
    "explanation": "The correct answer is D) A requirement list. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q033",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In the Functional Model Iteration, requirements are converted into:",
    "options": [
      "Final product",
      "Test cases only",
      "Contracts",
      "A functional model and prototype"
    ],
    "correctAnswer": "A functional model and prototype",
    "explanation": "The correct answer is D) A functional model and prototype. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q034",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "The Design and Build Iteration integrates functional components and addresses:",
    "options": [
      "Business study",
      "Training",
      "Non-functional requirements",
      "Contracts"
    ],
    "correctAnswer": "Non-functional requirements",
    "explanation": "The correct answer is C) Non-functional requirements. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q035",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role has the ultimate power to make decisions and is responsible for funds?",
    "options": [
      "Tester",
      "Scribe",
      "Visionary",
      "Executive Sponsor / Project Champion"
    ],
    "correctAnswer": "Executive Sponsor / Project Champion",
    "explanation": "The correct answer is D) Executive Sponsor / Project Champion. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q036",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role possesses the most accurate perception of business objectives and initializes the project?",
    "options": [
      "Developer",
      "Scribe",
      "Ambassador user",
      "Visionary"
    ],
    "correctAnswer": "Visionary",
    "explanation": "The correct answer is D) Visionary. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q037",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role is a representative of the user community who provides feedback to developers?",
    "options": [
      "Facilitator",
      "Ambassador user",
      "Tester",
      "Visionary"
    ],
    "correctAnswer": "Ambassador user",
    "explanation": "The correct answer is B) Ambassador user. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q038",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role records requirements, agreements and decisions?",
    "options": [
      "Tester",
      "Scribe",
      "Facilitator",
      "Developer"
    ],
    "correctAnswer": "Scribe",
    "explanation": "The correct answer is B) Scribe. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q039",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role manages the progress of workshops?",
    "options": [
      "Tester",
      "Visionary",
      "Facilitator",
      "Scribe"
    ],
    "correctAnswer": "Facilitator",
    "explanation": "The correct answer is C) Facilitator. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q040",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM role ensures that the team works effectively as a whole?",
    "options": [
      "Developer",
      "Technical coordinator",
      "Scribe",
      "Team leader"
    ],
    "correctAnswer": "Team leader",
    "explanation": "The correct answer is D) Team leader. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q041",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM technique uses time-boxes where traditional methods use milestones?",
    "options": [
      "Workshop",
      "MoSCoW",
      "Prototyping",
      "Time-boxing"
    ],
    "correctAnswer": "Time-boxing",
    "explanation": "The correct answer is D) Time-boxing. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q042",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "MoSCoW rules are used to:",
    "options": [
      "Estimate cost",
      "Test code",
      "Assign roles",
      "Weigh the importance of requirements"
    ],
    "correctAnswer": "Weigh the importance of requirements",
    "explanation": "The correct answer is D) Weigh the importance of requirements. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q043",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In MoSCoW, features that are important but can be omitted if time is short are:",
    "options": [
      "Must have",
      "Could have",
      "Want to have",
      "Should have"
    ],
    "correctAnswer": "Should have",
    "explanation": "The correct answer is D) Should have. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q044",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In MoSCoW, features that add functional enhancements and can be reassigned to a later time-box are:",
    "options": [
      "Won't have",
      "Could have",
      "Must have",
      "Should have"
    ],
    "correctAnswer": "Could have",
    "explanation": "The correct answer is B) Could have. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q045",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which MoSCoW category contains features of little value for a limited group of users?",
    "options": [
      "Should have",
      "Want to have",
      "Must have",
      "Could have"
    ],
    "correctAnswer": "Want to have",
    "explanation": "The correct answer is B) Want to have. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q046",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which DSDM prototype ensures the product's ability to perform under load?",
    "options": [
      "Performance prototype",
      "Capability prototype",
      "Business prototype",
      "Usability prototype"
    ],
    "correctAnswer": "Performance prototype",
    "explanation": "The correct answer is A) Performance prototype. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q047",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "A disadvantage of DSDM is:",
    "options": [
      "Slow delivery",
      "High cost of licensing",
      "Poor visibility",
      "No user involvement"
    ],
    "correctAnswer": "High cost of licensing",
    "explanation": "The correct answer is B) High cost of licensing. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q048",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal methodologies are based on the belief that:",
    "options": [
      "Tools matter most",
      "Different projects call for different methodologies",
      "All projects need the same method",
      "Documentation matters most"
    ],
    "correctAnswer": "Different projects call for different methodologies",
    "explanation": "The correct answer is B) Different projects call for different methodologies. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q049",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal methodologies categorize projects according to size and:",
    "options": [
      "Colour",
      "Location",
      "Criticality of the system",
      "Budget"
    ],
    "correctAnswer": "Criticality of the system",
    "explanation": "The correct answer is C) Criticality of the system. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q050",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Core Crystal philosophy is credited to:",
    "options": [
      "Jeff Sutherland",
      "Ken Schwaber",
      "Kent Beck",
      "Alistair Cockburn"
    ],
    "correctAnswer": "Alistair Cockburn",
    "explanation": "The correct answer is D) Alistair Cockburn. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q051",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal requires incremental development with increments of:",
    "options": [
      "Two years",
      "Six months",
      "Four months or less",
      "One year"
    ],
    "correctAnswer": "Four months or less",
    "explanation": "The correct answer is C) Four months or less. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q052",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal teams must hold:",
    "options": [
      "Only retrospectives at end",
      "Annual meetings",
      "No workshops",
      "Pre and post-increment reflection workshops"
    ],
    "correctAnswer": "Pre and post-increment reflection workshops",
    "explanation": "The correct answer is D) Pre and post-increment reflection workshops. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q053",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which Crystal technique converts a base methodology into a starter methodology?",
    "options": [
      "Time-boxing",
      "MoSCoW",
      "Reflection workshop",
      "Methodology tuning"
    ],
    "correctAnswer": "Methodology tuning",
    "explanation": "The correct answer is D) Methodology tuning. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q054",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal Yellow is for teams of:",
    "options": [
      "8 or fewer",
      "20-50",
      "50-100",
      "10-20 people"
    ],
    "correctAnswer": "10-20 people",
    "explanation": "The correct answer is D) 10-20 people. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q055",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal Orange is for teams of:",
    "options": [
      "50-100",
      "20-50 people",
      "10-20",
      "Over 100"
    ],
    "correctAnswer": "20-50 people",
    "explanation": "The correct answer is B) 20-50 people. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q056",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Crystal Diamond and Sapphire are used for:",
    "options": [
      "Small projects",
      "Critical projects where human life could be at risk",
      "Prototype",
      "Hobby projects"
    ],
    "correctAnswer": "Critical projects where human life could be at risk",
    "explanation": "The correct answer is B) Critical projects where human life could be at risk. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q057",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "How many common properties exist among members of the Crystal family?",
    "options": [
      "Eight",
      "Six",
      "Five",
      "Seven"
    ],
    "correctAnswer": "Seven",
    "explanation": "The correct answer is D) Seven. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q058",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "Which is a Crystal property?",
    "options": [
      "Heavy documentation",
      "Strict hierarchy",
      "Manual builds",
      "Osmotic communication"
    ],
    "correctAnswer": "Osmotic communication",
    "explanation": "The correct answer is D) Osmotic communication. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q059",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "In Crystal, \"Focus\" includes a two-hour uninterrupted period and assigning a developer to a project for a minimum of:",
    "options": [
      "Two weeks",
      "Two hours",
      "Two days",
      "Two months"
    ],
    "correctAnswer": "Two days",
    "explanation": "The correct answer is C) Two days. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s10_q060",
    "category": "Agile and DevOps",
    "session": 10,
    "sessionTitle": "Agile Process Models - I",
    "questionText": "\"Easy access to expert users\" in Crystal suggests a meeting with an expert user at least:",
    "options": [
      "Once a week for a minimum of two hours",
      "Once a month",
      "Once a year",
      "Never"
    ],
    "correctAnswer": "Once a week for a minimum of two hours",
    "explanation": "The correct answer is A) Once a week for a minimum of two hours. (Agile Process Models - I)"
  },
  {
    "id": "agile_devops_s11_q001",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "FDD is ideal for use by:",
    "options": [
      "Hardware teams",
      "Single developers",
      "Non-IT teams",
      "Big teams working with object-oriented technology"
    ],
    "correctAnswer": "Big teams working with object-oriented technology",
    "explanation": "The correct answer is D) Big teams working with object-oriented technology. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q002",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "FDD stands for:",
    "options": [
      "Fixed Date Development",
      "Fast Delivery Design",
      "Feature Driven Development",
      "Function Design Delivery"
    ],
    "correctAnswer": "Feature Driven Development",
    "explanation": "The correct answer is C) Feature Driven Development. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q003",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "After the overall model, FDD proceeds with a series of how long iterations of \"design by feature, build by feature\"?",
    "options": [
      "Two weeks",
      "Two months",
      "Two days",
      "One year"
    ],
    "correctAnswer": "Two weeks",
    "explanation": "The correct answer is A) Two weeks. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q004",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In Domain Object Modeling, the best technique is considered to be:",
    "options": [
      "ER modeling",
      "Modeling in Color",
      "Black-box modeling",
      "State modeling"
    ],
    "correctAnswer": "Modeling in Color",
    "explanation": "The correct answer is B) Modeling in Color. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q005",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In UML in Color, which color denotes the role assumed by a person in an organization?",
    "options": [
      "Blue",
      "Green",
      "Yellow",
      "Pink"
    ],
    "correctAnswer": "Yellow",
    "explanation": "The correct answer is C) Yellow. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q006",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In UML in Color, which color stands for a party, place or thing?",
    "options": [
      "Yellow",
      "Pink",
      "Blue",
      "Green"
    ],
    "correctAnswer": "Green",
    "explanation": "The correct answer is D) Green. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q007",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In UML in Color, auxiliary classes and interfaces are:",
    "options": [
      "Pink",
      "Yellow",
      "Not assigned any colors",
      "Green"
    ],
    "correctAnswer": "Not assigned any colors",
    "explanation": "The correct answer is C) Not assigned any colors. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q008",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In FDD, a \"feature\" should be completable within:",
    "options": [
      "Two days",
      "Two weeks",
      "Two months",
      "One year"
    ],
    "correctAnswer": "Two weeks",
    "explanation": "The correct answer is B) Two weeks. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q009",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "A Feature Set is:",
    "options": [
      "A class",
      "A group of business-related features",
      "A single feature",
      "A test"
    ],
    "correctAnswer": "A group of business-related features",
    "explanation": "The correct answer is B) A group of business-related features. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q010",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "When a feature involves multiple classes, the ______ coordinates the efforts.",
    "options": [
      "Tester",
      "Customer",
      "Manager",
      "Feature owner"
    ],
    "correctAnswer": "Feature owner",
    "explanation": "The correct answer is D) Feature owner. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q011",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD best practice aims at publicizing good practices, conventions and culture?",
    "options": [
      "Regular builds",
      "Reporting",
      "Inspections",
      "Configuration management"
    ],
    "correctAnswer": "Inspections",
    "explanation": "The correct answer is C) Inspections. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q012",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Configuration management in FDD helps to:",
    "options": [
      "Write stories",
      "Measure velocity",
      "Identify latest versions of completed source code files",
      "Plan sprints"
    ],
    "correctAnswer": "Identify latest versions of completed source code files",
    "explanation": "The correct answer is C) Identify latest versions of completed source code files. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q013",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The first FDD process is:",
    "options": [
      "Build a features list",
      "Design by feature",
      "Develop an overall model",
      "Plan by feature"
    ],
    "correctAnswer": "Develop an overall model",
    "explanation": "The correct answer is C) Develop an overall model. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q014",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The five FDD processes include: Develop overall model, Build features list, Plan by feature, Design by feature and:",
    "options": [
      "Test by feature",
      "Deploy by feature",
      "Release by feature",
      "Build by feature"
    ],
    "correctAnswer": "Build by feature",
    "explanation": "The correct answer is D) Build by feature. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q015",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role is the administrative head of the project?",
    "options": [
      "Project Manager",
      "Chief Architect",
      "Release Manager",
      "Development Manager"
    ],
    "correctAnswer": "Project Manager",
    "explanation": "The correct answer is A) Project Manager. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q016",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role manages day-to-day development activities?",
    "options": [
      "Release Manager",
      "Project Manager",
      "Language Guru",
      "Development Manager"
    ],
    "correctAnswer": "Development Manager",
    "explanation": "The correct answer is D) Development Manager. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q017",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role leads small teams through design and development?",
    "options": [
      "Class Owner",
      "Tool Smith",
      "System Administrator",
      "Chief Programmer"
    ],
    "correctAnswer": "Chief Programmer",
    "explanation": "The correct answer is D) Chief Programmer. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q018",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role represents the knowledge database (users, sponsors, business analysts)?",
    "options": [
      "Domain Expert",
      "Release Manager",
      "Tool Smith",
      "Class Owner"
    ],
    "correctAnswer": "Domain Expert",
    "explanation": "The correct answer is A) Domain Expert. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q019",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role sets up and runs the regular build process?",
    "options": [
      "Tool Smith",
      "Language Guru",
      "Release Manager",
      "Build Engineer"
    ],
    "correctAnswer": "Build Engineer",
    "explanation": "The correct answer is D) Build Engineer. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q020",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which FDD role creates small development tools for teams?",
    "options": [
      "Tool Smith",
      "Class Owner",
      "Language Guru",
      "Build Engineer"
    ],
    "correctAnswer": "Tool Smith",
    "explanation": "The correct answer is A) Tool Smith. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q021",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "LSD stands for:",
    "options": [
      "Large Scale Delivery",
      "Limited Scope Design",
      "Low Speed Design",
      "Lean Software Development"
    ],
    "correctAnswer": "Lean Software Development",
    "explanation": "The correct answer is D) Lean Software Development. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q022",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "How many key principles form the backbone of LSD?",
    "options": [
      "Six",
      "Nine",
      "Seven",
      "Five"
    ],
    "correctAnswer": "Seven",
    "explanation": "The correct answer is C) Seven. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q023",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The first principle of Lean is:",
    "options": [
      "Deliver fast",
      "Eliminate waste",
      "Amplify learning",
      "Decide as late as possible"
    ],
    "correctAnswer": "Eliminate waste",
    "explanation": "The correct answer is B) Eliminate waste. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q024",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Seven types of waste in software development include partially done work, extra features, relearning, handoffs, delays, task switching and:",
    "options": [
      "Planning",
      "Defects",
      "Meetings",
      "Testing"
    ],
    "correctAnswer": "Defects",
    "explanation": "The correct answer is B) Defects. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q025",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which Lean tool detects waste by focusing on value-to-client products?",
    "options": [
      "Value Stream Mapping",
      "Set-based development",
      "Pair positioning",
      "Queuing theory"
    ],
    "correctAnswer": "Value Stream Mapping",
    "explanation": "The correct answer is A) Value Stream Mapping. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q026",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which Lean principle encourages feedback, iterations, synchronization and set-based development?",
    "options": [
      "Empower the team",
      "Amplify learning",
      "Eliminate waste",
      "See the whole"
    ],
    "correctAnswer": "Amplify learning",
    "explanation": "The correct answer is B) Amplify learning. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q027",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In synchronization, each team member should integrate:",
    "options": [
      "Monthly",
      "Daily, with multiple teams synchronizing weekly",
      "Yearly",
      "Never"
    ],
    "correctAnswer": "Daily, with multiple teams synchronizing weekly",
    "explanation": "The correct answer is B) Daily, with multiple teams synchronizing weekly. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q028",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which Lean principle postpones decision-making as long as possible?",
    "options": [
      "Decide as late as possible",
      "See the whole",
      "Eliminate waste",
      "Deliver fast"
    ],
    "correctAnswer": "Decide as late as possible",
    "explanation": "The correct answer is A) Decide as late as possible. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q029",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "\"Last Responsible Moment\" is when:",
    "options": [
      "The project starts",
      "After release",
      "After testing",
      "The possibility of failing to make a decision eliminates an important alternative"
    ],
    "correctAnswer": "The possibility of failing to make a decision eliminates an important alternative",
    "explanation": "The correct answer is D) The possibility of failing to make a decision eliminates an important alternative. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q030",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The fundamental measurement of a queue is:",
    "options": [
      "Defects",
      "Velocity",
      "Cost",
      "Cycle time"
    ],
    "correctAnswer": "Cycle time",
    "explanation": "The correct answer is D) Cycle time. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q031",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "\"Cost of Delay\" considers the effect of delays on:",
    "options": [
      "Profits and sales",
      "Code size",
      "Tools",
      "Team size"
    ],
    "correctAnswer": "Profits and sales",
    "explanation": "The correct answer is A) Profits and sales. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q032",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which quote is from William McKnight, a 3M leader?",
    "options": [
      "\"Move fast.\"",
      "\"Hire good people, and leave them alone.\"",
      "\"Fail fast.\"",
      "\"Plans are everything.\""
    ],
    "correctAnswer": "\"Hire good people, and leave them alone.\"",
    "explanation": "The correct answer is B) \"Hire good people, and leave them alone.\". (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q033",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "\"Master developers\" in Lean leadership include chief programmers, architects and:",
    "options": [
      "Managers",
      "Testers only",
      "System engineers",
      "Salespeople"
    ],
    "correctAnswer": "System engineers",
    "explanation": "The correct answer is C) System engineers. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q034",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Conceptual integrity means:",
    "options": [
      "All tests pass",
      "All code is documented",
      "A design is part of the same overall design wherever you look",
      "All components are the same"
    ],
    "correctAnswer": "A design is part of the same overall design wherever you look",
    "explanation": "The correct answer is C) A design is part of the same overall design wherever you look. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q035",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Domain models understood by both users and developers, used in joint modeling, is called:",
    "options": [
      "Feature-Driven Design",
      "Test-Driven Design",
      "Model-Driven Design",
      "Data-Driven Design"
    ],
    "correctAnswer": "Model-Driven Design",
    "explanation": "The correct answer is C) Model-Driven Design. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q036",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Developer tests ensure that:",
    "options": [
      "The UI is nice",
      "Code does what the developer intended",
      "The system does what customers expect",
      "The budget is met"
    ],
    "correctAnswer": "Code does what the developer intended",
    "explanation": "The correct answer is B) Code does what the developer intended. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q037",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In Lean \"See the Whole,\" it is not ideal to track defects per developer because less than ______ of defects are under the developer's control.",
    "options": [
      "20%",
      "50%",
      "80%",
      "90%"
    ],
    "correctAnswer": "20%",
    "explanation": "The correct answer is A) 20%. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q038",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Per the Standish Group study mentioned, up to ______ of delivered features are not used.",
    "options": [
      "45%",
      "5%",
      "80%",
      "95%"
    ],
    "correctAnswer": "45%",
    "explanation": "The correct answer is A) 45%. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q039",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which model categorizes product attributes as must-be, performance and attractive factors?",
    "options": [
      "Spiral model",
      "Kano model",
      "V-model",
      "RACI"
    ],
    "correctAnswer": "Kano model",
    "explanation": "The correct answer is B) Kano model. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q040",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The Kanban method emphasizes:",
    "options": [
      "Limiting work in progress",
      "Large batches",
      "Unlimited WIP",
      "Contracts"
    ],
    "correctAnswer": "Limiting work in progress",
    "explanation": "The correct answer is A) Limiting work in progress. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q041",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "AUP stands for:",
    "options": [
      "Agile Unified Process",
      "Advanced Unified Process",
      "Applied Unified Process",
      "Agile Universal Practice"
    ],
    "correctAnswer": "Agile Unified Process",
    "explanation": "The correct answer is A) Agile Unified Process. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q042",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The AUP principle \"Your staff knows what they are doing\" means people:",
    "options": [
      "Respond better to training and high-level guidance than tedious documentation",
      "Need supervision",
      "Need heavy documentation",
      "Need no training"
    ],
    "correctAnswer": "Respond better to training and high-level guidance than tedious documentation",
    "explanation": "The correct answer is A) Respond better to training and high-level guidance than tedious documentation. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q043",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The AUP overall development cycle consists of how many phases?",
    "options": [
      "Three",
      "Four",
      "Five",
      "Six"
    ],
    "correctAnswer": "Four",
    "explanation": "The correct answer is B) Four. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q044",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The four AUP phases are:",
    "options": [
      "Plan, Do, Check, Act",
      "Speculate, Collaborate, Learn, Adapt",
      "Initiate, Execute, Monitor, Close",
      "Inception, Elaboration, Construction, Transition"
    ],
    "correctAnswer": "Inception, Elaboration, Construction, Transition",
    "explanation": "The correct answer is D) Inception, Elaboration, Construction, Transition. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q045",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The Construction phase in AUP aims to develop:",
    "options": [
      "Working software in a frequent, incremental manner",
      "Only documents",
      "Only plans",
      "Only prototypes"
    ],
    "correctAnswer": "Working software in a frequent, incremental manner",
    "explanation": "The correct answer is A) Working software in a frequent, incremental manner. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q046",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "How many disciplines are performed in each AUP iteration?",
    "options": [
      "Five",
      "Six",
      "Nine",
      "Seven"
    ],
    "correctAnswer": "Seven",
    "explanation": "The correct answer is D) Seven. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q047",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Which AUP discipline covers RUP's Business Modeling, Requirements, and Analysis and Design?",
    "options": [
      "Deployment",
      "Implementation",
      "Test",
      "Model"
    ],
    "correctAnswer": "Model",
    "explanation": "The correct answer is D) Model. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q048",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Model storming sessions in AUP last a maximum of about:",
    "options": [
      "One week",
      "Four hours",
      "15 minutes (sometimes up to 30)",
      "Two days"
    ],
    "correctAnswer": "15 minutes (sometimes up to 30)",
    "explanation": "The correct answer is C) 15 minutes (sometimes up to 30). (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q049",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Who coined the term \"User Story\" in 1996?",
    "options": [
      "Alistair Cockburn",
      "Kent Beck",
      "Martin Fowler",
      "Ken Schwaber"
    ],
    "correctAnswer": "Kent Beck",
    "explanation": "The correct answer is B) Kent Beck. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q050",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "The user story template is:",
    "options": [
      "Who-What-When",
      "As a <type of user>, I want <some goal> so that <some reason>",
      "Given-When-Then",
      "Input-Process-Output"
    ],
    "correctAnswer": "As a <type of user>, I want <some goal> so that <some reason>",
    "explanation": "The correct answer is B) As a <type of user>, I want <some goal> so that <some reason>. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q051",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In user stories, \"Conversations\" mainly deal with:",
    "options": [
      "Tools",
      "Cost",
      "Release dates",
      "The details of the story"
    ],
    "correctAnswer": "The details of the story",
    "explanation": "The correct answer is D) The details of the story. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q052",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Who usually has the final word on product vision and requirements in story conversations?",
    "options": [
      "Product Owner",
      "Tester",
      "Developer",
      "Scrum Master"
    ],
    "correctAnswer": "Product Owner",
    "explanation": "The correct answer is A) Product Owner. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q053",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "About what percentage of a sprint is assigned to preparation for the upcoming sprint (backlog refinement)?",
    "options": [
      "50%",
      "90%",
      "25%",
      "10%"
    ],
    "correctAnswer": "10%",
    "explanation": "The correct answer is D) 10%. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q054",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Failure to settle acceptance criteria before the sprint leads to:",
    "options": [
      "Faster delivery",
      "Less work",
      "Over-commitment by the team",
      "Better planning"
    ],
    "correctAnswer": "Over-commitment by the team",
    "explanation": "The correct answer is C) Over-commitment by the team. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q055",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "In the INVEST quality factors, \"Independent\" means:",
    "options": [
      "Stories are huge",
      "Reduce dependencies between stories",
      "Stories are hidden",
      "Stories depend on each other"
    ],
    "correctAnswer": "Reduce dependencies between stories",
    "explanation": "The correct answer is B) Reduce dependencies between stories. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q056",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "\"Negotiable\" in user stories means:",
    "options": [
      "Stories are contracts",
      "Stories cannot change",
      "Finer details can be filled in later",
      "Stories are fixed"
    ],
    "correctAnswer": "Finer details can be filled in later",
    "explanation": "The correct answer is C) Finer details can be filled in later. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q057",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Agile best practices recommend migration to Agile methodologies to be:",
    "options": [
      "Only by management order",
      "Forced overnight",
      "Never",
      "Steady and gradual"
    ],
    "correctAnswer": "Steady and gradual",
    "explanation": "The correct answer is D) Steady and gradual. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q058",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Under Agile best practices, the length of each iteration should be:",
    "options": [
      "The same",
      "Different each time",
      "Random",
      "Doubled"
    ],
    "correctAnswer": "The same",
    "explanation": "The correct answer is A) The same. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q059",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Under Agile, project value is gauged by:",
    "options": [
      "Budget and schedule",
      "Lines of code",
      "Customer feedback and return on investment",
      "Team size"
    ],
    "correctAnswer": "Customer feedback and return on investment",
    "explanation": "The correct answer is C) Customer feedback and return on investment. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s11_q060",
    "category": "Agile and DevOps",
    "session": 11,
    "sessionTitle": "Agile Process Models - II",
    "questionText": "Agile jargon recommends replacing \"requirements\" with:",
    "options": [
      "Specifications",
      "Contracts",
      "User stories",
      "Documents"
    ],
    "correctAnswer": "User stories",
    "explanation": "The correct answer is C) User stories. (Agile Process Models - II)"
  },
  {
    "id": "agile_devops_s12_q001",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "One of the most critical factors for project success is:",
    "options": [
      "The office location",
      "The SDLC methodology used",
      "The programming font",
      "The team colour"
    ],
    "correctAnswer": "The SDLC methodology used",
    "explanation": "The correct answer is B) The SDLC methodology used. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q002",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Choosing an inappropriate SDLC can expose a project to the risk of:",
    "options": [
      "Damage to software quality, budget overruns and hampered PM best practices",
      "Faster delivery only",
      "No risk",
      "Better quality"
    ],
    "correctAnswer": "Damage to software quality, budget overruns and hampered PM best practices",
    "explanation": "The correct answer is A) Damage to software quality, budget overruns and hampered PM best practices. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q003",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Because characteristics of more than one SDLC may suit a project, often:",
    "options": [
      "The oldest is used",
      "Only one is allowed",
      "A mix of two or more methodologies is chosen",
      "None is used"
    ],
    "correctAnswer": "A mix of two or more methodologies is chosen",
    "explanation": "The correct answer is C) A mix of two or more methodologies is chosen. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q004",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the screwdriver toolkit analogy, the \"screws\" represent:",
    "options": [
      "Project requirements",
      "The customer",
      "The team",
      "The SDLC"
    ],
    "correctAnswer": "Project requirements",
    "explanation": "The correct answer is A) Project requirements. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q005",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the screwdriver toolkit analogy, the \"driver\" remains the same, meaning:",
    "options": [
      "The team never changes",
      "The customer never changes",
      "The project never changes",
      "The base process/tooling stays while the choice changes by requirement"
    ],
    "correctAnswer": "The base process/tooling stays while the choice changes by requirement",
    "explanation": "The correct answer is D) The base process/tooling stays while the choice changes by requirement. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q006",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Which factor should be considered while selecting an SDLC?",
    "options": [
      "Brand colour",
      "Nature of the product (new product or new feature)",
      "Office furniture",
      "Parking space"
    ],
    "correctAnswer": "Nature of the product (new product or new feature)",
    "explanation": "The correct answer is B) Nature of the product (new product or new feature). (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q007",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Which is NOT a listed parameter for selecting an SDLC?",
    "options": [
      "Size and resource availability",
      "Team composition and location",
      "Simplicity of the data in the project",
      "Complexity of functionalities"
    ],
    "correctAnswer": "Simplicity of the data in the project",
    "explanation": "The correct answer is C) Simplicity of the data in the project. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q008",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Team composition and location matters because teams may be:",
    "options": [
      "None",
      "In-house or geographically spread",
      "Always local",
      "Always remote"
    ],
    "correctAnswer": "In-house or geographically spread",
    "explanation": "The correct answer is B) In-house or geographically spread. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q009",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Work atmosphere and culture matters because Agile emphasizes:",
    "options": [
      "Documentation",
      "Contracts",
      "Silos",
      "Teamwork"
    ],
    "correctAnswer": "Teamwork",
    "explanation": "The correct answer is D) Teamwork. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q010",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "SDLC models and practices should align with:",
    "options": [
      "Personal choices",
      "Competitors only",
      "Business objectives of the organization",
      "Market rumours"
    ],
    "correctAnswer": "Business objectives of the organization",
    "explanation": "The correct answer is C) Business objectives of the organization. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q011",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "The Waterfall model follows a:",
    "options": [
      "Spiral path",
      "Random design",
      "Sequential design with a steady downward trend",
      "Iterative loop"
    ],
    "correctAnswer": "Sequential design with a steady downward trend",
    "explanation": "The correct answer is C) Sequential design with a steady downward trend. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q012",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "The Waterfall model was adopted from which industries?",
    "options": [
      "Construction and manufacturing",
      "Healthcare",
      "Retail",
      "Aviation only"
    ],
    "correctAnswer": "Construction and manufacturing",
    "explanation": "The correct answer is A) Construction and manufacturing. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q013",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Agile methods propose alternatives to:",
    "options": [
      "Programming languages",
      "Hardware",
      "Databases",
      "Traditional project management"
    ],
    "correctAnswer": "Traditional project management",
    "explanation": "The correct answer is D) Traditional project management. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q014",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Agile approaches are typically used to help businesses respond to:",
    "options": [
      "Stable markets",
      "Unpredictability",
      "Certainty",
      "Regulations"
    ],
    "correctAnswer": "Unpredictability",
    "explanation": "The correct answer is B) Unpredictability. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q015",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, the important components are designed first so that the customer can:",
    "options": [
      "Never change",
      "Alter requirements without affecting progress",
      "Sign contracts",
      "Reject the project"
    ],
    "correctAnswer": "Alter requirements without affecting progress",
    "explanation": "The correct answer is B) Alter requirements without affecting progress. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q016",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, a detailed plan is drawn up at the:",
    "options": [
      "Customer's request only",
      "End",
      "Middle",
      "Start accounting for every detail"
    ],
    "correctAnswer": "Start accounting for every detail",
    "explanation": "The correct answer is D) Start accounting for every detail. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q017",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, the customer's team is:",
    "options": [
      "Only at the end",
      "Involved and works hand-in-hand with the development team",
      "Only at start",
      "Absent"
    ],
    "correctAnswer": "Involved and works hand-in-hand with the development team",
    "explanation": "The correct answer is B) Involved and works hand-in-hand with the development team. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q018",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, the development team works:",
    "options": [
      "Independently with barely any customer involvement",
      "With constant customer input",
      "In pairs",
      "In sprints"
    ],
    "correctAnswer": "Independently with barely any customer involvement",
    "explanation": "The correct answer is A) Independently with barely any customer involvement. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q019",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, each iteration is executed in:",
    "options": [
      "Two to four days",
      "Two to four weeks",
      "Two to four months",
      "Two to four years"
    ],
    "correctAnswer": "Two to four weeks",
    "explanation": "The correct answer is B) Two to four weeks. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q020",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, development is divided into:",
    "options": [
      "Iterations",
      "Sprints",
      "Phases",
      "Cycles"
    ],
    "correctAnswer": "Phases",
    "explanation": "The correct answer is C) Phases. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q021",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, testing is:",
    "options": [
      "Incorporated into each iteration",
      "Done by customers",
      "Skipped",
      "A separate final phase"
    ],
    "correctAnswer": "Incorporated into each iteration",
    "explanation": "The correct answer is A) Incorporated into each iteration. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q022",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, testing is:",
    "options": [
      "In each sprint",
      "Continuous",
      "Skipped",
      "A phase following development"
    ],
    "correctAnswer": "A phase following development",
    "explanation": "The correct answer is D) A phase following development. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q023",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, features are delivered:",
    "options": [
      "Each time an iteration ends",
      "All at once at the end",
      "Quarterly",
      "Never"
    ],
    "correctAnswer": "Each time an iteration ends",
    "explanation": "The correct answer is A) Each time an iteration ends. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q024",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, features are delivered:",
    "options": [
      "Weekly",
      "Every iteration",
      "Daily",
      "All at once to the client"
    ],
    "correctAnswer": "All at once to the client",
    "explanation": "The correct answer is D) All at once to the client. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q025",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, changes require:",
    "options": [
      "No effort",
      "Small edits",
      "Only documentation",
      "Re-doing the entire implementation phase"
    ],
    "correctAnswer": "Re-doing the entire implementation phase",
    "explanation": "The correct answer is D) Re-doing the entire implementation phase. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q026",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Agile gives precedence to:",
    "options": [
      "Documentation",
      "Software development",
      "Contracts",
      "Planning"
    ],
    "correctAnswer": "Software development",
    "explanation": "The correct answer is B) Software development. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q027",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Documentation in Agile is more like:",
    "options": [
      "A handbook that is easy to understand",
      "A contract",
      "A dissertation",
      "A formal legal document"
    ],
    "correctAnswer": "A handbook that is easy to understand",
    "explanation": "The correct answer is A) A handbook that is easy to understand. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q028",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, documentation is:",
    "options": [
      "Informal",
      "A vital part of the process",
      "Skipped",
      "Optional"
    ],
    "correctAnswer": "A vital part of the process",
    "explanation": "The correct answer is B) A vital part of the process. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q029",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, calculating development time for large projects is:",
    "options": [
      "A challenge",
      "Not required",
      "Fixed",
      "Easy"
    ],
    "correctAnswer": "A challenge",
    "explanation": "The correct answer is A) A challenge. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q030",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, the release date:",
    "options": [
      "Is flexible",
      "Can be calculated for all projects from the detailed plan",
      "Is random",
      "Can't be calculated"
    ],
    "correctAnswer": "Can be calculated for all projects from the detailed plan",
    "explanation": "The correct answer is B) Can be calculated for all projects from the detailed plan. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q031",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the Prescient Software case study, the electric project used:",
    "options": [
      "The Waterfall approach",
      "RAD",
      "The Agile approach",
      "XP"
    ],
    "correctAnswer": "The Waterfall approach",
    "explanation": "The correct answer is A) The Waterfall approach. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q032",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the case study, the gas project used:",
    "options": [
      "The Waterfall approach",
      "An Agile approach",
      "V-model",
      "Spiral"
    ],
    "correctAnswer": "An Agile approach",
    "explanation": "The correct answer is B) An Agile approach. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q033",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the electric (Waterfall) project, the customer was involved only during:",
    "options": [
      "Requirements",
      "User Acceptance Test",
      "Design",
      "Coding"
    ],
    "correctAnswer": "User Acceptance Test",
    "explanation": "The correct answer is B) User Acceptance Test. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q034",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "A shortfall in the electric project was:",
    "options": [
      "High customer involvement",
      "Lower cost",
      "A huge gap between estimated and actual delivery date",
      "Early delivery"
    ],
    "correctAnswer": "A huge gap between estimated and actual delivery date",
    "explanation": "The correct answer is C) A huge gap between estimated and actual delivery date. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q035",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the gas project, the team hit rough spots because:",
    "options": [
      "The logic was complex and did not match test cases",
      "There was no team",
      "The customer disappeared",
      "There was no budget"
    ],
    "correctAnswer": "The logic was complex and did not match test cases",
    "explanation": "The correct answer is A) The logic was complex and did not match test cases. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q036",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Which iteration was chosen for in-depth study in the gas project?",
    "options": [
      "Tenth",
      "Third",
      "Seventh",
      "First"
    ],
    "correctAnswer": "Seventh",
    "explanation": "The correct answer is C) Seventh. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q037",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "The field engineers reduced the pseudo-code from 800 lines to:",
    "options": [
      "100 lines",
      "400 lines",
      "200 lines",
      "50 lines"
    ],
    "correctAnswer": "200 lines",
    "explanation": "The correct answer is C) 200 lines. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q038",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the gas project, developers were given:",
    "options": [
      "One month",
      "No break",
      "Two weeks' time off",
      "One day"
    ],
    "correctAnswer": "Two weeks' time off",
    "explanation": "The correct answer is C) Two weeks' time off. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q039",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "The gas project was finally delivered:",
    "options": [
      "Never",
      "Late",
      "Over budget",
      "Before the deadline and within estimated budget"
    ],
    "correctAnswer": "Before the deadline and within estimated budget",
    "explanation": "The correct answer is D) Before the deadline and within estimated budget. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q040",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "The gas project's success was credited to:",
    "options": [
      "Hardware",
      "Luck",
      "The size of the team",
      "The Agile training team and the decision to regroup"
    ],
    "correctAnswer": "The Agile training team and the decision to regroup",
    "explanation": "The correct answer is D) The Agile training team and the decision to regroup. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q041",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Which models in Table 12.2 are compared?",
    "options": [
      "Only RAD and DSDM",
      "Only Scrum and XP",
      "Waterfall, V-Model, Prototype, Incremental, Spiral, RAD",
      "Only Waterfall and Agile"
    ],
    "correctAnswer": "Waterfall, V-Model, Prototype, Incremental, Spiral, RAD",
    "explanation": "The correct answer is C) Waterfall, V-Model, Prototype, Incremental, Spiral, RAD. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q042",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the comparison table, which model has requirements that are \"not well understood\" at the beginning?",
    "options": [
      "Prototype",
      "Spiral",
      "Waterfall",
      "V-Model"
    ],
    "correctAnswer": "Prototype",
    "explanation": "The correct answer is A) Prototype. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q043",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In the comparison table, which model is characterized by low cost?",
    "options": [
      "Waterfall",
      "Spiral",
      "Prototype",
      "V-Model"
    ],
    "correctAnswer": "Waterfall",
    "explanation": "The correct answer is A) Waterfall. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q044",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Which model in the table has risk analysis performed?",
    "options": [
      "Waterfall",
      "Spiral",
      "RAD",
      "Prototype"
    ],
    "correctAnswer": "Spiral",
    "explanation": "The correct answer is B) Spiral. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q045",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, the entire responsibility of the project lies with:",
    "options": [
      "Only the dev team",
      "Only the tester",
      "The whole team along with the customer",
      "Only the manager"
    ],
    "correctAnswer": "The whole team along with the customer",
    "explanation": "The correct answer is C) The whole team along with the customer. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q046",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Waterfall, a problem can occur if:",
    "options": [
      "The customer participates",
      "The plan is flexible",
      "Testing is early",
      "Inaccurate or inadequate information was provided while drafting the plan"
    ],
    "correctAnswer": "Inaccurate or inadequate information was provided while drafting the plan",
    "explanation": "The correct answer is D) Inaccurate or inadequate information was provided while drafting the plan. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q047",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "In Agile, detection of incorrect documentation can be done:",
    "options": [
      "Never",
      "Later",
      "Only at the end",
      "Sooner"
    ],
    "correctAnswer": "Sooner",
    "explanation": "The correct answer is D) Sooner. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q048",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "According to Agile vs. Waterfall, regression testing before deployment is enabled by testing in:",
    "options": [
      "The maintenance phase",
      "The design phase",
      "The final phase",
      "Each iteration"
    ],
    "correctAnswer": "Each iteration",
    "explanation": "The correct answer is D) Each iteration. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q049",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Waterfall requires the entire software to be assembled before:",
    "options": [
      "Verification can be carried out",
      "Requirements",
      "Planning",
      "Design"
    ],
    "correctAnswer": "Verification can be carried out",
    "explanation": "The correct answer is A) Verification can be carried out. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q050",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "Agile focuses less on documentation and more on:",
    "options": [
      "Active participation and discussion among the team",
      "Heavy plans",
      "Phase gates",
      "Contracts"
    ],
    "correctAnswer": "Active participation and discussion among the team",
    "explanation": "The correct answer is A) Active participation and discussion among the team. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s12_q051",
    "category": "Agile and DevOps",
    "session": 12,
    "sessionTitle": "Comparing Agile with Traditional Models",
    "questionText": "All SDLC methodologies:",
    "options": [
      "Are obsolete",
      "Have their advantages and disadvantages",
      "Are identical",
      "Are perfect"
    ],
    "correctAnswer": "Have their advantages and disadvantages",
    "explanation": "The correct answer is B) Have their advantages and disadvantages. (Comparing Agile with Traditional Models)"
  },
  {
    "id": "agile_devops_s13_q001",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "DevOps stands for:",
    "options": [
      "Design and Operations",
      "Deployment and Optimization",
      "Development and Operations",
      "Development and Orchestration"
    ],
    "correctAnswer": "Development and Operations",
    "explanation": "The correct answer is C) Development and Operations. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q002",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "DevOps refers to the common practices and rules followed by:",
    "options": [
      "Only users",
      "Only managers",
      "Software developers and IT professionals while communicating",
      "Only testers"
    ],
    "correctAnswer": "Software developers and IT professionals while communicating",
    "explanation": "The correct answer is C) Software developers and IT professionals while communicating. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q003",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "How many values does DevOps have?",
    "options": [
      "Six",
      "Five",
      "Four",
      "Three"
    ],
    "correctAnswer": "Four",
    "explanation": "The correct answer is C) Four. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q004",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The four DevOps values are:",
    "options": [
      "Plan, Build, Test, Deploy",
      "Speed, Quality, Cost, Scope",
      "People, Process, Tools, Cost",
      "Culture, Automation, Measurement, Sharing"
    ],
    "correctAnswer": "Culture, Automation, Measurement, Sharing",
    "explanation": "The correct answer is D) Culture, Automation, Measurement, Sharing. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q005",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Which is a DevOps principle?",
    "options": [
      "Manual deployments",
      "Testing at the end only",
      "The entire product cycle should be automated",
      "Teams work in silos"
    ],
    "correctAnswer": "The entire product cycle should be automated",
    "explanation": "The correct answer is C) The entire product cycle should be automated. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q006",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In DevOps, software is developed and tested in:",
    "options": [
      "An isolated lab",
      "A developer laptop only",
      "A production-similar environment",
      "A sandbox only"
    ],
    "correctAnswer": "A production-similar environment",
    "explanation": "The correct answer is C) A production-similar environment. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q007",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In DevOps, each module is:",
    "options": [
      "Tested at the end",
      "Never tested",
      "Tested by customer",
      "Continuously tested for quality and output"
    ],
    "correctAnswer": "Continuously tested for quality and output",
    "explanation": "The correct answer is D) Continuously tested for quality and output. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q008",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In DevOps, developers are expected to:",
    "options": [
      "Try to fix issues on their own rather than depending on others",
      "Ignore issues",
      "Always wait for ops",
      "Hand off all issues"
    ],
    "correctAnswer": "Try to fix issues on their own rather than depending on others",
    "explanation": "The correct answer is A) Try to fix issues on their own rather than depending on others. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q009",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "An effective way to reduce deployment errors is to:",
    "options": [
      "Perform smaller deployments frequently",
      "Skip deployments",
      "Perform large deployments rarely",
      "Deploy manually"
    ],
    "correctAnswer": "Perform smaller deployments frequently",
    "explanation": "The correct answer is A) Perform smaller deployments frequently. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q010",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Without DevOps, manual deployment and lack of automated testing can lead to:",
    "options": [
      "Technical debt and loss of coordination",
      "Higher quality",
      "Faster delivery",
      "No issues"
    ],
    "correctAnswer": "Technical debt and loss of coordination",
    "explanation": "The correct answer is A) Technical debt and loss of coordination. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q011",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Organizations using DevOps typically have:",
    "options": [
      "No change",
      "Great performance and profitability compared to those that do not",
      "Slower growth",
      "Lower profit"
    ],
    "correctAnswer": "Great performance and profitability compared to those that do not",
    "explanation": "The correct answer is B) Great performance and profitability compared to those that do not. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q012",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Moving toward DevOps is a:",
    "options": [
      "Impossible one",
      "Smooth and gradual process",
      "Instant",
      "Overnight switch"
    ],
    "correctAnswer": "Smooth and gradual process",
    "explanation": "The correct answer is B) Smooth and gradual process. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q013",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Culture\" challenge in DevOps suggests DevOps should be treated as:",
    "options": [
      "A sudden change",
      "A revolution",
      "A trend",
      "An evolution rather than a revolution"
    ],
    "correctAnswer": "An evolution rather than a revolution",
    "explanation": "The correct answer is D) An evolution rather than a revolution. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q014",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "To adopt DevOps gradually, organizations should:",
    "options": [
      "Replace all teams",
      "Apply to the entire model at once",
      "Remodel a small product of an existing application first",
      "Avoid pilots"
    ],
    "correctAnswer": "Remodel a small product of an existing application first",
    "explanation": "The correct answer is C) Remodel a small product of an existing application first. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q015",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Test Automation\" practice in DevOps means testing:",
    "options": [
      "Continuously",
      "Once",
      "Only manually",
      "Rarely"
    ],
    "correctAnswer": "Continuously",
    "explanation": "The correct answer is A) Continuously. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q016",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Legacy systems\" challenge suggests moving toward:",
    "options": [
      "Newer microservices",
      "Older infrastructure",
      "Manual systems",
      "More mainframes"
    ],
    "correctAnswer": "Newer microservices",
    "explanation": "The correct answer is A) Newer microservices. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q017",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"App complexity\" challenge arises because Dev and Ops use:",
    "options": [
      "Completely separate toolsets and metrics",
      "No tools",
      "Identical metrics",
      "The same tools"
    ],
    "correctAnswer": "Completely separate toolsets and metrics",
    "explanation": "The correct answer is A) Completely separate toolsets and metrics. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q018",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Organizations without a DevOps plan should first create:",
    "options": [
      "A clear plan with project milestones and well-defined deliverables",
      "A budget only",
      "A tool list",
      "Nothing"
    ],
    "correctAnswer": "A clear plan with project milestones and well-defined deliverables",
    "explanation": "The correct answer is A) A clear plan with project milestones and well-defined deliverables. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q019",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "To manage environments for DevOps, organizations can use:",
    "options": [
      "Paper",
      "Only physical servers",
      "Cloud sandboxes and other tools",
      "Spreadsheets"
    ],
    "correctAnswer": "Cloud sandboxes and other tools",
    "explanation": "The correct answer is C) Cloud sandboxes and other tools. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q020",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Tools\" challenge says to avoid:",
    "options": [
      "A fragmented toolset",
      "Cloud",
      "Open source",
      "Automation"
    ],
    "correctAnswer": "A fragmented toolset",
    "explanation": "The correct answer is A) A fragmented toolset. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q021",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Executive support\" challenge suggests:",
    "options": [
      "Ignoring management",
      "Reducing funds",
      "Avoiding meetings",
      "Seminars and presentations about DevOps benefits"
    ],
    "correctAnswer": "Seminars and presentations about DevOps benefits",
    "explanation": "The correct answer is D) Seminars and presentations about DevOps benefits. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q022",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Handovers between teams cause:",
    "options": [
      "Expense and delay in the project timeline",
      "No effect",
      "Faster delivery",
      "Lower cost"
    ],
    "correctAnswer": "Expense and delay in the project timeline",
    "explanation": "The correct answer is A) Expense and delay in the project timeline. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q023",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The implementation of different DevOps practices is known as a:",
    "options": [
      "Anti-pattern",
      "Protocol",
      "Template",
      "Pattern"
    ],
    "correctAnswer": "Pattern",
    "explanation": "The correct answer is D) Pattern. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q024",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "How many areas does the basic DevOps pattern have in the text?",
    "options": [
      "Two",
      "Three",
      "Five",
      "Four"
    ],
    "correctAnswer": "Four",
    "explanation": "The correct answer is D) Four. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q025",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Which is a DevOps pattern area?",
    "options": [
      "Reduce testing",
      "Remove monitoring",
      "Extend delivery to production",
      "Delay releases"
    ],
    "correctAnswer": "Extend delivery to production",
    "explanation": "The correct answer is C) Extend delivery to production. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q026",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Which is a DevOps pattern area?",
    "options": [
      "Hide ops data",
      "Skip planning",
      "Isolate ops",
      "Embed Operations knowledge into project"
    ],
    "correctAnswer": "Embed Operations knowledge into project",
    "explanation": "The correct answer is D) Embed Operations knowledge into project. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q027",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Agile software development involves:",
    "options": [
      "Heavy documentation",
      "Collaborative discussion among business units and building the product simultaneously",
      "Isolated teams",
      "Sequential phases"
    ],
    "correctAnswer": "Collaborative discussion among business units and building the product simultaneously",
    "explanation": "The correct answer is B) Collaborative discussion among business units and building the product simultaneously. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q028",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In Agile, each module is:",
    "options": [
      "Tested before it is finalized",
      "Tested only at the end",
      "Tested only in production",
      "Never tested"
    ],
    "correctAnswer": "Tested before it is finalized",
    "explanation": "The correct answer is A) Tested before it is finalized. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q029",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In the Agile methodology, interaction among teams to create product increments is termed:",
    "options": [
      "Release",
      "Sprint",
      "Kanban",
      "Scrum"
    ],
    "correctAnswer": "Scrum",
    "explanation": "The correct answer is D) Scrum. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q030",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "A series of iterations in Scrum are called:",
    "options": [
      "Sprints",
      "Epics",
      "Phases",
      "Releases"
    ],
    "correctAnswer": "Sprints",
    "explanation": "The correct answer is A) Sprints. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q031",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "A typical Scrum team consists of:",
    "options": [
      "50+",
      "One to two people",
      "Five to nine people",
      "20-30 people"
    ],
    "correctAnswer": "Five to nine people",
    "explanation": "The correct answer is C) Five to nine people. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q032",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In a Scrum team, members are:",
    "options": [
      "Divided into BA, Dev, QA",
      "Introduced by hierarchy",
      "Not introduced by roles; no one is superior or inferior",
      "Ranked"
    ],
    "correctAnswer": "Not introduced by roles; no one is superior or inferior",
    "explanation": "The correct answer is C) Not introduced by roles; no one is superior or inferior. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q033",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Who knows the exact output of the product as per end users and customers?",
    "options": [
      "Tester",
      "Scrum master",
      "Developer",
      "Product owner"
    ],
    "correctAnswer": "Product owner",
    "explanation": "The correct answer is D) Product owner. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q034",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Who ensures that the Scrum team is productive and follows the process?",
    "options": [
      "Customer",
      "Product owner",
      "Tester",
      "Scrum master"
    ],
    "correctAnswer": "Scrum master",
    "explanation": "The correct answer is D) Scrum master. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q035",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The product backlog lists:",
    "options": [
      "Defects",
      "Costs",
      "Expected output and features of the product",
      "Tasks for a sprint"
    ],
    "correctAnswer": "Expected output and features of the product",
    "explanation": "The correct answer is C) Expected output and features of the product. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q036",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The sprint backlog lists:",
    "options": [
      "Tasks to be completed in a sprint",
      "Costs",
      "Bugs",
      "All product features"
    ],
    "correctAnswer": "Tasks to be completed in a sprint",
    "explanation": "The correct answer is A) Tasks to be completed in a sprint. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q037",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Who arranges the sprint planning meeting?",
    "options": [
      "Developers",
      "Product owner",
      "Customer",
      "Scrum master"
    ],
    "correctAnswer": "Product owner",
    "explanation": "The correct answer is B) Product owner. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q038",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In sprint planning, the selected tasks are moved from:",
    "options": [
      "Release to backlog",
      "Sprint backlog to product backlog",
      "Defects to backlog",
      "Product backlog to sprint backlog"
    ],
    "correctAnswer": "Product backlog to sprint backlog",
    "explanation": "The correct answer is D) Product backlog to sprint backlog. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q039",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In the daily scrum, members brief about:",
    "options": [
      "What they completed yesterday and what they will do today",
      "Contracts",
      "Marketing",
      "Cost"
    ],
    "correctAnswer": "What they completed yesterday and what they will do today",
    "explanation": "The correct answer is A) What they completed yesterday and what they will do today. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q040",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The sprint review meeting is called informal because:",
    "options": [
      "It is optional",
      "It is online only",
      "No one attends",
      "Team members do not prepare a formal presentation"
    ],
    "correctAnswer": "Team members do not prepare a formal presentation",
    "explanation": "The correct answer is D) Team members do not prepare a formal presentation. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q041",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "In the sprint retrospective, the members discuss:",
    "options": [
      "Budget only",
      "Contracts",
      "Progress, issues faced and ideas to avoid them in future sprints",
      "Hiring"
    ],
    "correctAnswer": "Progress, issues faced and ideas to avoid them in future sprints",
    "explanation": "The correct answer is C) Progress, issues faced and ideas to avoid them in future sprints. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q042",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Lean is a practice that focuses on:",
    "options": [
      "Delaying delivery",
      "Adding documents",
      "Value creation by removing waste and non-value-adding factors",
      "Increasing meetings"
    ],
    "correctAnswer": "Value creation by removing waste and non-value-adding factors",
    "explanation": "The correct answer is C) Value creation by removing waste and non-value-adding factors. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q043",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Lean became popular after being implemented by:",
    "options": [
      "Honda",
      "Toyota",
      "Boeing",
      "Ford"
    ],
    "correctAnswer": "Toyota",
    "explanation": "The correct answer is B) Toyota. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q044",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "SCM stands for:",
    "options": [
      "Software Configuration Management",
      "Software Code Maintenance",
      "Source Control Monitor",
      "System Change Manager"
    ],
    "correctAnswer": "Software Configuration Management",
    "explanation": "The correct answer is A) Software Configuration Management. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q045",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "SCM is used to:",
    "options": [
      "Test code",
      "Write code",
      "Control software development changes",
      "Deploy code"
    ],
    "correctAnswer": "Control software development changes",
    "explanation": "The correct answer is C) Control software development changes. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q046",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "SCM can track:",
    "options": [
      "Only costs",
      "Who made changes and where",
      "Nothing",
      "Only dates"
    ],
    "correctAnswer": "Who made changes and where",
    "explanation": "The correct answer is B) Who made changes and where. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q047",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Which is a function of SCM?",
    "options": [
      "Identifies the software product components to be controlled",
      "Writes tests",
      "Deploys code",
      "Hires developers"
    ],
    "correctAnswer": "Identifies the software product components to be controlled",
    "explanation": "The correct answer is A) Identifies the software product components to be controlled. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q048",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "SCM ensures developers use:",
    "options": [
      "Any version",
      "The most recent version of the software product",
      "The oldest version",
      "A random version"
    ],
    "correctAnswer": "The most recent version of the software product",
    "explanation": "The correct answer is B) The most recent version of the software product. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q049",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "SCM's status accounting and audit feature gives:",
    "options": [
      "User manuals",
      "Management a clear view of the software product",
      "Budget estimates",
      "Test results only"
    ],
    "correctAnswer": "Management a clear view of the software product",
    "explanation": "The correct answer is B) Management a clear view of the software product. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q050",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "A version control system is:",
    "options": [
      "A web server",
      "A database of source code files with monitored access",
      "A tool for UI design",
      "A compiler"
    ],
    "correctAnswer": "A database of source code files with monitored access",
    "explanation": "The correct answer is B) A database of source code files with monitored access. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q051",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Version control systems enable developers to:",
    "options": [
      "Only write code",
      "Reverse changes and compare different versions",
      "Only plan",
      "Only deploy"
    ],
    "correctAnswer": "Reverse changes and compare different versions",
    "explanation": "The correct answer is B) Reverse changes and compare different versions. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q052",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Version control ensures who can update source code?",
    "options": [
      "Only customers",
      "Nobody",
      "Only authorized users/committers",
      "Anyone"
    ],
    "correctAnswer": "Only authorized users/committers",
    "explanation": "The correct answer is C) Only authorized users/committers. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q053",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "The \"Coordinating Teams\" benefit of version control means:",
    "options": [
      "Developers can't edit",
      "Developers share one copy",
      "No conflict handling",
      "Each developer works on a copy and conflicts are flagged"
    ],
    "correctAnswer": "Each developer works on a copy and conflicts are flagged",
    "explanation": "The correct answer is D) Each developer works on a copy and conflicts are flagged. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q054",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "\"Due diligence\" in version control provides information about:",
    "options": [
      "Tests",
      "Budget",
      "Ownership of a file and who changed it and when",
      "Defects"
    ],
    "correctAnswer": "Ownership of a file and who changed it and when",
    "explanation": "The correct answer is C) Ownership of a file and who changed it and when. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q055",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Release management is used to:",
    "options": [
      "Hire teams",
      "Estimate cost",
      "Write code",
      "Plan and manage the release of builds"
    ],
    "correctAnswer": "Plan and manage the release of builds",
    "explanation": "The correct answer is D) Plan and manage the release of builds. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q056",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Agile adoption disrupts:",
    "options": [
      "Hardware",
      "Application release processes",
      "Naming rules",
      "Coding standards"
    ],
    "correctAnswer": "Application release processes",
    "explanation": "The correct answer is B) Application release processes. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q057",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Artifacts in software development are:",
    "options": [
      "Smaller products like use cases, models, design documents and builds",
      "Only meetings",
      "Only people",
      "Only code"
    ],
    "correctAnswer": "Smaller products like use cases, models, design documents and builds",
    "explanation": "The correct answer is A) Smaller products like use cases, models, design documents and builds. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q058",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Artifacts help describe the function, architecture and:",
    "options": [
      "Marketing",
      "Design of software",
      "Hardware cost",
      "Licenses"
    ],
    "correctAnswer": "Design of software",
    "explanation": "The correct answer is B) Design of software. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q059",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Symbolic artifacts are also called:",
    "options": [
      "Paper Models",
      "Golden Plans",
      "Silver Charts",
      "Illuminated Scrolls"
    ],
    "correctAnswer": "Illuminated Scrolls",
    "explanation": "The correct answer is D) Illuminated Scrolls. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s13_q060",
    "category": "Agile and DevOps",
    "session": 13,
    "sessionTitle": "Introduction to DevOps and Configuration Management",
    "questionText": "Practical artifacts are:",
    "options": [
      "Shown only to sponsors",
      "Maintained throughout the project",
      "Discarded at start",
      "Never used"
    ],
    "correctAnswer": "Maintained throughout the project",
    "explanation": "The correct answer is B) Maintained throughout the project. (Introduction to DevOps and Configuration Management)"
  },
  {
    "id": "agile_devops_s14_q001",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Integration (CI) is a practice that helps developers:",
    "options": [
      "Integrate their code into the repository multiple times a day",
      "Deploy manually",
      "Avoid committing",
      "Integrate code once a month"
    ],
    "correctAnswer": "Integrate their code into the repository multiple times a day",
    "explanation": "The correct answer is A) Integrate their code into the repository multiple times a day. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q002",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In CI, if developer A works offline until the end and developer B commits earlier, then A will:",
    "options": [
      "Skip testing",
      "Always be up to date",
      "Be working on an old version while the repository has the latest",
      "Have no conflict"
    ],
    "correctAnswer": "Be working on an old version while the repository has the latest",
    "explanation": "The correct answer is C) Be working on an old version while the repository has the latest. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q003",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "A key advantage of CI is that developers can:",
    "options": [
      "Skip commits",
      "Find out quickly where things went wrong and fix errors early",
      "Avoid testing",
      "Delay fixing errors"
    ],
    "correctAnswer": "Find out quickly where things went wrong and fix errors early",
    "explanation": "The correct answer is B) Find out quickly where things went wrong and fix errors early. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q004",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "CI can be described as:",
    "options": [
      "A deployment tool",
      "A one-time activity",
      "Continuous communication between team members",
      "A hardware setup"
    ],
    "correctAnswer": "Continuous communication between team members",
    "explanation": "The correct answer is C) Continuous communication between team members. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q005",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which CI best practice suggests preferably a single mainline per project?",
    "options": [
      "Automate the build",
      "Fix broken builds",
      "Maintain a single source repository",
      "Keep the build fast"
    ],
    "correctAnswer": "Maintain a single source repository",
    "explanation": "The correct answer is C) Maintain a single source repository. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q006",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which CI best practice automates tasks like compiling, moving files and loading schemas?",
    "options": [
      "Make build self-testing",
      "Keep build fast",
      "Automate the build",
      "Maintain a single repo"
    ],
    "correctAnswer": "Automate the build",
    "explanation": "The correct answer is C) Automate the build. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q007",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which CI practice says that if the self-test fails, the build must fail?",
    "options": [
      "Automate deployment",
      "Make your build self-testing",
      "Everyone can see",
      "Keep the build fast"
    ],
    "correctAnswer": "Make your build self-testing",
    "explanation": "The correct answer is B) Make your build self-testing. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q008",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Everyone commits to the mainline every day\" lets developers:",
    "options": [
      "Delay integration",
      "Avoid testing",
      "Know about the latest changes made to the product",
      "Hide changes"
    ],
    "correctAnswer": "Know about the latest changes made to the product",
    "explanation": "The correct answer is C) Know about the latest changes made to the product. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q009",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Each commit should build the mainline on:",
    "options": [
      "A paper form",
      "An integration machine",
      "A phone",
      "A personal laptop"
    ],
    "correctAnswer": "An integration machine",
    "explanation": "The correct answer is B) An integration machine. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q010",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "When a mainline build fails, the developer should:",
    "options": [
      "Ignore it",
      "Wait a week",
      "Fix it immediately",
      "Revert all changes"
    ],
    "correctAnswer": "Fix it immediately",
    "explanation": "The correct answer is C) Fix it immediately. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q011",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Keep the build fast\" means the build should take:",
    "options": [
      "As long as possible",
      "No time",
      "Exactly 1 hour",
      "As little time as possible"
    ],
    "correctAnswer": "As little time as possible",
    "explanation": "The correct answer is D) As little time as possible. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q012",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Test in a clone of the production environment\" helps to:",
    "options": [
      "Get a feel for the correct output of the build",
      "Save cost",
      "Avoid testing",
      "Hide errors"
    ],
    "correctAnswer": "Get a feel for the correct output of the build",
    "explanation": "The correct answer is A) Get a feel for the correct output of the build. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q013",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Make it easy for anyone to get the latest executable\" means:",
    "options": [
      "Only testers get it",
      "Nothing should be hidden from the team",
      "Only managers get it",
      "Only customers get it"
    ],
    "correctAnswer": "Nothing should be hidden from the team",
    "explanation": "The correct answer is B) Nothing should be hidden from the team. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q014",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Everyone can see what is happening\" means each team member should:",
    "options": [
      "See nothing",
      "Not see changes",
      "Have a clear picture of the system's state and review changes",
      "See only their work"
    ],
    "correctAnswer": "Have a clear picture of the system's state and review changes",
    "explanation": "The correct answer is C) Have a clear picture of the system's state and review changes. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q015",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "\"Automate deployment\" means developers get scripts that:",
    "options": [
      "Test code",
      "Delete builds",
      "Write code",
      "Easily deploy builds"
    ],
    "correctAnswer": "Easily deploy builds",
    "explanation": "The correct answer is D) Easily deploy builds. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q016",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "CD can be achieved with the help of:",
    "options": [
      "Documentation",
      "Continuous Integration",
      "Waterfall",
      "Manual deployment"
    ],
    "correctAnswer": "Continuous Integration",
    "explanation": "The correct answer is B) Continuous Integration. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q017",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In CI, developers must ensure the build is:",
    "options": [
      "Tested before uploading into the repository",
      "Deleted",
      "Rushed",
      "Untested"
    ],
    "correctAnswer": "Tested before uploading into the repository",
    "explanation": "The correct answer is A) Tested before uploading into the repository. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q018",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "A risk of CI is that:",
    "options": [
      "It needs no testing",
      "It is too slow",
      "It removes the repository",
      "Faster speed may lead to insufficient testing"
    ],
    "correctAnswer": "Faster speed may lead to insufficient testing",
    "explanation": "The correct answer is D) Faster speed may lead to insufficient testing. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q019",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Automating integration tasks ensures:",
    "options": [
      "Developers commit fewer errors",
      "More errors",
      "No tests",
      "Slower delivery"
    ],
    "correctAnswer": "Developers commit fewer errors",
    "explanation": "The correct answer is A) Developers commit fewer errors. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q020",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "The most appealing advantage of CI is:",
    "options": [
      "Less back-tracking of errors and fixing errors early",
      "More errors",
      "Higher cost",
      "More manual work"
    ],
    "correctAnswer": "Less back-tracking of errors and fixing errors early",
    "explanation": "The correct answer is A) Less back-tracking of errors and fixing errors early. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q021",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Frequent integration in CI is:",
    "options": [
      "Needed only once",
      "Impossible",
      "Not at all expensive",
      "Very expensive"
    ],
    "correctAnswer": "Not at all expensive",
    "explanation": "The correct answer is C) Not at all expensive. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q022",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Without CI, the time between integrations is:",
    "options": [
      "Constant",
      "Shorter",
      "Longer, making errors harder to identify and fix",
      "Zero"
    ],
    "correctAnswer": "Longer, making errors harder to identify and fix",
    "explanation": "The correct answer is C) Longer, making errors harder to identify and fix. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q023",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Delivery is a software development practice where developers:",
    "options": [
      "Release only manually in bulk",
      "Develop software in short periods and ensure it can be reliably released at any time",
      "Release once per year",
      "Never release"
    ],
    "correctAnswer": "Develop software in short periods and ensure it can be reliably released at any time",
    "explanation": "The correct answer is B) Develop software in short periods and ensure it can be reliably released at any time. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q024",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In CD, changes may include:",
    "options": [
      "Only bug fixes",
      "Only documentation",
      "Only new features",
      "New features, modified configuration or fixed errors"
    ],
    "correctAnswer": "New features, modified configuration or fixed errors",
    "explanation": "The correct answer is D) New features, modified configuration or fixed errors. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q025",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "While performing CD, developers must ensure that the source code:",
    "options": [
      "Is hidden",
      "Can always be deployed",
      "Is obsolete",
      "Never changes"
    ],
    "correctAnswer": "Can always be deployed",
    "explanation": "The correct answer is B) Can always be deployed. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q026",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which is a benefit of Continuous Delivery?",
    "options": [
      "Slower releases",
      "Faster time to market",
      "Lower quality",
      "Higher cost"
    ],
    "correctAnswer": "Faster time to market",
    "explanation": "The correct answer is B) Faster time to market. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q027",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Delivery ensures that software deployment is:",
    "options": [
      "Harder",
      "Costlier",
      "Easier and involves low risk",
      "Riskier"
    ],
    "correctAnswer": "Easier and involves low risk",
    "explanation": "The correct answer is C) Easier and involves low risk. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q028",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Tasks like deployment, environment provisioning and regression testing are automated in CD to:",
    "options": [
      "Increase errors",
      "Reduce delivery time",
      "Reduce quality",
      "Delay delivery"
    ],
    "correctAnswer": "Reduce delivery time",
    "explanation": "The correct answer is B) Reduce delivery time. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q029",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Due to automation of important stages, developers can achieve:",
    "options": [
      "More bugs",
      "Lower quality",
      "Higher quality",
      "No difference"
    ],
    "correctAnswer": "Higher quality",
    "explanation": "The correct answer is C) Higher quality. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q030",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In CD, the cost of finding and fixing errors early is:",
    "options": [
      "Unknown",
      "Substantially reduced",
      "Unchanged",
      "Increased"
    ],
    "correctAnswer": "Substantially reduced",
    "explanation": "The correct answer is B) Substantially reduced. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q031",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Delivery results in \"Better products\" because:",
    "options": [
      "Users provide feedback while the product is still under development",
      "Users are excluded",
      "Fewer releases",
      "No feedback"
    ],
    "correctAnswer": "Users provide feedback while the product is still under development",
    "explanation": "The correct answer is A) Users provide feedback while the product is still under development. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q032",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "CD leads to \"Happier teams\" because:",
    "options": [
      "Developers gather user feedback and work to perfect the product",
      "No releases",
      "No users",
      "Teams work overtime"
    ],
    "correctAnswer": "Developers gather user feedback and work to perfect the product",
    "explanation": "The correct answer is A) Developers gather user feedback and work to perfect the product. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q033",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In Continuous Delivery, the deployment to production is:",
    "options": [
      "Not done",
      "Fully automated",
      "Done by customer",
      "A manual process"
    ],
    "correctAnswer": "A manual process",
    "explanation": "The correct answer is D) A manual process. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q034",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Delivery doesn't complete the entire DevOps cycle because:",
    "options": [
      "It is too fast",
      "It follows a manual deployment process",
      "It has no code",
      "It has no tests"
    ],
    "correctAnswer": "It follows a manual deployment process",
    "explanation": "The correct answer is B) It follows a manual deployment process. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q035",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In Continuous Testing, developers:",
    "options": [
      "Skip tests",
      "Execute automated tests before delivering the product",
      "Test after release",
      "Test manually only"
    ],
    "correctAnswer": "Execute automated tests before delivering the product",
    "explanation": "The correct answer is B) Execute automated tests before delivering the product. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q036",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "The goal of Continuous Testing is:",
    "options": [
      "Evaluating business risk coverage and rapid feedback about business risk in the latest build",
      "Increasing cost",
      "Writing code",
      "Delaying release"
    ],
    "correctAnswer": "Evaluating business risk coverage and rapid feedback about business risk in the latest build",
    "explanation": "The correct answer is A) Evaluating business risk coverage and rapid feedback about business risk in the latest build. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q037",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Testing acts as a borderline between:",
    "options": [
      "Integration and delivery",
      "Design and test",
      "Planning and coding",
      "Release and retirement"
    ],
    "correctAnswer": "Integration and delivery",
    "explanation": "The correct answer is A) Integration and delivery. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q038",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Testing evaluates the system requirements with respect to:",
    "options": [
      "Naming",
      "Hardware",
      "Business goals",
      "Coding style"
    ],
    "correctAnswer": "Business goals",
    "explanation": "The correct answer is C) Business goals. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q039",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Testing reduces delivery time by:",
    "options": [
      "Exposing and fixing risks early",
      "Adding meetings",
      "Adding steps",
      "Skipping tests"
    ],
    "correctAnswer": "Exposing and fixing risks early",
    "explanation": "The correct answer is A) Exposing and fixing risks early. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q040",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Because tests are automated, developers can concentrate on:",
    "options": [
      "Meetings",
      "Enhancing the quality of the product",
      "Manual reviews",
      "Documentation"
    ],
    "correctAnswer": "Enhancing the quality of the product",
    "explanation": "The correct answer is B) Enhancing the quality of the product. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q041",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "The last step in CI is:",
    "options": [
      "Release",
      "Planning",
      "Deployment",
      "Integration of source code"
    ],
    "correctAnswer": "Integration of source code",
    "explanation": "The correct answer is D) Integration of source code. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q042",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In Continuous Deployment, deployment is:",
    "options": [
      "Automated",
      "Manual",
      "Done by customers",
      "Skipped"
    ],
    "correctAnswer": "Automated",
    "explanation": "The correct answer is A) Automated. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q043",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In the SDLC, the correct order of CI, CD, and Continuous Deployment is:",
    "options": [
      "Continuous Deployment, CI, CD",
      "CI, then CD, then Continuous Deployment",
      "CI, Continuous Deployment, CD",
      "CD, CI, Continuous Deployment"
    ],
    "correctAnswer": "CI, then CD, then Continuous Deployment",
    "explanation": "The correct answer is B) CI, then CD, then Continuous Deployment. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q044",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "In Continuous Delivery, the lead time to deliver a change is:",
    "options": [
      "Zero",
      "Low",
      "High",
      "Undefined"
    ],
    "correctAnswer": "High",
    "explanation": "The correct answer is C) High. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q045",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Continuous Deployment involves ______ time to deliver a change.",
    "options": [
      "More",
      "Less",
      "Equal",
      "Infinite"
    ],
    "correctAnswer": "Less",
    "explanation": "The correct answer is B) Less. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q046",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which of the following is NOT a CI best practice?",
    "options": [
      "Commit once a month",
      "Fix broken builds immediately",
      "Automate the build",
      "Keep the build fast"
    ],
    "correctAnswer": "Commit once a month",
    "explanation": "The correct answer is A) Commit once a month. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q047",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "The CI rule \"Fix broken builds immediately\" aims at:",
    "options": [
      "Adding bugs",
      "Keeping the mainline healthy",
      "Stopping builds",
      "Delaying work"
    ],
    "correctAnswer": "Keeping the mainline healthy",
    "explanation": "The correct answer is B) Keeping the mainline healthy. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q048",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Frequent integration reduces:",
    "options": [
      "Collaboration",
      "Testing",
      "Integration problems and rework",
      "Code quality"
    ],
    "correctAnswer": "Integration problems and rework",
    "explanation": "The correct answer is C) Integration problems and rework. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q049",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Version control flags a message when two developers:",
    "options": [
      "Save drafts",
      "Work on separate files",
      "Write different code",
      "Commit changes to the same code simultaneously"
    ],
    "correctAnswer": "Commit changes to the same code simultaneously",
    "explanation": "The correct answer is D) Commit changes to the same code simultaneously. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q050",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "CI helps ensure other team members can:",
    "options": [
      "Not see the changes",
      "See nothing",
      "Easily view the changes made",
      "See only old code"
    ],
    "correctAnswer": "Easily view the changes made",
    "explanation": "The correct answer is C) Easily view the changes made. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q051",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Which provides immediate feedback on business risks in the build?",
    "options": [
      "Contracts",
      "Manual tests",
      "Automated tests",
      "User guides"
    ],
    "correctAnswer": "Automated tests",
    "explanation": "The correct answer is C) Automated tests. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s14_q052",
    "category": "Agile and DevOps",
    "session": 14,
    "sessionTitle": "Continuous Integration and Delivery",
    "questionText": "Using CI, developers integrate:",
    "options": [
      "Only at release",
      "Several times a day",
      "Once a year",
      "Once a quarter"
    ],
    "correctAnswer": "Several times a day",
    "explanation": "The correct answer is B) Several times a day. (Continuous Integration and Delivery)"
  },
  {
    "id": "agile_devops_s15_q001",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Continuous Deployment, source code is:",
    "options": [
      "Deployed manually in bulk",
      "Never deployed",
      "Deployed once a year",
      "Deployed into production as soon as it is ready"
    ],
    "correctAnswer": "Deployed into production as soon as it is ready",
    "explanation": "The correct answer is D) Deployed into production as soon as it is ready. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q002",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Continuous Deployment, automated testing is performed on code in:",
    "options": [
      "No environment",
      "Only dev laptops",
      "A production-similar environment before merging into the mainline",
      "The customer's site"
    ],
    "correctAnswer": "A production-similar environment before merging into the mainline",
    "explanation": "The correct answer is C) A production-similar environment before merging into the mainline. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q003",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "After deployment, developers recheck:",
    "options": [
      "Budgets",
      "Emails",
      "Logs to see if key metrics are affected",
      "Contracts"
    ],
    "correctAnswer": "Logs to see if key metrics are affected",
    "explanation": "The correct answer is C) Logs to see if key metrics are affected. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q004",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Before Continuous Deployment, developers perform:",
    "options": [
      "Nothing",
      "Continuous Integration and Continuous Delivery",
      "Only manual testing",
      "Only planning"
    ],
    "correctAnswer": "Continuous Integration and Continuous Delivery",
    "explanation": "The correct answer is B) Continuous Integration and Continuous Delivery. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q005",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Continuous Deployment, each change goes through the pipeline and is:",
    "options": [
      "Deleted",
      "Held for manual approval",
      "Archived",
      "Automatically put into production"
    ],
    "correctAnswer": "Automatically put into production",
    "explanation": "The correct answer is D) Automatically put into production. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q006",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Continuous Delivery, developers are able to deploy frequently but:",
    "options": [
      "Cannot deploy",
      "Might choose to skip it",
      "Deploy automatically",
      "Must always deploy"
    ],
    "correctAnswer": "Might choose to skip it",
    "explanation": "The correct answer is B) Might choose to skip it. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q007",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Continuous Delivery is:",
    "options": [
      "Unrelated",
      "The first step before Continuous Deployment",
      "Same as monitoring",
      "The last step"
    ],
    "correctAnswer": "The first step before Continuous Deployment",
    "explanation": "The correct answer is B) The first step before Continuous Deployment. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q008",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Not every organization performs Continuous Deployment, but they perform Continuous Delivery because:",
    "options": [
      "It is cheaper",
      "It is mandatory",
      "It brings confidence that changes are ready when \"go\" is pressed",
      "It needs no testing"
    ],
    "correctAnswer": "It brings confidence that changes are ready when \"go\" is pressed",
    "explanation": "The correct answer is C) It brings confidence that changes are ready when \"go\" is pressed. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q009",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "If a quality error is found during automated deployment:",
    "options": [
      "The release continues",
      "The deployment is aborted and the feature rolled back",
      "The error is ignored",
      "The team quits"
    ],
    "correctAnswer": "The deployment is aborted and the feature rolled back",
    "explanation": "The correct answer is B) The deployment is aborted and the feature rolled back. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q010",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "A benefit of Continuous Deployment is:",
    "options": [
      "Higher cost",
      "Longer lead time",
      "Reduced lead time and quick return on investment",
      "Less feedback"
    ],
    "correctAnswer": "Reduced lead time and quick return on investment",
    "explanation": "The correct answer is C) Reduced lead time and quick return on investment. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q011",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA helps orchestrate:",
    "options": [
      "Only code writing",
      "Infrastructure and database updates, server configuration, rollback and packaging",
      "Only testing",
      "Only marketing"
    ],
    "correctAnswer": "Infrastructure and database updates, server configuration, rollback and packaging",
    "explanation": "The correct answer is B) Infrastructure and database updates, server configuration, rollback and packaging. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q012",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "An ARA core activity that creates a collection of deployable files is:",
    "options": [
      "Mapping",
      "Compliance",
      "Packaging",
      "Promotion"
    ],
    "correctAnswer": "Packaging",
    "explanation": "The correct answer is C) Packaging. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q013",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA activity that helps in delivery of tested builds to the next environment:",
    "options": [
      "Packaging",
      "Dependency mapping",
      "Compliance",
      "Promotion"
    ],
    "correctAnswer": "Promotion",
    "explanation": "The correct answer is D) Promotion. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q014",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA activity that documents audit trails:",
    "options": [
      "Promotion",
      "Packaging",
      "Compliance",
      "Deployment"
    ],
    "correctAnswer": "Compliance",
    "explanation": "The correct answer is C) Compliance. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q015",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA tools provide Role-Based Access Control, abbreviated as:",
    "options": [
      "RPAC",
      "ABAC",
      "RACI",
      "RBAC"
    ],
    "correctAnswer": "RBAC",
    "explanation": "The correct answer is D) RBAC. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q016",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA tools support authentication so that:",
    "options": [
      "No approvals",
      "Only authorized personnel can approve changes",
      "Anyone can approve",
      "Only customers approve"
    ],
    "correctAnswer": "Only authorized personnel can approve changes",
    "explanation": "The correct answer is B) Only authorized personnel can approve changes. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q017",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "ARA tools also provide:",
    "options": [
      "Encryption and security features",
      "Only logs",
      "No security",
      "Only UI"
    ],
    "correctAnswer": "Encryption and security features",
    "explanation": "The correct answer is A) Encryption and security features. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q018",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "A typical CD pipeline stage that creates binaries and performs unit testing is:",
    "options": [
      "Deployment automation",
      "Monitoring",
      "Build automation and continuous integration",
      "Test automation"
    ],
    "correctAnswer": "Build automation and continuous integration",
    "explanation": "The correct answer is C) Build automation and continuous integration. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q019",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In the Test Automation stage, developers check functionality, security, performance and:",
    "options": [
      "Hiring",
      "Budget",
      "Colour",
      "Compliance"
    ],
    "correctAnswer": "Compliance",
    "explanation": "The correct answer is D) Compliance. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q020",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Deployment Automation, the new version is first tested in:",
    "options": [
      "A paper model",
      "The customer's mailbox",
      "A subset of the production environment",
      "The developer's PC"
    ],
    "correctAnswer": "A subset of the production environment",
    "explanation": "The correct answer is C) A subset of the production environment. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q021",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Automated platform provisioning simplifies:",
    "options": [
      "Paper workflow",
      "Manual setup",
      "Code reviews",
      "Horizontal scalability"
    ],
    "correctAnswer": "Horizontal scalability",
    "explanation": "The correct answer is D) Horizontal scalability. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q022",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Cloud orchestration is:",
    "options": [
      "A programming language",
      "A manual process",
      "A self-service interface to manage and coordinate applications",
      "A database"
    ],
    "correctAnswer": "A self-service interface to manage and coordinate applications",
    "explanation": "The correct answer is C) A self-service interface to manage and coordinate applications. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q023",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "The term \"orchestration\" is derived from:",
    "options": [
      "A song",
      "A band",
      "A conductor who keeps instruments in tune",
      "A concert hall"
    ],
    "correctAnswer": "A conductor who keeps instruments in tune",
    "explanation": "The correct answer is C) A conductor who keeps instruments in tune. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q024",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Cloud orchestration arranges and coordinates automated tasks following:",
    "options": [
      "No workflow",
      "A manual list",
      "A consolidated workflow",
      "Random steps"
    ],
    "correctAnswer": "A consolidated workflow",
    "explanation": "The correct answer is C) A consolidated workflow. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q025",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Cloud orchestration results in:",
    "options": [
      "More manual steps",
      "Higher cost",
      "Slower delivery",
      "Reduced overall IT costs and reduced delivery time"
    ],
    "correctAnswer": "Reduced overall IT costs and reduced delivery time",
    "explanation": "The correct answer is D) Reduced overall IT costs and reduced delivery time. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q026",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Cloud orchestration is delivered by:",
    "options": [
      "A Cloud Management Platform (CMP)",
      "A debugger",
      "A compiler",
      "An IDE"
    ],
    "correctAnswer": "A Cloud Management Platform (CMP)",
    "explanation": "The correct answer is A) A Cloud Management Platform (CMP). (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q027",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "CMP stands for:",
    "options": [
      "Cloud Management Platform",
      "Central Management Process",
      "Cloud Migration Plan",
      "Cloud Monitoring Protocol"
    ],
    "correctAnswer": "Cloud Management Platform",
    "explanation": "The correct answer is A) Cloud Management Platform. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q028",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "DevOps orchestration refers to:",
    "options": [
      "Meetings",
      "Paper charts",
      "Automated tools and services that teams use to coordinate and achieve faster results",
      "Manual handovers"
    ],
    "correctAnswer": "Automated tools and services that teams use to coordinate and achieve faster results",
    "explanation": "The correct answer is C) Automated tools and services that teams use to coordinate and achieve faster results. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q029",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "DevOps teams need cloud infrastructure connected to access multiple:",
    "options": [
      "Paper files",
      "Phones",
      "Virtual Machines (VMs)",
      "Printers"
    ],
    "correctAnswer": "Virtual Machines (VMs)",
    "explanation": "The correct answer is C) Virtual Machines (VMs). (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q030",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Continuous monitoring is the process by which:",
    "options": [
      "Developers write code",
      "Testers write tests",
      "Customers pay",
      "The Ops team checks the operation of the application and ensures the test environment is stable"
    ],
    "correctAnswer": "The Ops team checks the operation of the application and ensures the test environment is stable",
    "explanation": "The correct answer is D) The Ops team checks the operation of the application and ensures the test environment is stable. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q031",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "APM is used to implement:",
    "options": [
      "Hiring",
      "Continuous Monitoring of applications in production",
      "Waterfall",
      "Planning"
    ],
    "correctAnswer": "Continuous Monitoring of applications in production",
    "explanation": "The correct answer is B) Continuous Monitoring of applications in production. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q032",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "APM monitors, analyzes and manages:",
    "options": [
      "Only on-premise",
      "Cloud, on-premise and hybrid applications and IT infrastructure",
      "Only cloud",
      "Only mobile"
    ],
    "correctAnswer": "Cloud, on-premise and hybrid applications and IT infrastructure",
    "explanation": "The correct answer is B) Cloud, on-premise and hybrid applications and IT infrastructure. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q033",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "APM helps to quickly identify:",
    "options": [
      "Only design issues",
      "Only costs",
      "The root cause of issues and prevent outages",
      "Only hiring needs"
    ],
    "correctAnswer": "The root cause of issues and prevent outages",
    "explanation": "The correct answer is C) The root cause of issues and prevent outages. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q034",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "A good practice is to start using APM solutions:",
    "options": [
      "Right from the development cycle",
      "Only after retirement",
      "Never",
      "Only after production"
    ],
    "correctAnswer": "Right from the development cycle",
    "explanation": "The correct answer is A) Right from the development cycle. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q035",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which APM feature measures performance of each web request and transaction?",
    "options": [
      "Performance of each Web request and transaction",
      "Application log data",
      "Server monitoring",
      "RUM"
    ],
    "correctAnswer": "Performance of each Web request and transaction",
    "explanation": "The correct answer is A) Performance of each Web request and transaction. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q036",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which APM feature lets developers get down to the code level to understand slow performance and errors?",
    "options": [
      "Server monitoring",
      "Code-level performance profiling",
      "Application log data",
      "RUM"
    ],
    "correctAnswer": "Code-level performance profiling",
    "explanation": "The correct answer is B) Code-level performance profiling. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q037",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which APM feature identifies problems related to server CPU and memory?",
    "options": [
      "Traces",
      "RUM",
      "Application errors",
      "Basic server monitoring and metrics"
    ],
    "correctAnswer": "Basic server monitoring and metrics",
    "explanation": "The correct answer is D) Basic server monitoring and metrics. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q038",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which APM feature monitors browser load and render time for web pages?",
    "options": [
      "Log data",
      "Custom metrics",
      "Real User Monitoring (RUM)",
      "Application errors"
    ],
    "correctAnswer": "Real User Monitoring (RUM)",
    "explanation": "The correct answer is C) Real User Monitoring (RUM). (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q039",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "RUM stands for:",
    "options": [
      "Rapid User Management",
      "Remote Usage Metrics",
      "Real Utility Monitor",
      "Real User Monitoring"
    ],
    "correctAnswer": "Real User Monitoring",
    "explanation": "The correct answer is D) Real User Monitoring. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q040",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "APM tools can track errors:",
    "options": [
      "Before customers tell them",
      "Never",
      "After customers complain",
      "Only after release"
    ],
    "correctAnswer": "Before customers tell them",
    "explanation": "The correct answer is A) Before customers tell them. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q041",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which is NOT an aspect of DevOps APM?",
    "options": [
      "Continuous security",
      "Continuous delivery",
      "Continuous documentation",
      "Continuous availability"
    ],
    "correctAnswer": "Continuous documentation",
    "explanation": "The correct answer is C) Continuous documentation. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q042",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "\"Continuous availability\" ensures that applications:",
    "options": [
      "Are sometimes available",
      "Are updated yearly",
      "Are always available and never face downtime",
      "Have no users"
    ],
    "correctAnswer": "Are always available and never face downtime",
    "explanation": "The correct answer is C) Are always available and never face downtime. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q043",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "\"Continuous security\" ensures:",
    "options": [
      "Only firewall",
      "Only passwords",
      "End-to-end code scanning and runtime event monitoring",
      "No security"
    ],
    "correctAnswer": "End-to-end code scanning and runtime event monitoring",
    "explanation": "The correct answer is C) End-to-end code scanning and runtime event monitoring. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q044",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "\"Continuous insights\" signify:",
    "options": [
      "Dynamic changes made to the application with changing customer needs",
      "Static design",
      "No change",
      "Fixed features"
    ],
    "correctAnswer": "Dynamic changes made to the application with changing customer needs",
    "explanation": "The correct answer is A) Dynamic changes made to the application with changing customer needs. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q045",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "In Traditional vs. Continuous Monitoring, continuous monitoring is required:",
    "options": [
      "Never",
      "Only at the end",
      "At each step of the software development life cycle",
      "Only at start"
    ],
    "correctAnswer": "At each step of the software development life cycle",
    "explanation": "The correct answer is C) At each step of the software development life cycle. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q046",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Monitoring development milestones helps to find out:",
    "options": [
      "Whether teams are following the process and the DevOps strategy is working",
      "Customer names",
      "Colours",
      "Salaries"
    ],
    "correctAnswer": "Whether teams are following the process and the DevOps strategy is working",
    "explanation": "The correct answer is A) Whether teams are following the process and the DevOps strategy is working. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q047",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Known vulnerabilities are listed in the:",
    "options": [
      "Network Version Directory",
      "National Vulnerability Database (NVD)",
      "National Virtual Domain",
      "National Version Database"
    ],
    "correctAnswer": "National Vulnerability Database (NVD)",
    "explanation": "The correct answer is B) National Vulnerability Database (NVD). (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q048",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Deployment monitoring involves configuring build servers to:",
    "options": [
      "Delete builds",
      "Hide errors",
      "Notify the team when something goes wrong",
      "Skip deployments"
    ],
    "correctAnswer": "Notify the team when something goes wrong",
    "explanation": "The correct answer is C) Notify the team when something goes wrong. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q049",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Server health monitoring ensures:",
    "options": [
      "Only logs",
      "Uptime and performance of the server",
      "Only emails",
      "Only costs"
    ],
    "correctAnswer": "Uptime and performance of the server",
    "explanation": "The correct answer is B) Uptime and performance of the server. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q050",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Activity monitoring tracks:",
    "options": [
      "Employee attendance",
      "Budget",
      "User activity with the application",
      "Contracts"
    ],
    "correctAnswer": "User activity with the application",
    "explanation": "The correct answer is C) User activity with the application. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q051",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "TTD stands for:",
    "options": [
      "Time To Design",
      "Time To Deploy",
      "Time To Debug",
      "Time To Detect"
    ],
    "correctAnswer": "Time To Detect",
    "explanation": "The correct answer is D) Time To Detect. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q052",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "TTM stands for:",
    "options": [
      "Time To Market",
      "Time To Measure",
      "Time To Mitigate",
      "Time To Monitor"
    ],
    "correctAnswer": "Time To Mitigate",
    "explanation": "The correct answer is C) Time To Mitigate. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q053",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "The time taken to find the root cause and ensure the issue does not reappear is:",
    "options": [
      "TTL",
      "TTR",
      "TTM",
      "TTD"
    ],
    "correctAnswer": "TTR",
    "explanation": "The correct answer is B) TTR. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q054",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "\"Validated learning\" means:",
    "options": [
      "Testing in labs",
      "Tracking usage and differences between versions to assess the impact of change",
      "Learning from books",
      "Learning without data"
    ],
    "correctAnswer": "Tracking usage and differences between versions to assess the impact of change",
    "explanation": "The correct answer is B) Tracking usage and differences between versions to assess the impact of change. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q055",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "\"Telemetry\" is:",
    "options": [
      "A language",
      "A test",
      "A deployment tool",
      "The process of collecting monitoring data"
    ],
    "correctAnswer": "The process of collecting monitoring data",
    "explanation": "The correct answer is D) The process of collecting monitoring data. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q056",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Telemetry can use agents installed in deployment environments or:",
    "options": [
      "Paper forms",
      "Manual counts",
      "Phone calls",
      "An SDK based on markers inserted into source code"
    ],
    "correctAnswer": "An SDK based on markers inserted into source code",
    "explanation": "The correct answer is D) An SDK based on markers inserted into source code. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q057",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Synthetic monitoring provides:",
    "options": [
      "Random data",
      "No data",
      "Real user data only",
      "Repeatable measurements over time"
    ],
    "correctAnswer": "Repeatable measurements over time",
    "explanation": "The correct answer is D) Repeatable measurements over time. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q058",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which of these is a continuous monitoring tool mentioned?",
    "options": [
      "Word",
      "Paint",
      "New Relic",
      "Excel"
    ],
    "correctAnswer": "New Relic",
    "explanation": "The correct answer is C) New Relic. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q059",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Which is also mentioned as a continuous monitoring/alerting tool?",
    "options": [
      "Calculator",
      "PagerDuty",
      "Notepad",
      "Photoshop"
    ],
    "correctAnswer": "PagerDuty",
    "explanation": "The correct answer is B) PagerDuty. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s15_q060",
    "category": "Agile and DevOps",
    "session": 15,
    "sessionTitle": "Continuous Deployment and Monitoring",
    "questionText": "Continuous monitoring with a Continuous Deployment release pipeline lets developers:",
    "options": [
      "Avoid deployments",
      "Detect differences in application performance after releases",
      "Remove users",
      "Hide errors"
    ],
    "correctAnswer": "Detect differences in application performance after releases",
    "explanation": "The correct answer is B) Detect differences in application performance after releases. (Continuous Deployment and Monitoring)"
  },
  {
    "id": "agile_devops_s16_q001",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "DevOps requires which two teams to work in collaboration?",
    "options": [
      "Dev and Sales",
      "Ops and HR",
      "QA and Finance",
      "Dev and Ops"
    ],
    "correctAnswer": "Dev and Ops",
    "explanation": "The correct answer is D) Dev and Ops. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q002",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Automation in DevOps is:",
    "options": [
      "A replacement for collaboration",
      "A strategy used to achieve DevOps goals, not DevOps itself",
      "Not needed",
      "The same as DevOps"
    ],
    "correctAnswer": "A strategy used to achieve DevOps goals, not DevOps itself",
    "explanation": "The correct answer is B) A strategy used to achieve DevOps goals, not DevOps itself. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q003",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which of the following is NOT a listed phase of the DevOps life cycle?",
    "options": [
      "Plan",
      "Operate",
      "Retire",
      "Build"
    ],
    "correctAnswer": "Retire",
    "explanation": "The correct answer is C) Retire. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q004",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "The DevOps life cycle phases are Plan, Build, Continuous Integration, Deploy, Operate and:",
    "options": [
      "Continuous feedback",
      "Sell",
      "Archive",
      "Retire"
    ],
    "correctAnswer": "Continuous feedback",
    "explanation": "The correct answer is A) Continuous feedback. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q005",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Tools used in the Plan phase should provide:",
    "options": [
      "Only compilers",
      "Sprint planning features and support sharing and commenting",
      "Only monitoring",
      "Only deployment"
    ],
    "correctAnswer": "Sprint planning features and support sharing and commenting",
    "explanation": "The correct answer is B) Sprint planning features and support sharing and commenting. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q006",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which is a common tool used in the Plan phase?",
    "options": [
      "Puppet",
      "Nagios",
      "Confluence",
      "Jenkins"
    ],
    "correctAnswer": "Confluence",
    "explanation": "The correct answer is C) Confluence. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q007",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tools are used in the Build phase for provisioning?",
    "options": [
      "Excel and Word",
      "Skype",
      "Puppet and Chef",
      "Photoshop"
    ],
    "correctAnswer": "Puppet and Chef",
    "explanation": "The correct answer is C) Puppet and Chef. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q008",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tool helps provision individual development environments?",
    "options": [
      "Docker",
      "Pendo",
      "Nagios",
      "Splunk"
    ],
    "correctAnswer": "Docker",
    "explanation": "The correct answer is A) Docker. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q009",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Infrastructure as code means developers:",
    "options": [
      "Use the same software development tools and processes to manage infrastructure as for source code",
      "Write only hardware drivers",
      "Avoid version control",
      "Configure servers manually"
    ],
    "correctAnswer": "Use the same software development tools and processes to manage infrastructure as for source code",
    "explanation": "The correct answer is A) Use the same software development tools and processes to manage infrastructure as for source code. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q010",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "With infrastructure as code, provisioning code is stored in:",
    "options": [
      "Emails",
      "Paper files",
      "Spreadsheets",
      "Version control"
    ],
    "correctAnswer": "Version control",
    "explanation": "The correct answer is D) Version control. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q011",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Infrastructure as code reduces the need for:",
    "options": [
      "Developers",
      "Tests",
      "Run books and internal documentation",
      "Servers"
    ],
    "correctAnswer": "Run books and internal documentation",
    "explanation": "The correct answer is C) Run books and internal documentation. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q012",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Pull requests are:",
    "options": [
      "Changes pushed to a development branch for review",
      "Customer complaints",
      "Server requests",
      "Deployment commands"
    ],
    "correctAnswer": "Changes pushed to a development branch for review",
    "explanation": "The correct answer is A) Changes pushed to a development branch for review. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q013",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tools are popular in the Continuous Integration phase?",
    "options": [
      "GetFeedback and Survey",
      "Bamboo and Jenkins",
      "Pendo and Hootsuite",
      "Splunk and Nagios"
    ],
    "correctAnswer": "Bamboo and Jenkins",
    "explanation": "The correct answer is B) Bamboo and Jenkins. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q014",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "CI tools should automatically apply tests to development branches and allow push to master when:",
    "options": [
      "Never",
      "Always",
      "At random",
      "Branch builds are successful"
    ],
    "correctAnswer": "Branch builds are successful",
    "explanation": "The correct answer is D) Branch builds are successful. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q015",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Automated testing helps the operations team to:",
    "options": [
      "Hire testers",
      "Ignore builds",
      "Have a clear view of build changes and testing output",
      "Skip handover"
    ],
    "correctAnswer": "Have a clear view of build changes and testing output",
    "explanation": "The correct answer is C) Have a clear view of build changes and testing output. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q016",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tool is mentioned for automated testing in the DevOps cycle?",
    "options": [
      "Chef",
      "Nagios",
      "Splunk",
      "Capture for JIRA"
    ],
    "correctAnswer": "Capture for JIRA",
    "explanation": "The correct answer is D) Capture for JIRA. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q017",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In the Deploy phase, tools should have:",
    "options": [
      "Only emails",
      "Only logs",
      "A release dashboard to review changes, test results and deployment information",
      "No dashboard"
    ],
    "correctAnswer": "A release dashboard to review changes, test results and deployment information",
    "explanation": "The correct answer is C) A release dashboard to review changes, test results and deployment information. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q018",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Developers automate deploys to the ______ environment first.",
    "options": [
      "Production",
      "Highest",
      "Customer",
      "Lowest-level"
    ],
    "correctAnswer": "Lowest-level",
    "explanation": "The correct answer is D) Lowest-level. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q019",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tools are used for automated deployment, along with HipChat to control deployments from chat rooms?",
    "options": [
      "Pendo and Survey",
      "Splunk and Nagios",
      "Puppet and Chef",
      "Excel and Word"
    ],
    "correctAnswer": "Puppet and Chef",
    "explanation": "The correct answer is C) Puppet and Chef. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q020",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In the Operate phase, developers monitor:",
    "options": [
      "HR records",
      "Customer billing",
      "Sales",
      "Application and server performance"
    ],
    "correctAnswer": "Application and server performance",
    "explanation": "The correct answer is D) Application and server performance. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q021",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tools are popular in the Operate phase?",
    "options": [
      "SurveyMonkey",
      "Chef and Puppet",
      "Confluence and Rally",
      "New Relic, Splunk and Nagios"
    ],
    "correctAnswer": "New Relic, Splunk and Nagios",
    "explanation": "The correct answer is D) New Relic, Splunk and Nagios. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q022",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tool is used for incident, change and problem tracking?",
    "options": [
      "Chef",
      "Docker",
      "JIRA Service Desk",
      "Puppet"
    ],
    "correctAnswer": "JIRA Service Desk",
    "explanation": "The correct answer is C) JIRA Service Desk. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q023",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "A deployment pipeline:",
    "options": [
      "Deploys manually",
      "Skips testing",
      "Breaks up the build into stages so issues can be tracked and fixed early",
      "Combines all steps"
    ],
    "correctAnswer": "Breaks up the build into stages so issues can be tracked and fixed early",
    "explanation": "The correct answer is C) Breaks up the build into stages so issues can be tracked and fixed early. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q024",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "A deployment pipeline provides:",
    "options": [
      "Only logs",
      "No visibility",
      "Only dashboards",
      "Clear visibility into production changes and a thorough audit trail"
    ],
    "correctAnswer": "Clear visibility into production changes and a thorough audit trail",
    "explanation": "The correct answer is D) Clear visibility into production changes and a thorough audit trail. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q025",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tool is an open source version control system that keeps versions of source code, webpages and documents?",
    "options": [
      "Chef",
      "Apache Subversion (SVN)",
      "Jenkins",
      "Puppet"
    ],
    "correctAnswer": "Apache Subversion (SVN)",
    "explanation": "The correct answer is B) Apache Subversion (SVN). (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q026",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "SVN stands for:",
    "options": [
      "Source Version Number",
      "Software Version Notes",
      "Standard Version Network",
      "Subversion"
    ],
    "correctAnswer": "Subversion",
    "explanation": "The correct answer is D) Subversion. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q027",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "When two people change the same file simultaneously in Subversion:",
    "options": [
      "The system crashes",
      "The first change is lost",
      "They receive a message and collaborate before committing",
      "The change is auto-merged blindly"
    ],
    "correctAnswer": "They receive a message and collaborate before committing",
    "explanation": "The correct answer is C) They receive a message and collaborate before committing. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q028",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Apache Ant is a ______-based tool for automating software build processes.",
    "options": [
      "Ruby",
      "C#",
      "Python",
      "Java"
    ],
    "correctAnswer": "Java",
    "explanation": "The correct answer is D) Java. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q029",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In Apache Ant, build files are scripted in:",
    "options": [
      "XML",
      "JSON",
      "YAML",
      "HTML"
    ],
    "correctAnswer": "XML",
    "explanation": "The correct answer is A) XML. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q030",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Apache Ant can be used to build:",
    "options": [
      "Only C",
      "Only Python",
      "Only Java",
      "Java and non-Java applications such as C/C++"
    ],
    "correctAnswer": "Java and non-Java applications such as C/C++",
    "explanation": "The correct answer is D) Java and non-Java applications such as C/C++. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q031",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Jenkins is:",
    "options": [
      "Open source automation software written in Java",
      "A database",
      "A language",
      "A closed-source tool"
    ],
    "correctAnswer": "Open source automation software written in Java",
    "explanation": "The correct answer is A) Open source automation software written in Java. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q032",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Jenkins automates tasks such as:",
    "options": [
      "CI, continuous testing, continuous deployment and technical aspects of continuous delivery",
      "Only monitoring",
      "Only planning",
      "Only coding"
    ],
    "correctAnswer": "CI, continuous testing, continuous deployment and technical aspects of continuous delivery",
    "explanation": "The correct answer is A) CI, continuous testing, continuous deployment and technical aspects of continuous delivery. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q033",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Jenkins supports version control tools such as:",
    "options": [
      "Only SVN",
      "None",
      "Subversion, Git, CVS, Mercurial, Perforce",
      "Only Git"
    ],
    "correctAnswer": "Subversion, Git, CVS, Mercurial, Perforce",
    "explanation": "The correct answer is C) Subversion, Git, CVS, Mercurial, Perforce. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q034",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "A Jenkinsfile is:",
    "options": [
      "A plugin",
      "A text file where users define a Jenkins Pipeline",
      "A binary",
      "A log"
    ],
    "correctAnswer": "A text file where users define a Jenkins Pipeline",
    "explanation": "The correct answer is B) A text file where users define a Jenkins Pipeline. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q035",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "The Jenkinsfile should be:",
    "options": [
      "Defined only in the UI",
      "Deleted after use",
      "Checked into source control",
      "Kept private only"
    ],
    "correctAnswer": "Checked into source control",
    "explanation": "The correct answer is C) Checked into source control. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q036",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Jenkinsfile helps to:",
    "options": [
      "Stop builds",
      "Delete branches",
      "Automatically create pipelines for all branches and pull requests",
      "Reduce testing"
    ],
    "correctAnswer": "Automatically create pipelines for all branches and pull requests",
    "explanation": "The correct answer is C) Automatically create pipelines for all branches and pull requests. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q037",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "To create a Jenkins job, click:",
    "options": [
      "New Item",
      "Update",
      "Exit",
      "Delete Item"
    ],
    "correctAnswer": "New Item",
    "explanation": "The correct answer is A) New Item. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q038",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In the Jenkins job example, the project type selected is:",
    "options": [
      "Folder",
      "Freestyle project",
      "Pipeline",
      "Maven project"
    ],
    "correctAnswer": "Freestyle project",
    "explanation": "The correct answer is B) Freestyle project. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q039",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In Jenkins, the \"Poll SCM\" option is selected under:",
    "options": [
      "Source code management",
      "Post-build actions",
      "Build Triggers",
      "Repository browser"
    ],
    "correctAnswer": "Build Triggers",
    "explanation": "The correct answer is C) Build Triggers. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q040",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Plugins can be downloaded from:",
    "options": [
      "The Jenkins plugins website",
      "Email",
      "Any random site",
      "A DVD"
    ],
    "correctAnswer": "The Jenkins plugins website",
    "explanation": "The correct answer is A) The Jenkins plugins website. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q041",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet is:",
    "options": [
      "A language",
      "A closed-source database",
      "A compiler",
      "An open-source automation tool running on Unix and Windows"
    ],
    "correctAnswer": "An open-source automation tool running on Unix and Windows",
    "explanation": "The correct answer is D) An open-source automation tool running on Unix and Windows. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q042",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet information is stored in files named:",
    "options": [
      "Puppet scripts",
      "Puppet recipes",
      "Puppet cookbooks",
      "Puppet manifests"
    ],
    "correctAnswer": "Puppet manifests",
    "explanation": "The correct answer is D) Puppet manifests. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q043",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In Puppet, system information is identified via the ______ utility.",
    "options": [
      "Knife",
      "Hiera",
      "Facter",
      "Foodcritic"
    ],
    "correctAnswer": "Facter",
    "explanation": "The correct answer is C) Facter. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q044",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet manifests are compiled into a:",
    "options": [
      "Cookbook",
      "Binary",
      "Recipe",
      "System-specific catalog"
    ],
    "correctAnswer": "System-specific catalog",
    "explanation": "The correct answer is D) System-specific catalog. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q045",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet in a client-server environment has the server acting as the:",
    "options": [
      "Puppet node",
      "Puppet chef",
      "Puppet client",
      "Puppet master"
    ],
    "correctAnswer": "Puppet master",
    "explanation": "The correct answer is D) Puppet master. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q046",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "The Puppet agent first collects:",
    "options": [
      "Recipes",
      "Cookbooks",
      "Facts such as hardware, OS and package versions",
      "Reports"
    ],
    "correctAnswer": "Facts such as hardware, OS and package versions",
    "explanation": "The correct answer is C) Facts such as hardware, OS and package versions. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q047",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In the Puppet workflow, the master creates a custom configuration called:",
    "options": [
      "Catalog",
      "Manifest",
      "Recipe",
      "Fact"
    ],
    "correctAnswer": "Catalog",
    "explanation": "The correct answer is A) Catalog. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q048",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet Enterprise can automatically detect and correct:",
    "options": [
      "Network speed",
      "Configuration drift",
      "Hardware failures",
      "Billing errors"
    ],
    "correctAnswer": "Configuration drift",
    "explanation": "The correct answer is B) Configuration drift. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q049",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet has four use cases: infrastructure, configuration management, failover and:",
    "options": [
      "Billing",
      "Hiring",
      "Testing",
      "Deploys"
    ],
    "correctAnswer": "Deploys",
    "explanation": "The correct answer is D) Deploys. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q050",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Puppet allows developers to use standardized modules from the:",
    "options": [
      "Puppet Store",
      "Puppet Market",
      "Puppet Forge",
      "Puppet Hub"
    ],
    "correctAnswer": "Puppet Forge",
    "explanation": "The correct answer is C) Puppet Forge. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q051",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Chef is a:",
    "options": [
      "Monitoring tool",
      "Version control tool",
      "Chat tool",
      "Configuration management tool"
    ],
    "correctAnswer": "Configuration management tool",
    "explanation": "The correct answer is D) Configuration management tool. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q052",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Chef converts infrastructure into code that is:",
    "options": [
      "Binary",
      "Flexible, versionable, human-readable and testable",
      "Hidden",
      "Manual"
    ],
    "correctAnswer": "Flexible, versionable, human-readable and testable",
    "explanation": "The correct answer is B) Flexible, versionable, human-readable and testable. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q053",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "In Chef, machine setup is described in a:",
    "options": [
      "Fact",
      "Recipe",
      "Manifest",
      "Catalog"
    ],
    "correctAnswer": "Recipe",
    "explanation": "The correct answer is B) Recipe. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q054",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "A cookbook in Chef is:",
    "options": [
      "A collection of recipes",
      "A server",
      "A single file",
      "A node"
    ],
    "correctAnswer": "A collection of recipes",
    "explanation": "The correct answer is A) A collection of recipes. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q055",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Cookbooks are stored on the:",
    "options": [
      "Chef node",
      "Chef server",
      "Chef client only",
      "Chef workstation only"
    ],
    "correctAnswer": "Chef server",
    "explanation": "The correct answer is B) Chef server. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q056",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which Chef component interacts with nodes on the Chef server?",
    "options": [
      "Chef-client",
      "Recipe",
      "Knife",
      "Cookbook"
    ],
    "correctAnswer": "Knife",
    "explanation": "The correct answer is C) Knife. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q057",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Which tool is used to test cookbooks?",
    "options": [
      "Facter",
      "Puppet Forge",
      "Test Kitchen",
      "Knife"
    ],
    "correctAnswer": "Test Kitchen",
    "explanation": "The correct answer is C) Test Kitchen. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q058",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Chef-client is installed on:",
    "options": [
      "Nodes",
      "Nobody",
      "Only the Chef server",
      "Only workstations"
    ],
    "correctAnswer": "Nodes",
    "explanation": "The correct answer is A) Nodes. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q059",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Chef Automate is:",
    "options": [
      "A compiler",
      "A continuous automation platform for speedy deployment and transparent code base",
      "A source control tool",
      "A language"
    ],
    "correctAnswer": "A continuous automation platform for speedy deployment and transparent code base",
    "explanation": "The correct answer is B) A continuous automation platform for speedy deployment and transparent code base. (DevOps Tools)"
  },
  {
    "id": "agile_devops_s16_q060",
    "category": "Agile and DevOps",
    "session": 16,
    "sessionTitle": "DevOps Tools",
    "questionText": "Chef Automate can be used to publish new cookbooks to:",
    "options": [
      "Puppet Forge",
      "Jenkins",
      "Chef Supermarket",
      "SVN"
    ],
    "correctAnswer": "Chef Supermarket",
    "explanation": "The correct answer is C) Chef Supermarket. (DevOps Tools)"
  }
];

module.exports = {
    AGILE_DEVOPS_SESSIONS,
    AGILE_DEVOPS_QUESTIONS
};
module.exports.default = AGILE_DEVOPS_QUESTIONS;
