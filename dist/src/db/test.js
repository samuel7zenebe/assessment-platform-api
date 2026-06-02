import { db } from "@/src/db/index.js";
import { user } from "@/src/db/schema.js";
async function getUsersList() {
    const allUsers = await db.select().from(user);
    console.log(allUsers);
}
getUsersList();
