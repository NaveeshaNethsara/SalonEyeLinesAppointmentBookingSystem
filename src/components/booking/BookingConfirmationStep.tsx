"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquare, Download, Sparkles, ShieldAlert, Clock } from "lucide-react";
import { AppointmentRecord, SpecialistItem, ServiceItem } from "@/types";
import { SALON_INFO } from "@/lib/data";
import LuxuryReceiptModal from "@/components/LuxuryReceiptModal";

interface BookingConfirmationStepProps {
  confirmedBooking: AppointmentRecord;
  selectedStaff: SpecialistItem | null;
  selectedServices: ServiceItem[];
}

export default function BookingConfirmationStep({
  confirmedBooking,
  selectedStaff,
  selectedServices
}: BookingConfirmationStepProps) {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const isPendingDeposit = confirmedBooking.status === "PENDING_DEPOSIT";
  const depositRequired = confirmedBooking.depositRequiredLKR || Math.round(confirmedBooking.totalPriceLKR * 0.2);
  const balanceAtSalon = Math.max(0, confirmedBooking.totalPriceLKR - depositRequired);

  // Construct direct WhatsApp message URL with all itemized treatments
  const getWhatsAppSalonLink = () => {
    if (!confirmedBooking) return "";
    const cleanNumber = SALON_INFO.phoneInternational.replace(/[^0-9]/g, "");
    const treatmentText =
      selectedServices.length > 1
        ? selectedServices.map((s, idx) => `${idx + 1}. ${s.name} (LKR ${s.priceLKR.toLocaleString()})`).join("\n")
        : confirmedBooking.serviceName;

    const depositNotice = isPendingDeposit
      ? `• Deposit Required: LKR ${depositRequired.toLocaleString()}\n` +
        `• Bank Slip: ${confirmedBooking.depositSlipUrl ? "Attached online" : "Attaching photo to this chat"}\n`
      : "";

    const msg =
      `Hello Salon EyeLines,\n\n` +
      `I have just booked a bespoke appointment online:\n` +
      `• Ref: ${confirmedBooking.referenceCode}\n` +
      `• Treatments:\n${treatmentText}\n` +
      `• Specialist: ${confirmedBooking.staffName}\n` +
      `• Date & Time: ${confirmedBooking.date} at ${confirmedBooking.time}\n` +
      `• Total Investment: LKR ${confirmedBooking.totalPriceLKR.toLocaleString()}\n` +
      depositNotice +
      `• Guest: ${confirmedBooking.clientName}\n\n` +
      `${isPendingDeposit ? "Please verify my bank deposit and confirm the reservation. Thank you!" : "Please confirm receipt. Thank you!"}`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="text-center py-6 space-y-6">
      <div className="relative w-20 h-20 mx-auto">
        <div
          className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
            isPendingDeposit ? "bg-amber-200" : "bg-green-200"
          }`}
        />
        <div
          className={`relative w-20 h-20 rounded-full mx-auto flex items-center justify-center animate-scale-pop shadow-md ${
            isPendingDeposit ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isPendingDeposit ? <Clock className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-3xl font-light text-stone-900">
          {isPendingDeposit
            ? "Bridal Reservation Held — Deposit Verification Pending"
            : "Appointment Successfully Reserved!"}
        </h2>
        <p className="text-sm text-stone-500 font-light mt-1 max-w-lg mx-auto">
          {isPendingDeposit
            ? `Thank you, ${confirmedBooking.clientName}. Your bridal specialist slot is reserved for 24 hours while reception verifies your bank transfer.`
            : `Thank you, ${confirmedBooking.clientName}. Your bespoke appointment has been confirmed with Salon EyeLines.`}
        </p>
      </div>

      <div className="inline-block bg-espresso-900 text-gold-primary font-serif text-2xl font-bold px-6 py-2 rounded-lg border border-gold-primary/40 tracking-wider shadow-sm">
        Reference: {confirmedBooking.referenceCode}
      </div>

      {isPendingDeposit && (
        <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 text-left flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Advance Deposit Verification in Progress</span>
            <span className="text-amber-800 font-light block mt-0.5">
              Once verified by our concierge team, you will receive an official confirmation via WhatsApp.
            </span>
          </div>
        </div>
      )}

      {/* Itemized Receipt Summary */}
      <div className="max-w-md mx-auto bg-[#FAF7F2] rounded-xl p-6 border border-gold-primary/30 text-left text-sm space-y-3">
        <div>
          <span className="text-xs uppercase font-semibold text-gold-deep tracking-wider block mb-1">
            Reserved Treatments ({selectedServices.length > 0 ? selectedServices.length : 1})
          </span>
          <div className="space-y-1.5 divide-y divide-stone-200/60">
            {selectedServices.length > 0 ? (
              selectedServices.map((s, idx) => (
                <div key={s.id} className="pt-1.5 first:pt-0 flex justify-between items-center text-xs">
                  <span className="font-medium text-stone-900">
                    {idx + 1}. {s.name}
                  </span>
                  <span className="font-serif text-stone-700">
                    LKR {s.priceLKR.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-stone-900">{confirmedBooking.serviceName}</span>
                <span className="font-serif text-stone-700">
                  LKR {confirmedBooking.totalPriceLKR.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gold-primary/20 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500 font-light">Assigned Specialist:</span>
            <span className="font-medium text-stone-900">{confirmedBooking.staffName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-light">Date & Time:</span>
            <span className="font-medium text-stone-900">{confirmedBooking.date} at {confirmedBooking.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-light">Location:</span>
            <span className="font-medium text-stone-900">48, Ganegama Road, Aluthgama</span>
          </div>
        </div>

        {isPendingDeposit ? (
          <div className="pt-3 border-t border-gold-primary/30 space-y-1.5 text-xs">
            <div className="flex justify-between text-amber-900 font-semibold">
              <span>Advance Deposit (20%):</span>
              <span className="font-serif text-sm">LKR {depositRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Balance at Salon:</span>
              <span className="font-serif text-sm font-bold text-stone-900">LKR {balanceAtSalon.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 text-stone-900 font-bold border-t border-stone-200">
              <span>Total Ritual Investment:</span>
              <span className="text-gold-deep font-serif text-base">
                LKR {confirmedBooking.totalPriceLKR.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between pt-3 border-t border-gold-primary/30 text-base font-bold text-stone-900">
            <span>Total Payable at Salon:</span>
            <span className="text-gold-deep font-serif text-xl">
              LKR {confirmedBooking.totalPriceLKR.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* WhatsApp & Print Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <a
          href={getWhatsAppSalonLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-luxury shimmer-gold inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded shadow transition"
        >
          <MessageSquare className="w-4 h-4" />
          Notify Salon on WhatsApp
        </a>

        <button
          type="button"
          onClick={() => setIsReceiptModalOpen(true)}
          className="btn-luxury inline-flex items-center justify-center gap-2 bg-white border border-stone-300 hover:border-gold-primary text-stone-700 text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded transition shadow-sm hover:shadow cursor-pointer"
        >
          <Download className="w-4 h-4 text-gold-deep" />
          <span>Download / Print Receipt</span>
        </button>

        <Link
          href="/appointments"
          className="btn-luxury inline-flex items-center justify-center gap-2 bg-espresso-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded transition"
        >
          View in My Bookings
        </Link>
      </div>

      {/* Luxury Official Receipt Modal */}
      <LuxuryReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        booking={confirmedBooking}
        specialist={selectedStaff}
        service={selectedServices[0] || null}
      />
    </div>
  );
}
