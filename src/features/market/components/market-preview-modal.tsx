import { format } from "date-fns";
import {
  AlertTriangle,
  Check,
  Loader2,
  Wallet,
  Clock,
  Tag,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  Flag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import type { CreateMarketFormValues } from "~/lib/validators/market";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";

interface MarketPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CreateMarketFormValues | null;
  creatorAddress: string;
  creationFee: string;
  platformFeePercent: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function MarketPreviewModal({
  open,
  onOpenChange,
  data,
  creatorAddress,
  creationFee,
  platformFeePercent,
  isSubmitting,
  onConfirm,
}: MarketPreviewModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  if (!data) return null;

  const nextStep = () => setStep((p) => Math.min(totalSteps, p + 1));
  const prevStep = () => setStep((p) => Math.max(1, p - 1));

  // Reset step when closing
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setTimeout(() => setStep(1), 300);
    onOpenChange(newOpen);
  };

  const steps = [
    { title: "Review Details", icon: Info },
    { title: "Verify Outcomes", icon: Layers },
    { title: "Confirm & Fees", icon: Wallet },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            Confirm Market
            <span className="text-muted-foreground font-normal text-base ml-auto">
              Step {step} of {totalSteps}
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === 1 && "Review the basic details of your market."}
            {step === 2 && "Double check your market outcomes."}
            {step === 3 && "Understand fees and finalize creation."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-muted h-1 mt-4">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Market Card Preview */}
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                  {data.imageUrl ? (
                    <div className="aspect-[2/1] relative bg-muted">
                      <img
                        src={data.imageUrl}
                        alt="Market cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h3 className="text-xl font-bold leading-tight">
                      {data.title}
                    </h3>
                    {data.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {data.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {data.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-2.5 py-0.5"
                        >
                          <Tag className="h-3 w-3 mr-1.5 opacity-70" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Clock className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold block">Closing Time</span>
                    {format(data.endTime, "MMMM do, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold">
                    {data.options.length} Outcomes Defined
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Verify these options cover all possibilities. Ambiguous
                    outcomes may lead to disputes.
                  </p>
                </div>

                <div className="grid gap-4">
                  {data.options.map((option, idx) => {
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-base border-2"
                          >
                            {String.fromCharCode(65 + idx)}
                          </Badge>
                          <span className="font-semibold text-lg">
                            {option.name}
                          </span>
                        </div>

                        {/* Preview of Interaction Button */}
                        <Button
                          size="sm"
                          variant={
                            data.marketType === "BINARY" && idx === 0
                              ? "default"
                              : data.marketType === "BINARY" && idx === 1
                                ? "destructive"
                                : "secondary"
                          }
                          className="min-w-[80px]"
                        >
                          {data.marketType === "BINARY" && idx === 0
                            ? "Yes"
                            : data.marketType === "BINARY" && idx === 1
                              ? "No"
                              : "Bet"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Fees Card */}
                <div className="p-5 rounded-xl border bg-muted/30 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Fees & Revenue
                  </h4>
                  <Separator className="bg-border/50" />
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Creation Cost</dt>
                      <dd className="font-semibold">{creationFee} FLOW</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Platform Fee</dt>
                      <dd className="font-semibold">
                        {platformFeePercent}% of winnings
                      </dd>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <dt className="text-muted-foreground">Creator Revenue</dt>
                      <dd className="text-xs font-mono bg-background px-2 py-1 rounded border">
                        {creatorAddress.slice(0, 6)}...
                        {creatorAddress.slice(-4)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Warning */}
                <Alert
                  variant="destructive"
                  className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-100 font-bold mb-2">
                    Irreversible Action
                  </AlertTitle>
                  <AlertDescription className="text-amber-800/90 dark:text-amber-200/90 text-sm leading-relaxed">
                    Once created, this market <strong>cannot be edited</strong>.
                    Please ensure all details, especially the resolution
                    criteria, are accurate.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        <DialogFooter className="p-6 pt-4 gap-3 sm:gap-0 bg-muted/10">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="mr-auto"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="mr-auto"
            >
              Cancel
            </Button>
          )}

          {step < totalSteps ? (
            <Button onClick={nextStep} className="px-8">
              Next Step <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-8 min-w-[150px] bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Launch Market
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
