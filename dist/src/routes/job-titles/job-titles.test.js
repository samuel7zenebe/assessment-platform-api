import { describe, expect, it, mock } from "bun:test";
import { jobTitlesRouter } from "./index.js";
import { jobTitlesRepo } from "./jobTitlesRepo.js";
// Mock the repository
mock.module("./jobTitlesRepo.js", () => ({
    jobTitlesRepo: {
        findAllJobTitles: mock(() => Promise.resolve([])),
        findJobTitleById: mock((id) => Promise.resolve([])),
        createJobTitle: mock((titleName) => Promise.resolve([])),
        updateJobTitle: mock((id, data) => Promise.resolve([])),
        deleteJobTitle: mock((id) => Promise.resolve([])),
    },
}));
describe("Job Titles Router", () => {
    describe("GET /", () => {
        it("should return 200 and data if job titles exist", async () => {
            const mockData = [{ id: "1", titleName: "Software Engineer" }];
            jobTitlesRepo.findAllJobTitles.mockResolvedValue(mockData);
            const res = await jobTitlesRouter.request("/");
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({
                data: mockData,
                success: true,
            });
        });
        it("should return 404 if no job titles found", async () => {
            jobTitlesRepo.findAllJobTitles.mockResolvedValue([]);
            const res = await jobTitlesRouter.request("/");
            expect(res.status).toBe(404);
        });
    });
    describe("GET /:jobTitleId", () => {
        it("should return 200 and data if job title exists", async () => {
            const mockData = [{ id: "1", titleName: "Software Engineer" }];
            jobTitlesRepo.findJobTitleById.mockResolvedValue(mockData);
            const res = await jobTitlesRouter.request("/1");
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({
                data: mockData[0],
                success: true,
            });
        });
        it("should return 404 if job title not found", async () => {
            jobTitlesRepo.findJobTitleById.mockResolvedValue([]);
            const res = await jobTitlesRouter.request("/99");
            expect(res.status).toBe(404);
        });
    });
    describe("POST /", () => {
        it("should return 201 and created message on success", async () => {
            const mockCreated = [{ id: "1" }];
            jobTitlesRepo.createJobTitle.mockResolvedValue(mockCreated);
            const res = await jobTitlesRouter.request("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ titleName: "New Job" }),
            });
            expect(res.status).toBe(201);
            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.message).toContain("id 1 is created successfully");
        });
        it("should return validation error for invalid payload", async () => {
            const res = await jobTitlesRouter.request("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: "Invalid" }), // titleName is required
            });
            // Hono standard-validator returns 400 by default or whatever is configured
            expect(res.status).toBe(400);
        });
    });
    describe("PUT /", () => {
        it("should return 200 and updated data on success", async () => {
            const mockUpdated = [{ id: "1", titleName: "Updated Name" }];
            jobTitlesRepo.updateJobTitle.mockResolvedValue(mockUpdated);
            const res = await jobTitlesRouter.request("/", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: "1", titleName: "Updated Name" }),
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data.titleName).toBe("Updated Name");
        });
        it("should return 404 if job title to update is not found", async () => {
            jobTitlesRepo.updateJobTitle.mockResolvedValue([]);
            const res = await jobTitlesRouter.request("/", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: "99", titleName: "Ghost" }),
            });
            expect(res.status).toBe(404);
        });
    });
    describe("DELETE /:jobTitleId", () => {
        it("should return 200 and deleted data on success", async () => {
            const mockDeleted = [{ id: "1" }];
            jobTitlesRepo.deleteJobTitle.mockResolvedValue(mockDeleted);
            const res = await jobTitlesRouter.request("/1", {
                method: "DELETE",
            });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data.id).toBe("1");
        });
        it("should return 404 if job title to delete is not found", async () => {
            jobTitlesRepo.deleteJobTitle.mockResolvedValue([]);
            const res = await jobTitlesRouter.request("/99", {
                method: "DELETE",
            });
            expect(res.status).toBe(404);
        });
    });
});
