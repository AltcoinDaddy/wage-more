import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useAccount } from "wagmi";
import { useState } from "react";
import { FormFieldWrapper } from "~/components/shared/form-field-wrapper";
import { ImageUpload } from "~/components/shared/image-upload";
import { TagInput } from "~/components/shared/tag-input";
import { DateTimePicker } from "~/components/shared/date-time-picker";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  createMarketSchema,
  type CreateMarketFormValues,
} from "~/lib/validators/market";
import { cn } from "~/lib/utils";
import { CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { MarketPreviewModal } from "./market-preview-modal";
import {
  createMarketFn,
  CREATION_FEE,
  PLATFORM_FEE_BPS,
} from "~/server/market";

import { useCreateMarketStore } from "~/lib/stores/create-market-store";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function CreateMarketForm() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<CreateMarketFormValues | null>(
    null,
  );

  const { formValues, setFormValues, resetForm } = useCreateMarketStore();

  const form = useForm<CreateMarketFormValues>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      title: formValues.title || "",
      description: formValues.description || "",
      imageUrl: formValues.imageUrl || "",
      tags: formValues.tags || [],
      marketType: (formValues.marketType as "BINARY" | "MULTIPLE") || "BINARY",
      options: formValues.options || [{ name: "Yes" }, { name: "No" }],
      // Use stored date (parsed from string) or default to tomorrow
      endTime: formValues.endTime
        ? new Date(formValues.endTime)
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Persist form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value as Partial<CreateMarketFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, setFormValues]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Step 1: Validate and show preview
  function onSubmit(data: CreateMarketFormValues) {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    setPreviewData(data);
    setShowPreview(true);
  }

  // Step 2: Confirm and create market
  async function handleConfirmCreate() {
    if (!previewData || !address) return;

    setIsSubmitting(true);

    try {
      const result = await createMarketFn({
        data: {
          ...previewData,
          endTime: previewData.endTime.toISOString(),
          creatorAddress: address,
        },
      });

      if (result.success) {
        toast.success("Market created successfully!", {
          description: `Market ID: ${result.chainId || result.tempId}`,
        });
        setShowPreview(false);
        form.reset();
        resetForm(); // Clear persisted state
        navigate({ to: "/" });
      } else {
        toast.error("Failed to create market", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pb-10">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Create Market
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Launch a new binary options prediction market.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-12"
              >
                {/* Main Question Section */}
                <FormFieldWrapper
                  control={form.control}
                  name="title"
                  label="Question"
                  placeholder="e.g. Will Bitcoin hit $100k by 2025?"
                  description="A clear, specific question that can be answered Yes or No."
                  inputClassName="h-14 text-lg"
                />

                {/* Image Upload Section */}
                <FormFieldWrapper
                  control={form.control}
                  name="imageUrl"
                  label="Cover Image"
                  description="Add an image to make your market stand out."
                  render={(field) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {/* Description Section */}
                <FormFieldWrapper
                  control={form.control}
                  name="description"
                  label="Additional Details (Optional)"
                  description="Provide context or rules for resolution."
                  render={(field) => (
                    <textarea
                      className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-5 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="The market resolves to Yes if..."
                      {...field}
                    />
                  )}
                />

                {/* Tags and Date Row */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <FormFieldWrapper
                    control={form.control}
                    name="tags"
                    label="Tags"
                    description="Keywords to help users find your market."
                    render={(field) => (
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="crypto, tech, politics"
                        maxTags={5}
                      />
                    )}
                  />

                  <FormFieldWrapper
                    control={form.control}
                    name="endTime"
                    label="End Date & Time"
                    description="When allowing predictions to stop."
                    render={(field) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select market closing time"
                      />
                    )}
                  />
                </div>

                {/* Outcomes Section */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">Outcomes</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Define the possible outcomes for this market.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-4">
                        <FormFieldWrapper
                          control={form.control}
                          name={`options.${index}.name`}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 mb-0"
                        />
                        {fields.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-14 w-14 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => append({ name: "" })}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Option
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-8 border-t">
                  <Button variant="ghost" type="button" className="h-12 px-6">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-14 px-8 text-base"
                    disabled={!address}
                  >
                    {!address ? "Connect Wallet" : "Preview & Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <MarketPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        data={previewData}
        creatorAddress={address || ""}
        creationFee={CREATION_FEE}
        platformFeePercent={PLATFORM_FEE_BPS / 100}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmCreate}
      />
    </>
  );
}
