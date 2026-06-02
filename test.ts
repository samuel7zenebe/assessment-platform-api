import { QuestionBankRepo } from "@/src/routes/questions/questionBankRepo.js";

async function main() {
  const questions = await QuestionBankRepo.duplicateQuestion(
    "68fb0746-9e96-4803-99b9-15009a3af3e3",
  );
  console.log("Legth: ", questions.length);
}
main();
