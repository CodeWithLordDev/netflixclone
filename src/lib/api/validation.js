import { z } from "zod";
import { fail } from "@/lib/api/response";

export function parseWithSchema(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: fail("VALIDATION_ERROR", "Invalid request payload", 400, parsed.error.flatten()),
    };
  }
  return { data: parsed.data };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
