import { createFactory } from "hono/factory";
import { jobTitlesRepo } from "./jobTitlesRepo.js";
import { sValidator } from "@hono/standard-validator";
import {
  CreateJobTitleSchema,
  CreateJobTitlesInBatchSchema,
  JobTitleIdSchema,
  JobTitleSchema,
  UpdateJobTitleSchema,
} from "./schema.js";
import { HTTPException } from "hono/http-exception";
import z from "zod";

const factory = createFactory<{}>();

export const getAllJobTitles = factory.createHandlers(async (c) => {
  try {
    const jobTitlesData = await jobTitlesRepo.findAllJobTitles();

    return c.json(
      {
        data: jobTitlesData,
        success: true,
      },
      {
        status: jobTitlesData.length > 0 ? 200 : 404,
      },
    );
  } catch (error) {
    throw new HTTPException(500, {
      cause: "Internal Server Error",
      message: "An error occurred while fetching the job titles",
    });
  }
});

export const createJobTitle = factory.createHandlers(
  sValidator("json", CreateJobTitleSchema),
  async (c) => {
    const { titleName } = c.req.valid("json");
    try {
      const jobTitlesData = await jobTitlesRepo.createJobTitle(titleName);

      return c.json(
        {
          data: jobTitlesData,
          success: true,
          message: `A job-title with id ${jobTitlesData[0].id} is created successfully.`,
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.log("Error creating job-title record : ", error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating the job title",
      });
    }
  },
);

export const createJobTitlesInBatch = factory.createHandlers(
  sValidator("json", CreateJobTitlesInBatchSchema),
  async (c) => {
    const titles = c.req.valid("json");
    try {
      let jobTitlesData = [];
      for (const title of titles) {
        const jobTitleData = await jobTitlesRepo.createJobTitle(
          title.titleName,
        );
        jobTitlesData.push(jobTitleData[0]);
      }

      return c.json(
        {
          data: jobTitlesData,
          success: true,
          message: `A job-title with id ${jobTitlesData.map((item) => item.id)} is created successfully.`,
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.log("Error creating job-title record : ", error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while creating the job title",
      });
    }
  },
);

export const getJobTitleById = factory.createHandlers(
  sValidator("param", JobTitleIdSchema),
  async (c) => {
    const { jobTitleId } = c.req.valid("param");
    try {
      const jobTitleData = await jobTitlesRepo.findJobTitleById(jobTitleId);
      return c.json(
        {
          data: jobTitleData[0],
          success: true,
        },
        {
          status: jobTitleData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching the job title",
      });
    }
  },
);

export const getJobTitleByTitle = factory.createHandlers(
  sValidator(
    "param",
    JobTitleSchema.pick({
      titleName: true,
    }),
  ),
  async (c) => {
    const { titleName } = c.req.valid("param");
    try {
      const jobTitleData = await jobTitlesRepo.findJobTitleByTitle(titleName);
      return c.json({
        data: jobTitleData[0],
        message: jobTitleData[0]?.id ? undefined : "Jobtitle was not found",
        success: jobTitleData[0]?.id ? true : false,
      });
    } catch (error) {
      console.log(error);
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching the job title",
      });
    }
  },
);

export const updateJobTitle = factory.createHandlers(
  sValidator(
    "param",
    UpdateJobTitleSchema.pick({
      id: true,
    }),
  ),
  sValidator(
    "json",
    UpdateJobTitleSchema.pick({
      titleName: true,
    }),
  ),

  async (c) => {
    const { titleName } = c.req.valid("json");
    const { id } = c.req.valid("param");

    try {
      const jobTitleData = await jobTitlesRepo.updateJobTitle(id, {
        titleName: titleName,
      });
      return c.json(
        {
          data: jobTitleData[0],
          success: true,
        },
        {
          status: jobTitleData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while fetching the job title",
      });
    }
  },
);

export const deleteJobTitle = factory.createHandlers(
  sValidator("param", JobTitleIdSchema),
  async (c) => {
    const { jobTitleId } = c.req.valid("param");
    try {
      const jobTitleData = await jobTitlesRepo.deleteJobTitle(jobTitleId);
      return c.json(
        {
          data: jobTitleData[0],
          success: true,
        },
        {
          status: jobTitleData.length > 0 ? 200 : 404,
        },
      );
    } catch (error) {
      throw new HTTPException(500, {
        cause: "Internal Server Error",
        message: "An error occurred while deleting the job title",
      });
    }
  },
);
