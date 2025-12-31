import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "~/features/dashboard/profile/profile-form";
import { useQuery } from "@tanstack/react-query";
import { currentUserOptions } from "~/server/user";
import { authClient } from "~/lib/auth-client";
import { createPageMeta } from "~/seo";
import { Loader2 } from "lucide-react";
import { Card } from "~/components/ui/card";

export const Route = createFileRoute("/(public)/dashboard/home/")({
  component: ProfilePage,
  head: () =>
    createPageMeta({
      title: "Profile | Wagemore",
      description:
        "Manage your profile settings and personal information on Wagemore",
      keywords: "profile, settings, Wagemore, user account",
    }),
});

function ProfilePage() {
  // Better-auth session data
  const { data: session, isPending } = authClient.useSession();

  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery(currentUserOptions(session?.user?.id));

  if (isPending || isLoadingUser) {
    return (
      <Card className="w-full max-w-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      </Card>
    );
  }

  return (
    <ProfileForm
      user={{
        name: currentUser?.name ?? "",
        bio: currentUser?.bio ?? "",
        image: currentUser?.image ?? "",
        email: currentUser?.email ?? "",
      }}
    />
  );
}
