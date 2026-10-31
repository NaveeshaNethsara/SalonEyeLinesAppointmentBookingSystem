"use client";

import { TIME_SLOTS } from "@/lib/data";
import { SpecialistItem, ServiceItem } from "@/types";
import { getTodayColomboDate, getTomorrowColomboDate, isSlotInPast } from "@/lib/appointments";
import { formatRitualDuration, calculateTotalInvestment } from "@/components/booking/ServiceSelectionStep";
import { Sparkles, Clock, AlertCircle } from "lucide-react";

interface DateTimeSelectionStepProps {
  selectedDate: string;
  selectedTime: string;
  selectedStaff: SpecialistItem | null;
  selectedServices: ServiceItem[];
  serverSlots: Array<{ time: string; available: boolean; reason?: string; staffId?: string; staffName?: string }>;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onClearError: () => void;
}

export default function DateTimeSelectionStep({
  selectedDate,
  selectedTime,
  selectedStaff,
  selectedServices,
  serverSlots,
  onSelectDate,
  onSelectTime,
  onClearError
}: DateTimeSelectionStepProps) {
  const getSlotStatus = (timeSlot: string) => {
    const isPast = isSlotInPast(selectedDate, timeSlot);
    if (isPast) {
      return {
        isUnavailable: true,
        isPast: true,
        reason: "Slot Elapsed: This time slot has already passed."
      };
    }
    const slot = serverSlots.find((s) => s.time === timeSlot);
    if (slot) {
      return {
        isUnavailable: !slot.available,
        isPast: false,
        reason: slot.reason,
        staffName: slot.staffName
      };
    }
    return {
      isUnavailable: false,
      isPast: false,
      reason: undefined,
      staffName: undefined
    };
  };

  const isToday = selectedDate === getTodayColomboDate();
  const allSlotsPast = TIME_SLOTS.every((t) => isSlotInPast(selectedDate, t));
  const totalDuration = formatRitualDuration(selectedServices);
  const totalInvestment = calculateTotalInvestment(selectedServices);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-light text-stone-900">
          3. Preferred Date & Time Window
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Our standard studio slots in Aluthgama. Early Nekath wedding slots (4:00 AM) can be requested in notes.
        </p>
      </div>

      {/* Multi-Treatment Ritual Overview Banner */}
      {selectedServices.length > 0 && (
        <div className="p-4 rounded-xl bg-gold-light/30 border border-gold-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-deep" />
              <span>
                {selectedServices.length === 1
                  ? selectedServices[0].name
                  : `Sequential Ritual (${selectedServices.length} Treatments): ${selectedServices.map((s) => s.name).join(" + ")}`}
              </span>
            </span>
            <p className="text-[11px] text-stone-600 font-light">
              Sequential booking includes an automatic 5-minute sanitization & turnaround buffer between treatments.
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
              <Clock className="w-3.5 h-3.5 text-gold-deep" />
              <span>Total Session: {totalDuration}</span>
            </span>
            <span className="block text-[11px] text-gold-deep font-serif font-bold">
              LKR {totalInvestment.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-2">
            Select Appointment Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={getTodayColomboDate()}
            onChange={(e) => {
              onSelectDate(e.target.value);
              onSelectTime("");
            }}
            className="w-full p-3.5 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary"
          />
          <p className="text-[11px] text-stone-500 mt-2 font-light">
            Appointments must be scheduled for today or upcoming future dates.
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700">
              Select Available Time Slot
            </label>
            <span className="text-[11px] text-stone-500 font-light">
              Specialist: <strong className="text-stone-800">{selectedStaff?.name || "Any Specialist"}</strong>
            </span>
          </div>

          {isToday && allSlotsPast && (
            <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <span>
                <strong>Today&apos;s Salon Hours Closed:</strong> All scheduled slots for today have ended.
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectDate(getTomorrowColomboDate());
                  onSelectTime("");
                  onClearError();
                }}
                className="px-2.5 py-1 rounded bg-amber-700 text-white font-semibold text-[11px] hover:bg-amber-800 transition whitespace-nowrap cursor-pointer shadow-xs"
              >
                Switch to Tomorrow →
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((t) => {
              const status = getSlotStatus(t);
              const isSelected = selectedTime === t;

              return (
                <button
                  type="button"
                  key={t}
                  disabled={status.isUnavailable}
                  title={status.reason || (status.isUnavailable ? "Slot Unavailable" : "Slot Available")}
                  onClick={() => {
                    onSelectTime(t);
                    onClearError();
                  }}
                  className={`py-3 px-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                    status.isPast
                      ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-40 line-through"
                      : status.isUnavailable
                      ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-gold-primary text-white border-gold-primary shadow-xs ring-2 ring-gold-primary/50 font-bold"
                      : "bg-[#FAF7F2] text-stone-700 border-stone-200 hover:border-gold-primary hover:bg-gold-light/20"
                  }`}
                >
                  <span>{t}</span>
                  {isSelected && (
                    <span className="block text-[9px] uppercase tracking-wider text-white/90 mt-0.5">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-primary inline-block"></span>
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FAF7F2] border border-stone-300 inline-block"></span>
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-200 inline-block"></span>
              Booked / Elapsed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
