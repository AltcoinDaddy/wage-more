"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import {
  Loader2,
  CheckCircle2,
  Wallet,
  ArrowRight,
  User,
  Sparkles,
  Check,
  Vote,
  Trophy,
  Bitcoin,
  Globe2,
  AtSign,
  Palette,
  Briefcase,
  Video,
} from "lucide-react";
import { toast } from "sonner";

// Server functions
import { completeOnboardingFn } from "~/server/onboarding";
import { getCurrentUser, checkOnboardingStatus } from "~/server/auth";
import { WalletModal } from "~/components/shared/wallet-modal";

// UI Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

// Better auth hook
import { authClient } from "~/lib/auth-client";

// Form validation schema
const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    ),
  interests: z
    .array(z.string())
    .min(2, "Please select at least 2 interests")
    .max(3, "Please select no more than 3 interests"),
  walletAddress: z.string().optional(),
  signature: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Interests Data with Icons
const INTERESTS_DATA = [
  { id: "You", icon: User },
  { id: "Politics", icon: Vote },
  { id: "Sports", icon: Trophy },
  { id: "Crypto", icon: Bitcoin },
  { id: "Global Elections", icon: Globe2 },
  { id: "Mentions", icon: AtSign },
  { id: "Creators", icon: Video },
  { id: "Pop Culture", icon: Palette },
  { id: "Business", icon: Briefcase },
];

// Query Options for onboarding status check
const onboardingStatusOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["onboarding-status", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("No user ID available");
      }
      return await checkOnboardingStatus();
    },
    enabled: !!userId,
    staleTime: 0, // Always fresh
    retry: false,
  });

// Query Options for current user data
const currentUserOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["current-user", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("No user ID available");
      }
      return await getCurrentUser();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Custom Success Animation (SVG-based)
