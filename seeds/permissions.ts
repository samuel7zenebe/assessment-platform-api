import { db } from "@/src/db/index.js";
import { permissionPolicies } from "@/src/db/schema.js";

async function seedPermissions() {
  const superAdminPermissions = await db
    .insert(permissionPolicies)
    .values({
      actions: ["CREATE"],
      resource: "EXAM",
      scope: "DEPARTMENT",
      scopeId: "assa",
      userId: "XwEo1r7dQXdtCDvKEyT7uJvkIMHkshMj",
      notes: "Super admin permissions for exam resource",
      grantedBy: "system",
    })
    .returning({
      id: permissionPolicies.id,
    });

  superAdminPermissions.forEach((permission) => {
    console.log(`Inserted permission with ID: ${permission.id}`);
  });
}

seedPermissions();
