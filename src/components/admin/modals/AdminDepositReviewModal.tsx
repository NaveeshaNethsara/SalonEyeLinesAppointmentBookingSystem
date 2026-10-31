"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, ShieldCheck, ExternalLink, ZoomIn, ZoomOut, AlertCircle, FileText, Banknote, Clock, RotateCw } from "lucide-react";
import { AppointmentRecord } from "@/types";
import { getDepositHoldStatus } from "../tabs/AdminAppointmentsTab";

interface AdminDepositReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRecord | null;
  onConfirmVerify: (refCode: string, depositPaidLKR: number, notes?: string) => Promise<void>;
  onExtendHold?: (refCode: string) => Promise<void>;
  onOpenWhatsAppModal?: (appt: AppointmentRecord) => void;
}

export default function AdminDepositReviewModal({
  isOpen,
  onClose,
  appointment,
  onConfirmVerify,
  onExtendHold,
  onOpenWhatsAppModal
}: AdminDepositReviewModalProps) {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (appointment) {
      setAmountPaid(appointment.depositRequiredLKR || Math.round(appointment.totalPriceLKR * 0.2));
      setNotes("");
      setIsZoomed(false);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmVerify(appointment.referenceCode, amountPaid, notes);
      onClose();
    } catch (err) {
      console.error("Deposit verification error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const balanceLKR = Math.max(0, appointment.totalPriceLKR - (amountPaid || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gold-primary/30 my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Bridal Advance Deposit Verification
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Review bank transfer receipt and confirm high-investment specialist slot.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appointment Context Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-gold-primary/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Reference</span>
            <span className="font-mono font-bold text-gold-deep text-sm">{appointment.referenceCode}</span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Guest</span>
            <span className="font-semibold text-stone-900 block truncate">{appointment.clientName}</span>
            <span className="text-stone-500 text-[11px]">{appointment.clientPhone}</span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Schedule</span>
            <span className="font-medium text-stone-900">{appointment.date}</span>
            <span className="text-stone-500 block text-[11px]">{appointment.time}</span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Total Investment</span>
            <span className="font-serif font-bold text-stone-900 text-sm">
              LKR {appointment.totalPriceLKR.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Deposit Hold Countdown Banner */}
        {(() => {
          const hold = getDepositHoldStatus(appointment);
          return (
            <div
              className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                hold.isExpired
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : hold.isUrgent
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className={`w-4 h-4 shrink-0 ${hold.isExpired ? "text-rose-600 animate-pulse" : hold.isUrgent ? "text-amber-600" : "text-stone-500"}`} />
                <div>
                  <span className="font-bold block">
                    {hold.isExpired ? "24-Hour Hold Window Elapsed" : `Verification Hold: ${hold.label}`}
                  </span>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {hold.isExpired
                      ? "This reservation's deposit window has passed. You can extend the hold by +24 hours or verify the deposit below."
                      : "Unverified bridal reservations are held for 24 hours before automatic slot liberation."}
                  </p>
                </div>
              </div>

              {onExtendHold && (
                <button
                  type="button"
                  onClick={async () => {
                    setIsExtending(true);
                    try {
                      await onExtendHold(appointment.referenceCode);
                    } finally {
                      setIsExtending(false);
                    }
                  }}
                  disabled={isExtending || isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-gold-primary text-stone-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs hover:bg-gold-light/20 transition cursor-pointer disabled:opacity-50 shrink-0"
                  title="Grant customer another 24 hours to submit their deposit slip"
                >
                  <RotateCw className={`w-3 h-3 text-gold-deep ${isExtending ? "animate-spin" : ""}`} />
                  <span>{isExtending ? "Extending..." : "Extend Hold (+24h)"}</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Bank Transfer Receipt Preview */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-deep" />
              <span>Customer Bank Slip Receipt</span>
            </label>
            {appointment.depositSlipUrl && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-xs text-gold-deep hover:text-gold-dark inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? "Shrink" : "Zoom"}</span>
                </button>
                <a
                  href={appointment.depositSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Size</span>
                </a>
              </div>
            )}
          </div>

          {appointment.depositSlipUrl ? (
            <div
              className={`relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 transition-all ${
                isZoomed ? "max-h-[480px]" : "max-h-[260px]"
              } flex items-center justify-center`}
            >
              <Image
                src={appointment.depositSlipUrl}
                alt="Bank Transfer Slip"
                width={800}
                height={600}
                className="w-full h-auto object-contain cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
                unoptimized
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No digital slip uploaded during online checkout.</p>
                <p className="text-amber-800 font-light mt-0.5">
                  The client may have sent the transfer slip via WhatsApp or made a direct cash deposit at reception. Verify the transfer with your bank statement or WhatsApp chat before confirming.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount-paid-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Verified Deposit Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Banknote className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  id="amount-paid-input"
                  type="number"
                  required
                  min={1}
                  max={appointment.totalPriceLKR}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold-primary"
                />
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">
                Required minimum: LKR {(appointment.depositRequiredLKR || 0).toLocaleString()}
              </span>
            </div>

            <div>
              <label htmlFor="notes-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Verification Reference / Notes
              </label>
              <input
                id="notes-input"
                type="text"
                placeholder="e.g. Commercial Bank Tx #893021"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary"
              />
              <span className="text-[11px] text-stone-500 block mt-1">
                Balance remaining at salon: LKR {balanceLKR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Verifying..." : "Verify Deposit & Confirm Booking"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
