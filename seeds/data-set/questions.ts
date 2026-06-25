export const questions = [
  {
    category: "Production",
    title: "Purpose of Gypsum",
    question:
      "What is the primary purpose of adding gypsum during cement grinding?",
    difficultyLabel: "EASY",
    type: "CHOICE",
    explanation:
      "Gypsum controls the setting time of cement by regulating the hydration of C3A. Without gypsum, cement would set too rapidly.",
    estimatedTimeSeconds: 45,
    questionData: {
      context: "Cement Grinding Process",
      shuffleChoices: true,
      multipleSelection: false,
    },
    version: 1,
    points: 2,
    isPublic: true,
    isActive: true,
    createdBy: "system",
    choices: [
      {
        choiceText: "To control the setting time of cement",
        isCorrect: true,
        displayOrder: 0,
      },
      {
        choiceText: "To increase clinker production",
        isCorrect: false,
        displayOrder: 1,
      },
      {
        choiceText: "To reduce limestone consumption",
        isCorrect: false,
        displayOrder: 2,
      },
      {
        choiceText: "To improve kiln refractory life",
        isCorrect: false,
        displayOrder: 3,
      },
    ],
    jobTitles: ["Production Engineer", "Process Engineer", "CCR Operator"],
  },

  {
    category: "Production",
    title: "Clinker Quality",
    question: "A high free lime (f-CaO) value in clinker usually indicates:",
    difficultyLabel: "MEDIUM",
    type: "CHOICE",
    explanation:
      "High free lime generally means the clinker has been under-burned or insufficiently reacted inside the kiln.",
    estimatedTimeSeconds: 60,
    questionData: {
      context: "Clinker Production",
      shuffleChoices: true,
      multipleSelection: false,
    },
    version: 1,
    points: 4,
    isPublic: true,
    isActive: true,
    createdBy: "system",
    choices: [
      {
        choiceText: "Incomplete clinker burning",
        isCorrect: true,
        displayOrder: 0,
      },
      {
        choiceText: "Excessive gypsum addition",
        isCorrect: false,
        displayOrder: 1,
      },
      {
        choiceText: "High cement fineness",
        isCorrect: false,
        displayOrder: 2,
      },
      {
        choiceText: "Low separator efficiency",
        isCorrect: false,
        displayOrder: 3,
      },
    ],
    jobTitles: ["Production Engineer", "Process Engineer", "Kiln Operator"],
  },

  {
    category: "Production",
    title: "Heat Consumption",
    question:
      "Which action is most effective in reducing the specific heat consumption of a modern dry-process cement plant?",
    difficultyLabel: "HARD",
    type: "CHOICE",
    explanation:
      "Improving preheater and precalciner efficiency increases heat recovery and lowers fuel consumption per ton of clinker.",
    estimatedTimeSeconds: 90,
    questionData: {
      context: "Energy Efficiency",
      shuffleChoices: true,
      multipleSelection: false,
    },
    version: 1,
    points: 6,
    isPublic: true,
    isActive: true,
    createdBy: "system",
    choices: [
      {
        choiceText: "Improve preheater and precalciner efficiency",
        isCorrect: true,
        displayOrder: 0,
      },
      {
        choiceText: "Increase gypsum addition",
        isCorrect: false,
        displayOrder: 1,
      },
      {
        choiceText: "Reduce separator speed",
        isCorrect: false,
        displayOrder: 2,
      },
      {
        choiceText: "Decrease cement Blaine fineness",
        isCorrect: false,
        displayOrder: 3,
      },
    ],
    jobTitles: [
      "Senior Production Engineer",
      "Process Engineer",
      "CCR Operator",
    ],
  },

  {
    category: "Production",
    title: "Raw Material Proportioning",
    question:
      "Why is maintaining a stable raw mix chemistry important in cement manufacturing?",
    difficultyLabel: "MEDIUM",
    type: "CHOICE",
    explanation:
      "Stable raw mix chemistry ensures consistent clinker mineral composition, kiln stability, and cement quality.",
    estimatedTimeSeconds: 60,
    questionData: {
      context: "Raw Mix Control",
      shuffleChoices: true,
      multipleSelection: false,
    },
    version: 1,
    points: 4,
    isPublic: true,
    isActive: true,
    createdBy: "system",
    choices: [
      {
        choiceText:
          "It ensures consistent clinker quality and stable kiln operation",
        isCorrect: true,
        displayOrder: 0,
      },
      {
        choiceText: "It increases gypsum purity",
        isCorrect: false,
        displayOrder: 1,
      },
      {
        choiceText: "It reduces cement bag weight",
        isCorrect: false,
        displayOrder: 2,
      },
      {
        choiceText: "It eliminates separator maintenance",
        isCorrect: false,
        displayOrder: 3,
      },
    ],
    jobTitles: [
      "Production Engineer",
      "Quality Control Engineer",
      "Process Engineer",
    ],
  },

  {
    category: "Production",
    title: "Production Losses",
    question:
      "Which of the following has the greatest negative impact on overall cement plant productivity?",
    difficultyLabel: "MEDIUM",
    type: "CHOICE",
    explanation:
      "Unexpected equipment failures result in unplanned shutdowns, production losses, and higher maintenance costs.",
    estimatedTimeSeconds: 60,
    questionData: {
      context: "Plant Performance",
      shuffleChoices: true,
      multipleSelection: false,
    },
    version: 1,
    points: 4,
    isPublic: true,
    isActive: true,
    createdBy: "system",
    choices: [
      {
        choiceText: "Unplanned equipment shutdowns",
        isCorrect: true,
        displayOrder: 0,
      },
      {
        choiceText: "Routine laboratory sampling",
        isCorrect: false,
        displayOrder: 1,
      },
      {
        choiceText: "Daily housekeeping",
        isCorrect: false,
        displayOrder: 2,
      },
      {
        choiceText: "Scheduled preventive maintenance",
        isCorrect: false,
        displayOrder: 3,
      },
    ],
    jobTitles: ["Production Engineer", "CCR Operator", "Process Engineer"],
  },
];
