"use client";

import { useState, useEffect } from "react";
import { X, CalendarClock, RefreshCw } from "lucide-react";
import { AppointmentRecord, SpecialistItem } from "@/types";
import { TIME_SLOTS } from "@/lib/data";
import { isSlotInPast, getTodayColomboDate } from "@/lib/appointments";

interface AdminRescheduleModalProps {
  isOpen: boolean;
  appointment: AppointmentRecord | null;
  staffList: SpecialistItem[];
  onClose: () => void;
  onConfirmReschedule: (
    refCode: string,
    newDate: string,
    newTime: string,
    newStaffId: string
  ) => Promise<void>;
}

export default function AdminRescheduleModal({
  isOpen,
  appointment,
  staffList,
  onClose,
  onConfirmReschedule,
}: AdminRescheduleModalProps) {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleStaffId, setRescheduleStaffId] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    if (appointment) {
      setRescheduleDate(appointment.date);
      setRescheduleTime(appointment.time);
      setRescheduleStaffId(appointment.staffId);
      setRescheduleError("");
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleConfirm = async () => {
    setRescheduleError("");

    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please choose both a new date and a new time slot.");
      return;
    }

    if (isSlotInPast(rescheduleDate, rescheduleTime)) {
      setRescheduleError("Cannot reschedule to a past date or time slot. Please choose an upcoming date and time.");
      return;
    }

    setIsRescheduling(true);
    try {
      await onConfirmReschedule(
        appointment.referenceCode,
        rescheduleDate,
        rescheduleTime,
        rescheduleStaffId
      );
      onClose();
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule appointment.");
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gold-primary/30 space-y-6 animate-scale-up">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Ref: {appointment.referenceCode} • {appointment.clientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Schedule Summary */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gold-primary/20 text-xs space-y-1">
          <div className="flex justify-between text-stone-600">
            <span>Treatment:</span>
            <strong className="text-stone-900">{appointment.serviceName}</strong>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Current Slot:</span>
            <strong className="text-stone-900">{appointment.date} at {appointment.time}</strong>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Specialist:</span>
            <strong className="text-stone-900">{appointment.staffName}</strong>
          </div>
        </div>

        {rescheduleError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {rescheduleError}
          </div>
        )}

        <div className="space-y-4">
          {/* New Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Select New Date
            </label>
            <input
              type="date"
              min={getTodayColomboDate()}
              value={rescheduleDate}
              onChange={(e) => {
                setRescheduleDate(e.target.value);
                setRescheduleError("");
              }}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            />
          </div>

          {/* Specialist Selection */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
              Assigned Specialist
            </label>
            <select
              value={rescheduleStaffId}
              onChange={(e) => setRescheduleStaffId(e.target.value)}
              className="w-full p-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-gold-primary"
            >
              {staffList.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} ({spec.role})
                </option>
              ))}
            </select>
          </div>

          {/* New Time Slot Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700">
                Select Available Time Slot
              </label>
              <span className="text-[11px] text-stone-500">
                *Past slots disabled automatically
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((t) => {
                const isPast = isSlotInPast(rescheduleDate, t);
                const isSelected = rescheduleTime === t;

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      setRescheduleTime(t);
                      setRescheduleError("");
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                      isPast
                        ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50 line-through"
                        : isSelected
                        ? "bg-gold-primary text-white border-gold-primary shadow-xs ring-1 ring-gold-primary font-bold"
                        : "bg-[#FAF7F2] text-stone-700 border-stone-200 hover:border-gold-primary hover:bg-gold-light/20"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isRescheduling}
            onClick={handleConfirm}
            className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRescheduling ? "animate-spin" : ""}`} />
            <span>{isRescheduling ? "Rescheduling..." : "Save New Schedule"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
