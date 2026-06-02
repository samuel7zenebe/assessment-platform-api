import { Hono } from "hono";
import {
  deleteQuestionChoice,
  getQuestionChoiceById,
  getAllQuestionChoices,
  insertQuestionChoice,
  updateQuestionChoice,
} from "./questionChoicesController.js";

export const questionChoicesRouter = new Hono();

questionChoicesRouter.get("/", ...getAllQuestionChoices);

questionChoicesRouter.get("/:id", ...getQuestionChoiceById);
// Create a new choice
questionChoicesRouter.post("/", ...insertQuestionChoice);
// Update a choice
questionChoicesRouter.put("/:choiceId", ...updateQuestionChoice);
// Delete a choice
questionChoicesRouter.delete("/:choiceId", ...deleteQuestionChoice);
