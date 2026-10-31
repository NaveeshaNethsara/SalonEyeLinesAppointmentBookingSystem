"use client";

import { useState } from "react";
import { Search, X, Check, CalendarClock, MessageCircle, ExternalLink, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { AppointmentRecord } from "@/types";

export function getDepositHoldStatus(appt: AppointmentRecord): {
  isExpired: boolean;
  isUrgent: boolean;
  hoursLeft: number;
  label: string;
} {
  const createdAt = appt.createdAt ? new Date(appt.createdAt).getTime() : 0;
  const now = Date.now();
  const holdExpiryMs = createdAt ? createdAt + 24 * 60 * 60 * 1000 : 0;

  let apptStartMs = Infinity;
  if (appt.date && appt.time) {
    const d = new Date(`${appt.date}T${appt.time}:00+05:30`).getTime();
    if (!isNaN(d)) {
      apptStartMs = d;
    }
  }

  const effectiveExpiryMs = Math.min(holdExpiryMs || Infinity, apptStartMs);

  if (effectiveExpiryMs === Infinity) {
    return { isExpired: false, isUrgent: false, hoursLeft: 24, label: "24h Hold" };
  }

  const msLeft = effectiveExpiryMs - now;
  if (msLeft <= 0) {
    return { isExpired: true, isUrgent: true, hoursLeft: 0, label: "Hold Expired" };
  }

  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
  const isUrgent = hoursLeft <= 4;
  return {
    isExpired: false,
    isUrgent,
    hoursLeft,
    label: `${hoursLeft}h left`,
  };
}

interface AdminAppointmentsTabProps {
  appointments: AppointmentRecord[];
  isLoading?: boolean;
  onUpdateStatus: (refCode: string, newStatus: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") => Promise<void>;
  onOpenReschedule: (appt: AppointmentRecord) => void;
  onOpenWhatsAppModal: (appt: AppointmentRecord) => void;
  onOpenDepositReview?: (appt: AppointmentRecord) => void;
  onSweepExpiredDeposits?: () => Promise<void>;
  isSweepingExpired?: boolean;
  formatWhatsAppPhone: (phone: string) => string;
  getPreWrittenWhatsAppMessage: (appt: AppointmentRecord, type?: "confirmation" | "reminder" | "thankyou" | "deposit_verified" | "deposit_expired") => string;
}

export default function AdminAppointmentsTab({
  appointments,
  isLoading = false,
  onUpdateStatus,
  onOpenReschedule,
  onOpenWhatsAppModal,
  onOpenDepositReview,
  onSweepExpiredDeposits,
  isSweepingExpired = false,
  formatWhatsAppPhone,
  getPreWrittenWhatsAppMessage,
}: AdminAppointmentsTabProps) {
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<
    "ALL" | "PENDING_DEPOSIT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  >("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  const pendingDepositCount = appointments.filter((a) => a.status === "PENDING_DEPOSIT").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const inProgressCount = appointments.filter((a) => a.status === "IN_PROGRESS").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length;

  const isInitialLoading = isLoading && appointments.length === 0;

  const filteredAppointments = appointments.filter((a) => {
    // 1. Status Filter
    if (appointmentStatusFilter !== "ALL" && a.status !== appointmentStatusFilter) {
      return false;
    }
    // 2. Search Query Filter
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      a.clientName.toLowerCase().includes(q) ||
      a.referenceCode.toLowerCase().includes(q) ||
      a.serviceName.toLowerCase().includes(q) ||
      a.staffName.toLowerCase().includes(q) ||
      a.clientPhone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { key: "ALL", label: isInitialLoading ? "All" : `All (${appointments.length})` },
            { key: "PENDING_DEPOSIT", label: isInitialLoading ? "Pending Deposit" : `Pending Deposit (${pendingDepositCount})`, isAlert: pendingDepositCount > 0 },
            { key: "CONFIRMED", label: isInitialLoading ? "Upcoming" : `Upcoming (${confirmedCount})` },
            { key: "IN_PROGRESS", label: isInitialLoading ? "In Session" : `In Session (${inProgressCount})` },
            { key: "COMPLETED", label: isInitialLoading ? "Completed" : `Completed (${completedCount})` },
            { key: "CANCELLED", label: isInitialLoading ? "Cancelled" : `Cancelled (${cancelledCount})` },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setAppointmentStatusFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                appointmentStatusFilter === f.key
                  ? "bg-gold-primary text-white shadow-xs font-bold"
                  : f.key === "PENDING_DEPOSIT" && f.isAlert
                  ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 font-bold"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-gold-primary/60 hover:text-stone-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Box & Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {pendingDepositCount > 0 && onSweepExpiredDeposits && (
            <button
              type="button"
              onClick={onSweepExpiredDeposits}
              disabled={isSweepingExpired}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="Reconcile and cancel all pending deposit reservations whose 24-hour verification window has elapsed"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSweepingExpired ? "animate-spin" : ""}`} />
              <span>{isSweepingExpired ? "Sweeping..." : "Sweep Expired Holds"}</span>
            </button>
          )}

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search client, ref, service..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-gold-primary/50 transition"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-gold-primary/30 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF7F2] text-stone-900 uppercase font-semibold border-b border-gold-primary/20 tracking-wider">
              <tr>
                <th className="p-4">Ref Code</th>
                <th className="p-4">Client</th>
                <th className="p-4">Treatment</th>
                <th className="p-4">Specialist</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Investment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isInitialLoading ? (
                <>
                  <tr>
                    <td colSpan={8} className="p-4 bg-gradient-to-r from-gold-50/50 via-gold-100/40 to-gold-50/50 border-b border-gold-primary/20 text-center">
                      <div className="inline-flex items-center justify-center gap-2.5 text-xs font-semibold text-gold-deep">
                        <RefreshCw className="w-4 h-4 animate-spin text-gold-primary" />
                        <span>Connecting to PostgreSQL Master Ledger... Retrieving active appointments & client schedules</span>
                      </div>
                    </td>
                  </tr>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <tr key={`skeleton-row-${idx}`} className="animate-pulse">
                      <td className="p-4">
                        <div className="h-4 bg-gold-200/50 rounded w-20" />
                      </td>
                      <td className="p-4 space-y-1.5">
                        <div className="h-4 bg-stone-200/80 rounded w-36" />
                        <div className="h-3 bg-stone-200/50 rounded w-24" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-stone-200/70 rounded w-48" />
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-stone-200/60 rounded w-28" />
                      </td>
                      <td className="p-4 space-y-1.5">
                        <div className="h-4 bg-stone-200/80 rounded w-20" />
                        <div className="h-3 bg-stone-200/50 rounded w-16" />
                      </td>
                      <td className="p-4">
                        <div className="h-5 bg-stone-200/80 rounded w-24" />
                      </td>
                      <td className="p-4">
                        <div className="h-6 bg-stone-200/60 rounded-full w-24" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-block h-7 bg-stone-200/60 rounded-md w-28" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400 italic font-light">
                    No reservations match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((a) => (
                  <tr key={a.referenceCode} className="hover:bg-gold-light/10 transition">
                    <td className="p-4 font-mono font-medium text-gold-deep">
                      {a.referenceCode}
                    </td>
                    <td className="p-4">
                      <strong className="block text-stone-900">{a.clientName}</strong>
                      <span className="text-[11px] text-stone-500">{a.clientPhone}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-900">
                      {a.serviceName}
                    </td>
                    <td className="p-4 text-stone-600">
                      {a.staffName}
                    </td>
                    <td className="p-4">
                      <span className="block font-medium">{a.date}</span>
                      <span className="text-stone-500 text-[11px]">{a.time}</span>
                    </td>
                    <td className="p-4 font-serif text-sm font-bold text-stone-900">
                      LKR {a.totalPriceLKR.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {a.status === "PENDING_DEPOSIT" ? (() => {
                        const hold = getDepositHoldStatus(a);
                        return (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Deposit
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                hold.isExpired
                                  ? "bg-rose-50 text-rose-800 border-rose-300 animate-pulse font-bold"
                                  : hold.isUrgent
                                  ? "bg-amber-100 text-amber-900 border-amber-400 font-bold"
                                  : "bg-stone-50 text-stone-600 border-stone-200"
                              }`}>
                                <Clock className="w-3 h-3 text-stone-500" />
                                <span>{hold.label}</span>
                              </span>
                            </div>
                            {a.depositRequiredLKR ? (
                              <span className="block text-[10px] text-amber-700 font-medium">
                                Req: LKR {a.depositRequiredLKR.toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        );
                      })() : a.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Confirmed
                        </span>
                      ) : a.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          In Session
                        </span>
                      ) : a.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <X className="w-3 h-3 text-rose-500" />
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {a.status === "PENDING_DEPOSIT" && (
                        <button
                          type="button"
                          onClick={() => onOpenDepositReview?.(a)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                          title="Review customer bank deposit slip and verify booking"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Review Slip</span>
                        </button>
                      )}
                      {(a.status === "CONFIRMED" || a.status === "IN_PROGRESS" || a.status === "PENDING_DEPOSIT") && (
                        <>
                          {a.status !== "PENDING_DEPOSIT" && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(a.referenceCode, "COMPLETED")}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200 transition cursor-pointer"
                              title="Mark appointment as completed"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(a.referenceCode, "CANCELLED")}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200 transition cursor-pointer"
                            title="Cancel appointment"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenReschedule(a)}
                        className="px-2 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded text-[11px] font-semibold border border-amber-200 inline-flex items-center gap-1 transition cursor-pointer"
                        title="Reschedule to a future date or time slot"
                      >
                        <CalendarClock className="w-3 h-3 text-amber-700" />
                        <span>Reschedule</span>
                      </button>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenWhatsAppModal(a)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title="Open WhatsApp Concierge to preview & send pre-written appointment message"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                        <a
                          href={`https://web.whatsapp.com/send?phone=${formatWhatsAppPhone(a.clientPhone)}&text=${encodeURIComponent(getPreWrittenWhatsAppMessage(a, "confirmation"))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded text-[11px] transition"
                          title="Instant Send via WhatsApp Web"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
