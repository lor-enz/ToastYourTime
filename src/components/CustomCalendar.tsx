"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CustomCalendarProps = React.ComponentProps<typeof DayPicker>;

export function CustomCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CustomCalendarProps) {
  // Add a ref to target the year dropdown after rendering
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.defaultMonth || new Date()
  );

  // Apply styles to year dropdown after component mounts
  React.useEffect(() => {
    if (calendarRef.current) {
      const yearDropdowns = calendarRef.current.querySelectorAll(
        "select.rdp-dropdown_year"
      );
      yearDropdowns.forEach((dropdown) => {
        (dropdown as HTMLElement).style.minWidth = "90px";
        (dropdown as HTMLElement).style.paddingRight = "24px";
      });
    }
  }, []);

  // Handle month changes from props
  React.useEffect(() => {
    if (props.defaultMonth && props.defaultMonth !== currentMonth) {
      setCurrentMonth(props.defaultMonth);
    }
  }, [props.defaultMonth]);

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    if (props.onMonthChange) {
      props.onMonthChange(newMonth);
    }
  };

  return (
    <div ref={calendarRef} className="custom-calendar-wrapper flex flex-col">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pb-0", className)}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "hidden",
          caption_dropdowns: "flex gap-1 w-full justify-center",
          dropdown:
            "cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground min-w-[90px]",
          dropdown_month: "mr-1",
          dropdown_year: "min-w-[90px] pl-2 pr-6",
          dropdown_icon: "absolute right-2 top-1/2 -translate-y-1/2",
          nav: "hidden", // Hide default navigation
          nav_button: "hidden", // Hide default buttons
          nav_button_previous: "hidden",
          nav_button_next: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => (
            <ChevronLeft className="h-4 w-4" {...props} />
          ),
          IconRight: ({ ...props }) => (
            <ChevronRight className="h-4 w-4" {...props} />
          ),
        }}
        {...props}
      />

      <div className="flex justify-center space-x-2 w-full mt-3 pb-1">
        <button
          name="previous-month"
          aria-label="Go to previous month"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 disabled:opacity-30"
          )}
          onClick={() => handleMonthChange(addMonths(currentMonth, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          name="next-month"
          aria-label="Go to next month"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 disabled:opacity-30"
          )}
          onClick={() => handleMonthChange(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

CustomCalendar.displayName = "CustomCalendar";
