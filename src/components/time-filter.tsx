"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, endOfDay, format, isValid, parse, parseISO, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn, formatDate, getPresetRange, PRESETS } from "@lib/utils";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterIcon } from "lucide-react";
import { ScrollArea } from "@ui/scroll-area";

export function TimeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateFilter = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const dateFrom = currentParams.get("from");
    const dateTo = currentParams.get("to");

    const newDateFrom =  date?.from ?? new Date();
    const newDateTo =  date?.to ?? new Date();

    if (dateFrom) {
      currentParams.delete("from")
      currentParams.set("from", format(newDateFrom , "yyyy-MM-dd"))
    } else {
      currentParams.set("from", format(newDateFrom , "yyyy-MM-dd"))
    }

    if (dateTo) {
      currentParams.delete("to")
      currentParams.set("to", format(newDateTo , "yyyy-MM-dd"))
    } else {
      currentParams.set("to", format(newDateTo , "yyyy-MM-dd"))
    }

    const newUrl = `?${currentParams.toString()}`;
    router.push(newUrl);
  };


  const clearSearchParams = () => {
    router.push("/registries");
  };

  React.useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const parseDate = (dateString: string | null): Date => {
      if (!dateString) return new Date();

      // Assuming the date format in URL is 'yyyy-MM-dd'
      const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
      return isValid(parsedDate) ? parsedDate : new Date();
    };

    setDate({
      from: startOfDay(parseDate(fromParam)),
      to: endOfDay(parseDate(toParam)),
    });
  }, [searchParams]);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-72 justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex gap-2" align="end">
          <div className="space-y-2 pl-3 py-2 pr-2 " >
            <ScrollArea className="h-56 pr-3">
              <div className="flex flex-col space-y-2">
                {PRESETS.map((item) => (
                  <Button
                    key={item.label}
                    className="h-8 px-2 text-sm"
                    variant={
                      date?.from?.getDate() ===
                      getPresetRange(item.name).from?.getDate()
                        ? "default"
                        : "secondary"
                    }
                    onClick={() => {
                      setDate(getPresetRange(item.name));
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <Button variant="secondary" onClick={clearSearchParams} >
              Clear Date
            </Button>
          </div>
          <Calendar
            className="pl-0"
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={{
              after: new Date(),
            }}
          />
        </PopoverContent>
      </Popover>
      <Button size={"sm"} className="gap-1.5 w-fit" onClick={handleDateFilter} >
          <FilterIcon className="size-4" />
          <span className="text-base">filter</span>
      </Button>
    </div>
  );
}
