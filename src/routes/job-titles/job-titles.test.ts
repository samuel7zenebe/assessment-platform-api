import { describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import { jobTitlesRouter } from "./index.js";
import { jobTitlesRepo } from "./jobTitlesRepo.js";

// Mock the repository
mock.module("./jobTitlesRepo.js", () => ({
  jobTitlesRepo: {
    findAllJobTitles: mock(() => Promise.resolve([])),
    findJobTitleById: mock((id: string) => Promise.resolve([])),
    createJobTitle: mock((titleName: string, _departmentId?: string | null) =>
      Promise.resolve([{ id: "1", titleName }]),
    ),
    updateJobTitle: mock((id: string, data: any) =>
      Promise.resolve([{ id, ...data }]),
    ),
    deleteJobTitle: mock((id: string) => Promise.resolve([{ id }])),
  },
}));

// Mock the database for permission checks
mock.module("@/src/db/index.js", () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() =>
          Promise.resolve([{ id: "perm-1", permission: "VIEW" }]),
        ),
      })),
    })),
  },
}));

describe("Job Titles Router", () => {
  describe("GET /", () => {
    const app = new Hono()
      .use("*", async (c, next) => {
        c.set("user", { id: "test-user", role: "BUILDER" });
        await next();
      })
      .route("/", jobTitlesRouter);

    it("should return 200 and data if job titles exist", async () => {
      const mockData = [{ id: "1", titleName: "Software Engineer" }];
      (jobTitlesRepo.findAllJobTitles as any).mockResolvedValue(mockData);

      const res = await app.request("/");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        data: mockData,
        success: true,
      });
    });

    it("should return 404 if no job titles found", async () => {
      (jobTitlesRepo.findAllJobTitles as any).mockResolvedValue([]);

      const res = await app.request("/");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /:jobTitleId", () => {
    const app = new Hono()
      .use("*", async (c, next) => {
        c.set("user", { id: "test-user", role: "BUILDER" });
        await next();
      })
      .route("/", jobTitlesRouter);

    it("should return 200 and data if job title exists", async () => {
      const mockData = [{ id: "1", titleName: "Software Engineer" }];
      (jobTitlesRepo.findJobTitleById as any).mockResolvedValue(mockData);

      const res = await app.request("/1");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.titleName).toBe("Software Engineer");
    });

    it("should return 404 if job title not found", async () => {
      (jobTitlesRepo.findJobTitleById as any).mockResolvedValue([]);

      const res = await app.request("/99");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    const app = new Hono()
      .use("*", async (c, next) => {
        c.set("user", { id: "test-user", role: "BUILDER" });
        await next();
      })
      .route("/", jobTitlesRouter);

    it("should return 201 and created message on success", async () => {
      const mockCreated = [{ id: "1" }];
      (jobTitlesRepo.createJobTitle as any).mockResolvedValue(mockCreated);

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleName: "New Job" }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should return validation error for invalid payload", async () => {
      const res = await app.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Invalid" }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /", () => {
    const app = new Hono()
      .use("*", async (c, next) => {
        c.set("user", { id: "test-user", role: "BUILDER" });
        await next();
      })
      .route("/", jobTitlesRouter);

    it("should return 200 and updated data on success", async () => {
      const mockUpdated = [{ id: "1", titleName: "Updated Name" }];
      (jobTitlesRepo.updateJobTitle as any).mockResolvedValue(mockUpdated);

      const res = await app.request("/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleName: "Updated Name" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should return 404 if job title to update is not found", async () => {
      (jobTitlesRepo.updateJobTitle as any).mockResolvedValue([]);

      const res = await app.request("/99", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titleName: "Ghost" }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /:jobTitleId", () => {
    const app = new Hono()
      .use("*", async (c, next) => {
        c.set("user", { id: "test-user", role: "BUILDER" });
        await next();
      })
      .route("/", jobTitlesRouter);

    it("should return 200 and deleted data on success", async () => {
      const mockDeleted = [{ id: "1" }];
      (jobTitlesRepo.deleteJobTitle as any).mockResolvedValue(mockDeleted);

      const res = await app.request("/1", {
        method: "DELETE",
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should return 404 if job title to delete is not found", async () => {
      (jobTitlesRepo.deleteJobTitle as any).mockResolvedValue([]);

      const res = await app.request("/99", {
        method: "DELETE",
      });

      expect(res.status).toBe(404);
    });
  });
});