import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index.js";
import { exams } from "./schema.js";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

async function migrationFn() {
  try {
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("migration success");
  } catch (err) {
    console.log("migration failed");
    console.log(err);
  }
}

async function bulkUpdate() {
  try {
    const examsData = await db.select().from(exams);
    for (let exam of examsData) {
      const fake_word = faker.word.sample();
      await db
        .update(exams)
        .set({
          title: fake_word,
        })
        .where(eq(exams.id, exam.id));
    }
    console.log("Bulk update success ");
  } catch (err) {
    console.log(" failed");
    console.log(err);
  }
}

migrationFn();
