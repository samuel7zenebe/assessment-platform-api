import { createFactory } from "hono/factory";
import { departmentsRepo } from "./departmentsRepo.js";
import { permissionPoliciesRepo } from "../permission-policies/permissionPoliciesRepo.js";
import { sValidator } from "@hono/standard-validator";
import {
  CreateDepartmentSchema,
  CreateDepartmentsInBatchSchema,
  DepartmentIdSchema,
  DepartmentSchema,
  UpdateDepartmentSchema,
} from "./schema.js";
import { HTTPException } from "hono/http-exception";
import z from "zod";

const factory = createFactory<{}>();

// ── GET    /     → list departments ───────────────────────────────────────────
export const getAllDepartments = factory.createHandlers(async (c) => {
  const user = c.get("user");
  try {
    let departmentsData;

    if (user?.role === "SUPER_ADMIN") {
      departmentsData = await departmentsRepo.findAllDepartments();
    } else {
      const { departmentIds } =
        await permissionPoliciesRepo.getAccessibleScopes(user.id);

      departmentsData = await departmentsRepo.findDepartmentsByIds(
        departmentIds,
      );
    }

    return c.json(
      {
        data: departmentsData,
        success: true,
      },
      {
        status: departmentsData.length > 0 ? 200 : 404,
      },
    );
  } catch (error) {
    throw new HTTPException(500, {
      cause: "Internal Server Error",
      message: "An error occurred while fetching the departments",
    });
  }
});

// ── POST   /     → create department ──────────────────────────────────────────
export const createDepartment = factory.createHandlers(
  sValidator("json", CreateDepartmentSchema),
  async (c) => {
    const { name, description = "", managerId, dgmName } = c.req.valid("json");
    try {
      const departmentsData = await departmentsRepo.createDepartment(
        name,
        description,
        managerId,
        dgmName,
      );

      return c.json(
        {
          data: departmentsData,
          success: true,
          message: `A department with id ${departmentsData[0].id} is created successfully.`,
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.log("Error creating department record : ", error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating the department",
      });
    }
  },
);

// ── POST   /batch  → create departments in batch ────────────────────────────────
export const createDepartmentsInBatch = factory.createHandlers(
  sValidator("json", CreateDepartmentsInBatchSchema),
  async (c) => {
    const deps = c.req.valid("json");
    try {
      let departmentsData = [];
      for (const dep of deps) {
        const departmentData = await departmentsRepo.createDepartment(
          dep.name,
          dep.description ?? "",
          dep.managerId,
          dep.dgmName,
        );
        departmentsData.push(departmentData[0]);
      }

      return c.json(
        {
          data: departmentsData,
          success: true,
          message: `Departments with ids ${departmentsData.map((item) => item.id)} are created successfully.`,
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.log("Error creating department record : ", error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating the department",
      });
    }
  },
);

// ── GET    /:departmentId  → get department by id ─────────────────────────────
export const getDepartmentById = factory.createHandlers(
  sValidator("param", DepartmentIdSchema),
  async (c) => {
    const { departmentId } = c.req.valid("param");
    try {
      const departmentData =
        await departmentsRepo.findDepartmentById(departmentId);
      return c.json(
        {
          data: departmentData[0],
          success: true,
        },
        {
          status: departmentData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching the department",
      });
    }
  },
);

// ── GET    /name/:name  → get department by name ────────────────────────────────
export const getDepartmentByName = factory.createHandlers(
  sValidator(
    "param",
    DepartmentSchema.pick({
      name: true,
    }),
  ),
  async (c) => {
    const { name } = c.req.valid("param");
    try {
      const departmentData = await departmentsRepo.findDepartmentByName(name);
      return c.json({
        data: departmentData[0],
        message: departmentData[0]?.id ? undefined : "Department was not found",
        success: departmentData[0]?.id ? true : false,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching the department",
      });
    }
  },
);

// ── PUT    /:id  → update department ───────────────────────────────────────────
export const updateDepartment = factory.createHandlers(
  sValidator(
    "param",
    UpdateDepartmentSchema.pick({
      id: true,
    }),
  ),
  sValidator(
    "json",
    UpdateDepartmentSchema.pick({
      name: true,
      description: true,
      managerId: true,
      dgmName: true,
    }),
  ),
  async (c) => {
    const { name, description, managerId, dgmName } = c.req.valid("json");
    const { id } = c.req.valid("param");

    try {
      const departmentData = await departmentsRepo.updateDepartment(id, {
        name,
        description,
        managerId,
        dgmName,
      });
      return c.json(
        {
          data: departmentData[0],
          success: true,
        },
        {
          status: departmentData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while updating the department",
      });
    }
  },
);

// ── DELETE /:departmentId  → delete department ─────────────────────────────────
export const deleteDepartment = factory.createHandlers(
  sValidator("param", DepartmentIdSchema),
  async (c) => {
    const { departmentId } = c.req.valid("param");
    try {
      const departmentData =
        await departmentsRepo.deleteDepartment(departmentId);
      return c.json(
        {
          data: departmentData[0],
          success: true,
        },
        {
          status: departmentData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while deleting the department",
      });
    }
  },
);
