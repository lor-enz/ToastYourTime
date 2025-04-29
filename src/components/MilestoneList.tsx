"use client";

import * as React from "react";
import type { Milestone } from "@/lib/milestones";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  format,
  differenceInMilliseconds,
  formatDistanceStrict,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, TrendingUp, CheckCircle, Cake } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MilestoneListProps = {
  milestones: Milestone[];
  birthDate: Date;
};

const UnitIcon = ({ unit }: { unit: Milestone["unit"] }) => {
  switch (unit) {
    case "seconds":
      return <span className="text-xs">s</span>;
    case "minutes":
      return <span className="text-xs">m</span>;
    case "hours":
      return <span className="text-xs">h</span>;
    case "days":
      return <span className="text-xs">d</span>;
    case "weeks":
      return <span className="text-xs">w</span>;
    case "months":
      return <span className="text-xs">mo</span>;
    default:
      return null;
  }
};

const MilestoneCard = ({
  milestone,
  isNext,
  birthDate,
}: {
  milestone: Milestone;
  isNext: boolean;
  birthDate: Date;
}) => {
  const now = new Date();
  const timeUntil = differenceInMilliseconds(milestone.date, now);
  const timePassed = differenceInMilliseconds(now, birthDate);
  const totalDuration = differenceInMilliseconds(milestone.date, birthDate);
  const progress = Math.min(
    100,
    Math.max(0, (timePassed / totalDuration) * 100)
  );
  const hasPassed = timeUntil <= 0;

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md animate-fadeIn min-h-[140px] flex flex-col w-full",
        isNext && !hasPassed
          ? "border-accent ring-2 ring-accent shadow-lg"
          : "border-muted",
        hasPassed ? "opacity-70 bg-secondary" : ""
      )}>
      <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary">
              {milestone.value.toLocaleString()}
            </span>{" "}
            <UnitIcon unit={milestone.unit} />
            {hasPassed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>
          {isNext && !hasPassed && (
            <Badge variant="outline" className="text-accent border-accent">
              Next!
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-sm flex items-center gap-1">
          <CalendarClock className="w-3 h-3" />
          {format(milestone.date, "PPP p")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2 flex-grow flex flex-col justify-end">
        {!hasPassed && (
          <div className="text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            In {formatDistanceStrict(milestone.date, now)}
          </div>
        )}
        {hasPassed && (
          <div className="text-sm text-muted-foreground">
            Passed {formatDistanceStrict(milestone.date, now)} ago
          </div>
        )}
        {!hasPassed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Progress
                  value={progress}
                  aria-label={`Progress towards ${milestone.value} ${milestone.unit}`}
                  className="h-2"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{progress.toFixed(1)}% complete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default function MilestoneList({
  milestones,
  birthDate,
}: MilestoneListProps) {
  const now = new Date();
  const upcomingMilestones = milestones.filter((m) => m.date >= now);
  const passedMilestones = milestones
    .filter((m) => m.date < now)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5); // Show last 5 passed

  const nextMilestoneIndex = upcomingMilestones.length > 0 ? 0 : -1;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-semibold text-center text-primary flex items-center justify-center gap-2">
        <Cake className="w-6 h-6 text-accent" />
        Your Milestones
      </h2>

      {upcomingMilestones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
          {upcomingMilestones.map((milestone, index) => (
            <MilestoneCard
              key={`${milestone.unit}-${milestone.value}`}
              milestone={milestone}
              isNext={index === nextMilestoneIndex}
              birthDate={birthDate}
            />
          ))}
        </div>
      )}
      {upcomingMilestones.length === 0 && (
        <p className="text-center text-muted-foreground">
          No upcoming milestones found within the next calculation period. Check
          back later!
        </p>
      )}

      {passedMilestones.length > 0 && (
        <div className="mt-10 space-y-4">
          <h3 className="text-xl font-semibold text-center text-secondary-foreground">
            Recently Passed Milestones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {passedMilestones.map((milestone) => (
              <MilestoneCard
                key={`passed-${milestone.unit}-${milestone.value}`}
                milestone={milestone}
                isNext={false}
                birthDate={birthDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to safely check if a class is needed
function cn(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}