// Custom Success Animation with WebM
const SuccessAnimation = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.video
        src="/animations/wagemore-success.webm" // Place your WebM file in the public folder
        autoPlay
        loop={false} // Set to true if you want it to loop
        muted
        playsInline
        className="w-full h-full object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onEnded={() => {
          // Optional: Do something when animation ends
          console.log("Confetti animation completed");
        }}
      />
    </div>
  );
};

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();

  // Better-auth session data
  const { data: session, isPending } = authClient.useSession();

  const totalSteps = 4;
  const progressValue = (step / totalSteps) * 100;

  // Use query options for onboarding status
  const {
    data: onboardingStatus,
    isLoading: isLoadingOnboarding,
    error: onboardingError,
  } = useQuery(onboardingStatusOptions(session?.user?.id));

  // Use query options for current user data
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery(currentUserOptions(session?.user?.id));

  // Initialize react-hook-form
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: currentUser?.name || "",
      interests: currentUser?.interests || [],
      walletAddress: "",
      signature: "",
    },
    mode: "onChange",
  });

  const { watch, setValue, getValues, trigger } = form;

  // Watch form values
  const username = watch("username");
  const selectedInterests = watch("interests");

  // Handle redirects based on query results
  useEffect(() => {
    if (isPending || isLoadingOnboarding) return;

    if (!session?.user) {
      router.navigate({ to: "/login" });
      return;
    }

    if (onboardingStatus?.isCompleted) {
      toast.success("Welcome back! Redirecting to dashboard...");
      router.navigate({ to: "/dashboard/home" });
      return;
    }

    if (
      currentUser?.interests &&
      currentUser.interests.length > 0 &&
      selectedInterests.length === 0
    ) {
      setValue("interests", currentUser.interests);
    }
  }, [
    session,
    isPending,
    isLoadingOnboarding,
    onboardingStatus,
    currentUser,
    router,
    setValue,
    username,
    selectedInterests,
  ]);

  // Show loading spinner while checking auth/onboarding
  const isLoading = isPending || isLoadingOnboarding || isLoadingUser;
  if (isLoading) {
    return (
      <main className="flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10 bg-muted/50">
        <Card className="w-full max-w-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Checking your account...</p>
            <p className="text-sm text-muted-foreground">
              Please wait a moment.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  // Don't render anything if no session (will redirect)
  if (!session?.user) {
    return null;
  }

  // Handle query errors
  if (onboardingError || userError) {
    toast.error("Something went wrong. Please try again.");
    return (
      <main className="flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10 bg-muted/50">
        <Card className="w-full max-w-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-lg font-medium">Error loading data</p>
            <p className="text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
            <Button onClick={() => router.invalidate()}>Refresh Page</Button>
          </div>
        </Card>
      </main>
    );
  }

  // --- Handlers ---
  const toggleInterest = (interest: string) => {
    const currentInterests = getValues("interests");
    let newInterests: string[];

    if (currentInterests.includes(interest)) {
      newInterests = currentInterests.filter((i) => i !== interest);
    } else {
      if (currentInterests.length >= 3) return; // Max 3
      newInterests = [...currentInterests, interest];
    }

    setValue("interests", newInterests);
    trigger("interests");
  };

  const handleStepNavigation = async (nextStep: number) => {
    // Validate current step before proceeding
    let isValid = true;

    if (step === 1) {
      isValid = await trigger("username");
    } else if (step === 2) {
      isValid = await trigger("interests");
    }

    if (isValid) {
      setStep(nextStep);
    }
  };

  const handleFinalSubmit = async () => {
    if (!address || !session?.user) {
      toast.error("Please connect your wallet and ensure you're logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const message = `Link wallet ${address} to account ${session.user.id}`;
      const signature = await signMessageAsync({ message });

      // Update form values
      setValue("walletAddress", address);
      setValue("signature", signature);

      const formData = getValues();

      await completeOnboardingFn({
        data: {
          username: formData.username,
          interests: formData.interests,
          walletAddress: address,
          signature,
        },
      });

      toast.success("Onboarding completed successfully!");
      setStep(4);

      setTimeout(() => {
        router.navigate({ to: "/dashboard/home" });
      }, 3500);
    } catch (error: any) {
      console.error("Onboarding failed", error);

      let errorMessage = "Failed to complete onboarding. Please try again.";
      if (error?.message?.includes("Invalid wallet signature")) {
        errorMessage =
          "Wallet signature verification failed. Please try again.";
      } else if (error?.message?.includes("already linked")) {
        errorMessage = "This wallet is already linked to another account.";
      }

      toast.error(errorMessage);
      form.setError("root", { message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "10%" : "-10%",
      opacity: 0,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? "10%" : "-10%",
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <main className="flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10 bg-muted/50">
      <Form {...form}>
        <Card className="w-full max-w-lg relative overflow-hidden border-border bg-card shadow-xl">
          {/* Progress Bar (Hidden on Success step) */}
          {step < 4 && (
            <Progress
              value={progressValue}
              className="h-1 rounded-none absolute top-0 left-0 right-0 z-10"
            />
          )}

          <CardContent className="p-8 pt-10 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait" custom={step} initial={false}>
              {/* STEP 1: WELCOME */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-1 flex flex-col"
                >
                  <CardHeader className="px-0 pt-0 pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary p-2">
                      <Image
                        src="/logo.svg"
                        alt="WageMore Logo"
                        layout="constrained"
                        width={24}
                        height={24}
                      />
                    </div>
                    <CardTitle className="text-2xl">
                      Welcome to WageMore
                    </CardTitle>
                    <CardDescription>
                      Let's start with the basics. What should we call you?
                    </CardDescription>
                  </CardHeader>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Satoshi"
                              className="text-lg h-12"
                              autoFocus
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter className="px-0 pb-0 mt-auto">
                    <Button
                      type="button"
                      className="w-full h-12 text-base"
                      onClick={() => handleStepNavigation(2)}
                      disabled={!username || username.length < 3}
                    >
                      Next Step <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {/* STEP 2: INTERESTS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-1 flex flex-col"
                >
                  <CardHeader className="px-0 pt-0 pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Sparkles size={24} />
                    </div>
                    <CardTitle className="text-2xl">Your Interests</CardTitle>
                    <CardDescription>
                      Select 2 or 3 topics to personalize your feed.
                    </CardDescription>
                  </CardHeader>

                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="interests"
                      render={() => (
                        <FormItem>
                          <div className="flex flex-wrap gap-3">
                            {INTERESTS_DATA.map((item) => {
                              const isSelected = selectedInterests.includes(
                                item.id,
                              );
                              const Icon = item.icon;
                              return (
                                <Badge
                                  key={item.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                    "text-sm py-2.5 px-4 cursor-pointer transition-all duration-200 select-none flex items-center gap-2",
                                    isSelected
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-md scale-105"
                                      : "hover:border-primary/50 hover:bg-muted",
                                  )}
                                  onClick={() => toggleInterest(item.id)}
                                >
                                  <Icon size={14} />
                                  {item.id}
                                  {isSelected && (
                                    <Check className="ml-1 h-3 w-3" />
                                  )}
                                </Badge>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter className="px-0 pb-0 mt-auto flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-24"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-12 text-base"
                      onClick={() => handleStepNavigation(3)}
                      disabled={selectedInterests.length < 2}
                    >
                      {selectedInterests.length < 2
                        ? `Pick ${2 - selectedInterests.length} more`
                        : `Continue (${selectedInterests.length}/3)`}
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {/* STEP 3: WALLET */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex-1 flex flex-col"
                >
                  <CardHeader className="px-0 pt-0 pb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Wallet size={24} />
                    </div>
                    <CardTitle className="text-2xl">
                      Secure Your Account
                    </CardTitle>
                    <CardDescription>
                      Connect and sign to verify your identity.
                    </CardDescription>
                  </CardHeader>

                  <div className="flex-1 flex flex-col justify-center gap-4">
                    {!isConnected ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-32 w-full border-dashed border-2 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 group transition-all"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <div className="p-3 bg-muted rounded-full group-hover:bg-background transition-colors">
                          <Wallet className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-lg font-medium">Link Wallet</span>
                      </Button>
                    ) : (
                      <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Wallet Connected
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Display form-level errors */}
                  {form.formState.errors.root && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">
                        {form.formState.errors.root.message}
                      </p>
                    </div>
                  )}

                  <CardFooter className="px-0 pb-0 mt-auto flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-24"
                      onClick={() => setStep(2)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-12 text-base"
                      onClick={handleFinalSubmit}
                      disabled={!isConnected || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Verifying...
                        </>
                      ) : (
                        "Sign & Complete"
                      )}
                    </Button>
                  </CardFooter>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="mb-8 scale-125">
                    <SuccessAnimation />
                  </div>

                  <CardTitle className="text-3xl mb-3">
                    You're All Set!
                  </CardTitle>
                  <CardDescription className="text-lg mb-8 max-w-xs mx-auto">
                    Welcome aboard,{" "}
                    <span className="font-medium text-foreground">
                      {username}
                    </span>
                    .<br />
                    Preparing your dashboard...
                  </CardDescription>

                  <div className="flex items-center text-muted-foreground text-sm bg-muted/50 px-4 py-2 rounded-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Redirecting shortly
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </Form>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
