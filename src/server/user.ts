import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "~/db/client";
import { user } from "~/db/schema";
import { auth } from "~/lib/auth";
import { updateUserSchema } from "~/lib/validators/user";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    const session = await auth.api.getSession({
      headers: headers,
    });

    if (!session?.user) {
      return null;
    }

    // Get full user data from database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    return userData;
  },
);

export const updateUserDetailsFn = createServerFn({ method: "POST" })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers: headers,
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const updatedUser = await db.update(user).set({
      name: data.username,
      image: data.avatarUrl,
    });
  });

export const deleteUserAccountFn = createServerFn({ method: "POST" }).handler(
  async () => {},
);
