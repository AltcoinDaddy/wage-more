import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "~/features/dashboard/profile/profile-form";
import { getCurrentUser } from "~/server/user";
import { createPageMeta } from "~/seo";

export const Route = createFileRoute("/(public)/dashboard/home/")({
  component: ProfilePage,
  // Server-side data loading
  loader: async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not found");
    }

    return { currentUser };
  },
  head: () =>
    createPageMeta({
      title: "Profile | Wagemore",
      description:
        "Manage your profile settings and personal information on Wagemore",
      keywords: "profile, settings, Wagemore, user account",
    }),
});

function ProfilePage() {
  // Access the loader data - no loading state needed!
  const { currentUser } = Route.useLoaderData();

  return (
    <ProfileForm
      user={{
        name: currentUser.name ?? "",
        bio: currentUser.bio ?? "",
        image: currentUser.image ?? "",
        email: currentUser.email ?? "",
      }}
    />
  );
}
