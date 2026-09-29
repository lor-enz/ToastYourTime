"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, set, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateUpcomingMilestones, type Milestone } from "@/lib/milestones";
import { Button } from "@/components/ui/button";
import { CustomCalendar } from "@/components/CustomCalendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Import calendar override styles
import "@/styles/calendar-overrides.css";

const formSchema = z.object({
  dobDate: z.date({
    required_error: "Date of birth is required.",
  }),
  dobTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:mm format.",
  }),
});

type BirthdayFormProps = {
  onMilestonesCalculated: (milestones: Milestone[], birthDate: Date) => void;
  initialBirthDate?: Date;
};

export default function BirthdayForm({
  onMilestonesCalculated,
  initialBirthDate,
}: BirthdayFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues = React.useMemo(() => {
    if (initialBirthDate) {
      return {
        dobDate: initialBirthDate,
        dobTime: format(initialBirthDate, "HH:mm"),
      };
    }
    // Default to January 1, current year - 25, at 12:00
    return {
      dobDate: new Date(new Date().getFullYear() - 25, 0, 1),
      dobTime: "12:00",
    };
  }, [initialBirthDate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when initialBirthDate changes
  React.useEffect(() => {
    if (initialBirthDate) {
      form.reset({
        dobDate: initialBirthDate,
        dobTime: format(initialBirthDate, "HH:mm"),
      });
    }
  }, [initialBirthDate, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [hours, minutes] = values.dobTime.split(":").map(Number);
      // Round minutes to nearest 5
      const roundedMinutes = Math.round(minutes / 5) * 5;
      const birthDateTime = set(values.dobDate, {
        hours,
        minutes: roundedMinutes,
        seconds: 0,
        milliseconds: 0,
      });

      if (birthDateTime > new Date()) {
        toast({
          title: "Invalid Date",
          description: "Birth date cannot be in the future.",
          variant: "destructive",
        });
        return;
      }

      // Format the date for the URL: YYYYMMDD_HHmm
      const dateForUrl = format(birthDateTime, "yyyyMMdd_HHmm");

      // Update URL without navigation
      window.history.replaceState({}, "", `/${dateForUrl}`);

      // Calculate milestones for the parent component
      const milestones = calculateUpcomingMilestones(birthDateTime);
      onMilestonesCalculated(milestones, birthDateTime);

      toast({
        title: "Milestones Calculated!",
        description: "Check out your upcoming reasons to celebrate.",
      });
    } catch (error) {
      console.error("Error calculating milestones:", error);
      toast({
        title: "Calculation Error",
        description: "Could not calculate milestones. Please check your input.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dobDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}>
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    defaultMonth={field.value}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    className="custom-calendar"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dobTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time of Birth (24-hour format)</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="time"
                    step="300" // 5 minutes in seconds
                    pattern="[0-9]{2}:[0-9]{2}"
                    inputMode="numeric"
                    data-format="24h"
                    className="pr-10"
                    {...field}
                  />
                </FormControl>
                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          Calculate Milestones
        </Button>
      </form>
    </Form>
  );
}
