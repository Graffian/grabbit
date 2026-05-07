"use client";

import { cn } from "@/lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DateRangePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
  RangeCalendar,
} from "react-aria-components";

function DateRangePickerComponent() {
  const now = today(getLocalTimeZone());

  const isDateUnavailable = () => false;

  return (
    <DateRangePicker
      className="space-y-2 min-w-[280px]"
      isDateUnavailable={isDateUnavailable}
    >
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Rental dates
      </Label>
      <div className="flex">
        <Group className="inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 pe-9 text-sm shadow-sm transition-shadow data-[focus-within]:border-indigo-500 data-[focus-within]:ring-[3px] data-[focus-within]:ring-indigo-500/20">
          <DateInput slot="start">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="inline rounded p-0.5 text-gray-900 dark:text-gray-100 caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-indigo-100 dark:data-[focused]:bg-indigo-900/30 data-[type=literal]:px-0 data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500 data-[type=literal]:text-gray-400 dark:data-[type=literal]:text-gray-500"
              />
            )}
          </DateInput>
          <span aria-hidden="true" className="px-2 text-gray-400">-</span>
          <DateInput slot="end">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="inline rounded p-0.5 text-gray-900 dark:text-gray-100 caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-indigo-100 dark:data-[focused]:bg-indigo-900/30 data-[type=literal]:px-0 data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500 data-[type=literal]:text-gray-400 dark:data-[type=literal]:text-gray-500"
              />
            )}
          </DateInput>
        </Group>
        <Button className="z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-gray-400 outline-offset-2 transition-colors hover:text-gray-600 dark:hover:text-gray-300 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-indigo-500/70">
          <CalendarIcon size={16} strokeWidth={2} />
        </Button>
      </div>
      <Popover
        className="z-50 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <RangeCalendar className="w-fit" minValue={now} isDateUnavailable={isDateUnavailable}>
            <header className="flex w-full items-center gap-1 pb-1">
              <Button
                slot="previous"
                className="flex size-9 items-center justify-center rounded-lg text-gray-500 outline-offset-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-indigo-500/70"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </Button>
              <Heading className="grow text-center text-sm font-medium" />
              <Button
                slot="next"
                className="flex size-9 items-center justify-center rounded-lg text-gray-500 outline-offset-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-indigo-500/70"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </Button>
            </header>
            <CalendarGrid>
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="size-9 rounded-lg p-0 text-xs font-medium text-gray-500">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody className="[&_td]:px-0">
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-gray-900 dark:text-gray-100 outline-offset-2 duration-150 focus-visible:outline-none data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[focus-visible]:z-10 data-[hovered]:bg-gray-100 dark:data-[hovered]:bg-gray-800 data-[selected]:bg-indigo-100 dark:data-[selected]:bg-indigo-900/30 data-[selection-start]:rounded-s-lg data-[selection-end]:rounded-e-lg data-[selected]:text-indigo-900 dark:data-[selected]:text-indigo-200 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-indigo-500/70 data-[disabled]:opacity-30"
                    )}
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </DateRangePicker>
  );
}

export { DateRangePickerComponent };
