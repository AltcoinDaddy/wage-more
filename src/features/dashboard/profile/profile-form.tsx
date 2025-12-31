import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Imports
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "~/lib/validators/user";
import { updateUserDetailsFn } from "~/server/user";
import { AvatarUpload } from "~/components/shared/avatar-upload";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { SocialConnections } from "~/components/shared/social-connections";

interface ProfileFormProps {
  user: {
    name?: string;
    email?: string;
    image?: string;
    bio?: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: user.name || "",
      bio: user.bio || "",
      avatarUrl: user.image || "",
    },
  });

  const onSubmit = async (data: UpdateUserFormValues) => {
    setIsSaving(true);
    try {
      await updateUserDetailsFn({ data });
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl text-foreground font-sans"
      >
        {/* HEADER: Avatar + Upload Button Layout */}
        <div className="flex items-center gap-6">
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <div className="flex items-center gap-4">
                    {/* Avatar Wrapper */}
                    <div className="relative overflow-hidden rounded-full w-24 h-24 border border-border shadow-sm bg-muted/20">
                      <AvatarUpload
                        ref={fileInputRef}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>

                    {/* Upload Button - Uses 'secondary' variant from theme */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={16} />
                      Upload
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* EMAIL (Read Only) */}
        <div className="space-y-2">
          <FormLabel>Email</FormLabel>
          <Input
            value={user.email || ""}
            readOnly
            disabled
            // Uses 'muted' from theme for the disabled state look
            className="bg-muted text-muted-foreground opacity-100 cursor-not-allowed border-transparent"
          />
        </div>

        {/* USERNAME */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                {/* Standard Input automatically uses var(--input) and var(--border) from your theme */}
                <Input
                  placeholder="Enter your username"
                  {...field}
                  value={user.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BIO */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SOCIAL CONNECTIONS */}
        <SocialConnections />

        {/* SAVE BUTTON */}
        <Button
          type="submit"
          disabled={isSaving}
          // 'default' variant uses var(--primary), which matches the purple/blue in your screenshot
          className="w-32"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Form>
  );
}
