"use client";

import * as React from "react";
import { format } from "date-fns";
import BirthdayForm from "@/components/BirthdayForm";
import MilestoneList from "@/components/MilestoneList";
import { calculateUpcomingMilestones, type Milestone } from "@/lib/milestones";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PartyPopper, Share2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MilestonePageProps = {
  initialDateParam?: string;
};

export default function MilestonePage({
  initialDateParam,
}: MilestonePageProps) {
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [birthDate, setBirthDate] = React.useState<Date | null>(null);
  const [error, setError] = React.useState("");
  const { toast } = useToast();

  // Parse date from URL parameter on initial load
  React.useEffect(() => {
    if (initialDateParam) {
      try {
        // Step 1: Format validation - must match YYYYMMDD_HHmm pattern
        if (!initialDateParam.match(/^\d{8}_\d{4}$/)) {
          throw new Error("Invalid date format");
        }

        // Step 2: Parse the date components
        const year = parseInt(initialDateParam.substr(0, 4));
        const month = parseInt(initialDateParam.substr(4, 2)) - 1; // 0-indexed month
        const day = parseInt(initialDateParam.substr(6, 2));
        const hours = parseInt(initialDateParam.substr(9, 2));
        const minutes = parseInt(initialDateParam.substr(11, 2));

        // Step 3: Additional validation for date range
        if (
          year < 1900 ||
          year > new Date().getFullYear() ||
          month < 0 ||
          month > 11 ||
          day < 1 ||
          day > 31 ||
          hours < 0 ||
          hours > 23 ||
          minutes < 0 ||
          minutes > 59
        ) {
          throw new Error("Invalid date values");
        }

        const date = new Date(year, month, day, hours, minutes, 0, 0);

        // Step 4: Ensure the date is valid (accounts for days in month, leap years, etc.)
        if (
          isNaN(date.getTime()) ||
          date.getFullYear() !== year ||
          date.getMonth() !== month ||
          date.getDate() !== day ||
          date > new Date()
        ) {
          throw new Error("Invalid date");
        }

        // Calculate milestones
        const calculatedMilestones = calculateUpcomingMilestones(date);
        setBirthDate(date);
        setMilestones(calculatedMilestones);
        setError("");
      } catch (err) {
        console.error("Error parsing date:", err);
        setError(
          "Invalid date in URL. Please check the format (YYYYMMDD_HHmm) and ensure it's a valid past date."
        );
        setBirthDate(null);
        setMilestones([]);
      }
    }
  }, [initialDateParam]);

  const handleMilestonesCalculated = (
    calculatedMilestones: Milestone[],
    date: Date
  ) => {
    setMilestones(calculatedMilestones);
    setBirthDate(date);
    setError("");
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Share this link with others to show them your milestones.",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8 min-h-full">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-3">
          <PartyPopper className="w-10 h-10 text-accent" />
          ToastYourTime
        </h1>
        <p className="text-lg text-muted-foreground">
          Find your next reason to celebrate! Enter your birth date and time.
        </p>
      </header>

      <main className="container max-w-5xl py-4 md:py-10">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Toast Your Time
            </h1>
            <p className="text-muted-foreground">
              Calculate your upcoming life milestones and plan your
              celebrations!
            </p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Enter Your Birth Date & Time</CardTitle>
              <CardDescription>
                We&apos;ll calculate your upcoming milestones based on this
                information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BirthdayForm
                onMilestonesCalculated={handleMilestonesCalculated}
                initialBirthDate={birthDate || undefined}
              />
            </CardContent>
          </Card>

          {milestones.length > 0 && birthDate ? (
            <>
              <div className="w-full max-w-md flex justify-end">
                <button
                  onClick={handleCopyShareLink}
                  className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4" />
                  Copy share link
                </button>
              </div>
              <Separator className="my-4" />
              <MilestoneList milestones={milestones} birthDate={birthDate} />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
