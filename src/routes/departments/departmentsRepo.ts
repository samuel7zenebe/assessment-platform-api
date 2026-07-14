import { db } from "@/src/db/index.js";
import { departments } from "@/src/db/schema.js";
import { desc, eq, inArray } from "drizzle-orm";
import { CreateDepartmentSchema } from "./schema.js";

export const departmentsRepo = {
  findAllDepartments: () => {
    return db.select().from(departments).orderBy(desc(departments.name));
  },
  findDepartmentsByIds: (ids: string[]) => {
    if (ids.length === 0) return [];
    return db
      .select()
      .from(departments)
      .where(inArray(departments.id, ids))
      .orderBy(desc(departments.name));
  },
  findDepartmentById: (id: string) => {
    return db.select().from(departments).where(eq(departments.id, id));
  },
  findDepartmentByName: (name: string) => {
    return db.select().from(departments).where(eq(departments.name, name));
  },
  createDepartment: (
    name: string,
    id: string,
    description?: string | null,
    managerId?: string | null,
    dgmName?: string | null,
  ) => {
    return db
      .insert(departments)
      .values({ name, description, managerId, dgmName, id })
      .returning({ id: departments.id });
  },
  updateDepartment: (
    id: string,
    data: {
      name?: string;
      description?: string | null;
      managerId?: string | null;
      dgmName?: string | null;
    },
  ) => {
    const { name, description, managerId, dgmName } = data;
    return db
      .update(departments)
      .set({
        name,
        description,
        managerId,
        dgmName,
      })
      .where(eq(departments.id, id))
      .returning();
  },
  deleteDepartment: (id: string) => {
    return db.delete(departments).where(eq(departments.id, id)).returning({
      id: departments.id,
    });
  },
};
