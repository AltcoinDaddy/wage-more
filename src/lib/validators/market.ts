import { z } from "zod";

// Base schema for input (what the form accepts)
export const createMarketSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  endTime: z.date().refine((date) => date > new Date(), {
    message: "End time must be in the future",
  }),
  marketType: z.enum(["BINARY", "MULTIPLE"]),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required"),
      })
    )
    .min(2, "At least 2 options are required"),
});

// Type for form values (matches defaultValues and form state)
export type CreateMarketFormValues = z.infer<typeof createMarketSchema>;
