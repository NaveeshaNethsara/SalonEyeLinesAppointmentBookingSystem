"use client";

import { ServiceItem } from "@/types";

interface BookingProgressBarProps {
  step: number;
  selectedService?: ServiceItem | null;
  selectedServices?: ServiceItem[];
  selectedDate: string;
  selectedTime: string;
  onStepClick: (step: number) => void;
}

export default function BookingProgressBar({
  step,
  selectedService,
  selectedServices,
  selectedDate,
  selectedTime,
  onStepClick
}: BookingProgressBarProps) {
  const hasSelectedServices = (selectedServices && selectedServices.length > 0) || !!selectedService;

  const steps = [
    { num: 1, label: "Treatments", shortLabel: "Services" },
    { num: 2, label: "Specialist", shortLabel: "Staff" },
    { num: 3, label: "Date & Time", shortLabel: "Time" },
    { num: 4, label: "Guest Details", shortLabel: "Details" },
    { num: 5, label: "Confirmation", shortLabel: "Done" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Appointment Booking Steps"
      className="bg-white rounded-xl p-2 sm:p-3 border border-gold-primary/30 shadow-sm mb-6 sm:mb-8 flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-stone-500 overflow-x-auto no-scrollbar gap-1 sm:gap-3"
    >
      {steps.map((s) => {
        const isCurrent = step === s.num;
        const isPassed = step > s.num;
        const isAvailable =
          s.num < step ||
          (s.num === 2 && hasSelectedServices) ||
          (s.num === 3 && hasSelectedServices) ||
          (s.num === 4 && hasSelectedServices && !!selectedDate && !!selectedTime);

        return (
          <button
            key={s.num}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-disabled={!isAvailable && s.num !== step}
            onClick={() => onStepClick(s.num)}
            className={`flex items-center gap-1.5 sm:gap-2 flex-shrink-0 px-2 sm:px-3 py-2 rounded-lg transition-all text-left ${
              isCurrent
                ? "bg-gold-light/30 text-gold-deep ring-1 ring-gold-primary/50 shadow-xs cursor-default"
                : isPassed
                ? "text-green-700 hover:bg-green-50 hover:text-green-800 cursor-pointer"
                : isAvailable
                ? "text-stone-700 hover:bg-gold-light/20 hover:text-gold-deep cursor-pointer"
                : "text-stone-300 cursor-not-allowed opacity-60"
            }`}
          >
            <span
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all flex-shrink-0 ${
                isCurrent
                  ? "bg-gold-primary text-white shadow-xs"
                  : isPassed
                  ? "bg-green-600 text-white"
                  : isAvailable
                  ? "bg-stone-200 text-stone-700"
                  : "bg-stone-100 text-stone-400 border border-stone-200"
              }`}
            >
              {isPassed ? "✓" : s.num}
            </span>
            <span className="hidden md:inline whitespace-nowrap font-medium text-[11px] sm:text-xs">
              {s.label}
            </span>
            <span className="inline md:hidden whitespace-nowrap font-medium text-[10px]">
              {s.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
