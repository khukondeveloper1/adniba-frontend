import { z } from "zod";

export const createAppSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  package_name: z
    .string()
    .min(3, "Package name required")
    .max(200)
    .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, "Invalid Android package name (e.g. com.company.app)"),
  play_store_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  app_store_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateAppSchema = createAppSchema.partial();

export const suspendAppSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export type CreateAppFormInput = z.infer<typeof createAppSchema>;
export type UpdateAppFormInput = z.infer<typeof updateAppSchema>;
export type SuspendAppFormInput = z.infer<typeof suspendAppSchema>;
