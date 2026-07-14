import { Hono } from "hono";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  updateDepartment,
  createDepartmentsInBatch,
} from "./departmentsController.js";

export const departmentsRouter = new Hono()
  .get("/", ...getAllDepartments)
  .get("/:departmentId", ...getDepartmentById)
  .get("/name/:name", ...getDepartmentByName)
  .post("/", ...createDepartment)
  .post("/batch", ...createDepartmentsInBatch)
  .delete("/:departmentId", ...deleteDepartment)
  .put("/:id", ...updateDepartment);
