const categories = [
    "JavaScript",
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "SQL",
    "System Design",
    "CSS",
    "DevOps",
    "Database",
    "API Design",
    "Git",
    "Docker",
    "Kubernetes",
    "AWS",
];
const jobTitles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "DevOps Engineer",
    "Software Architect",
    "Data Engineer",
    "UI/UX Developer",
];
const difficulties = ["EASY", "MEDIUM", "HARD"];
export function generateQuestions(count = 200) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const diffLabel = difficulties[Math.floor(Math.random() * difficulties.length)];
        const difficultyNum = diffLabel === "EASY" ? 2 : diffLabel === "MEDIUM" ? 5 : 8;
        const numChoices = Math.random() > 0.3 ? 4 : 5;
        const choices = Array.from({ length: numChoices }, (_, index) => ({
            choiceText: `Option ${String.fromCharCode(65 + index)} for question ${i}`,
            isCorrect: index === 0, // First option is correct (you can randomize later)
            displayOrder: index,
        }));
        questions.push({
            category,
            question: `Question ${i}: What is the best practice / correct concept regarding ${category.toLowerCase()}? (Test question ${i})`,
            difficultyLabel: diffLabel,
            type: "CHOICE",
            imageUrl: null,
            createdBy: "admin",
            points: diffLabel === "EASY" ? 5 : diffLabel === "MEDIUM" ? 10 : 15,
            choices,
            jobTitles: jobTitles.slice(0, Math.floor(Math.random() * 4) + 2), // 2 to 5 job titles
        });
    }
    return questions;
}
// Generate 200 questions
// const mockQuestions = generateQuestions(200);
// console.log(JSON.stringify(mockQuestions, null, 2));
