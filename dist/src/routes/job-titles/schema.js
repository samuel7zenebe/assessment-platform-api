import z from "zod";
export const CreateJobTitleSchema = z.object({
    titleName: z.string().min(1, "Title name is required"),
});
export const JobTitleIdSchema = z.object({
    jobTitleId: z.string(),
});
export const UpdateJobTitleSchema = z.object({
    id: z.string(),
    titleName: z.string().min(1, "Title name is required"),
});
export const CreateJobTitlesInBatchSchema = z.array(z.object({
    titleName: z.string().min(1, "Title name is required"),
}));
