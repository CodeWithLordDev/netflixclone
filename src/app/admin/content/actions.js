"use server";

import { revalidatePath } from "next/cache";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { connectDB } from "@/lib/mongodb";
import Content from "@/models/admin/Content";
import { contentSchema } from "@/lib/validators/admin";

export async function createContentAction(input) {
  const session = await getSessionFromJwt();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = contentSchema.parse(input);

  await connectDB();
  await Content.create({
    ...parsed,
    createdBy: session.user.id,
    categoryNames: parsed.categoryNames || []
  });

  revalidatePath("/admin/content");
}
