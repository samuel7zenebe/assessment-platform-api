import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index.js";

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

migrationFn();
