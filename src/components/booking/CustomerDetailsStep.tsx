"use client";

import { useState } from "react";
import Image from "next/image";
import { ServiceItem, SpecialistItem } from "@/types";
import { formatRitualDuration, calculateTotalInvestment } from "@/components/booking/ServiceSelectionStep";
import { Sparkles, Calendar, Clock, User, ShieldCheck, Upload, Trash2, Loader2, AlertCircle } from "lucide-react";

interface CustomerDetailsStepProps {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  occasion: string;
  specialNotes: string;
  selectedServices: ServiceItem[];
  selectedStaff: SpecialistItem | null;
  selectedDate: string;
  selectedTime: string;
  depositSlipUrl?: string;
  onClientNameChange: (val: string) => void;
  onClientPhoneChange: (val: string) => void;
  onClientEmailChange: (val: string) => void;
  onOccasionChange: (val: string) => void;
  onSpecialNotesChange: (val: string) => void;
  onDepositSlipUrlChange?: (val: string) => void;
}

export default function CustomerDetailsStep({
  clientName,
  clientPhone,
  clientEmail,
  occasion,
  specialNotes,
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTime,
  depositSlipUrl = "",
  onClientNameChange,
  onClientPhoneChange,
  onClientEmailChange,
  onOccasionChange,
  onSpecialNotesChange,
  onDepositSlipUrlChange
}: CustomerDetailsStepProps) {
  const totalDuration = formatRitualDuration(selectedServices);
  const totalInvestment = calculateTotalInvestment(selectedServices);

  const hasBridal = selectedServices.some((s) => s.category === "bridal");
  const depositRequired = selectedServices.reduce((sum, s) => {
    return s.category === "bridal" ? sum + Math.round(s.priceLKR * 0.2) : sum;
  }, 0);
  const balanceAtSalon = Math.max(0, totalInvestment - depositRequired);

  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [slipUploadError, setSlipUploadError] = useState<string | null>(null);

  const handleSlipFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setSlipUploadError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSlipUploadError("Bank slip must be under 5MB.");
      return;
    }

    setIsUploadingSlip(true);
    setSlipUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isSlip", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload slip image.");
      }

      onDepositSlipUrlChange?.(data.url);
    } catch (err: any) {
      console.error("Slip upload error:", err);
      setSlipUploadError(err.message || "Failed to upload bank slip.");
    } finally {
      setIsUploadingSlip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-900">
          4. Guest Information & Preferences
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          We will send your reservation code and confirmation directly to your phone.
        </p>
      </div>

      {/* Itemized Ritual Summary Card */}
      {selectedServices.length > 0 && (
        <div className="bg-[#FAF7F2] rounded-xl p-5 border border-gold-primary/30 space-y-3">
          <div className="flex items-center justify-between border-b border-gold-primary/20 pb-2">
            <span className="text-xs uppercase font-semibold text-gold-deep tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reserved Beauty Ritual</span>
            </span>
            <span className="text-xs text-stone-500 font-light">
              {selectedServices.length} {selectedServices.length === 1 ? "Treatment" : "Treatments"}
            </span>
          </div>

          <div className="divide-y divide-stone-200/60 text-xs">
            {selectedServices.map((service, idx) => (
              <div key={service.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-stone-900">
                    {idx + 1}. {service.name}
                  </span>
                  <span className="text-[11px] text-stone-500 block font-light">
                    {service.categoryName} • {service.durationFormatted}
                  </span>
                </div>
                <span className="font-serif font-bold text-stone-900">
                  LKR {service.priceLKR.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gold-primary/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-stone-600">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-deep" />
                <span>{selectedDate} at {selectedTime}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gold-deep" />
                <span>{selectedStaff?.name || "Any Specialist"}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold-deep" />
                <span>{totalDuration}</span>
              </span>
            </div>
            <div className="text-right">
              {hasBridal ? (
                <div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                      Advance Deposit (20%):
                    </span>
                    <span className="font-serif font-bold text-amber-900">
                      LKR {depositRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>Balance at Salon:</span>
                    <span className="font-serif font-bold text-stone-800">
                      LKR {balanceAtSalon.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Total Payable at Salon</span>
                  <span className="font-serif text-lg font-bold text-gold-deep">
                    LKR {totalInvestment.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bridal Advance Deposit & Bank Transfer Notice */}
      {hasBridal && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-amber-950">
                Bridal Reservation & Bank Transfer Policy
              </h3>
              <p className="text-xs text-amber-900/80 font-light mt-0.5">
                Bespoke bridal dressings require a 20% advance deposit (<strong>LKR {depositRequired.toLocaleString()}</strong>) to lock our master specialist schedule. Standard treatments require zero deposit.
              </p>
            </div>
          </div>

          {/* Salon Bank Account Card */}
          <div className="bg-white/80 rounded-lg p-3.5 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Bank & Branch</span>
              <span className="font-semibold text-stone-900">Commercial Bank of Ceylon PLC</span>
              <span className="text-stone-500 block text-[11px]">Aluthgama Branch</span>
            </div>
            <div>
              <span className="text-stone-400 block uppercase tracking-wider text-[10px]">Account Name & Number</span>
              <span className="font-semibold text-stone-900">Salon EyeLines (Pvt) Ltd</span>
              <span className="font-mono font-bold text-gold-deep block text-sm">1000 8492 0192</span>
            </div>
          </div>

          {/* Slip Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-950">
              Upload Bank Transfer Slip (Optional now — can also send via WhatsApp)
            </label>

            {depositSlipUrl ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-300">
                <div className="relative w-12 h-12 rounded overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  <Image
                    src={depositSlipUrl}
                    alt="Deposit Receipt"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-emerald-800 block truncate">
                    Bank Slip Attached Successfully
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    Our team will verify your receipt upon submission.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDepositSlipUrlChange?.("")}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                  title="Remove uploaded slip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto px-4 py-2.5 bg-white border border-dashed border-amber-400 hover:border-gold-deep rounded-lg text-xs font-semibold text-amber-900 flex items-center justify-center gap-2 cursor-pointer transition shadow-xs">
                  {isUploadingSlip ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-deep" />
                  ) : (
                    <Upload className="w-4 h-4 text-amber-700" />
                  )}
                  <span>{isUploadingSlip ? "Uploading Slip..." : "Choose Slip Image (PNG, JPG)"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleSlipFileUpload}
                    disabled={isUploadingSlip}
                  />
                </label>
                <span className="text-[11px] text-amber-800/80 font-light">
                  Max 5MB • Receipt image with date and reference
                </span>
              </div>
            )}

            {slipUploadError && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{slipUploadError}</span>
              </p>
            )}

            <p className="text-[11px] text-amber-900/70 font-light pt-1">
              ✨ <strong>Dual Submission Option:</strong> You can upload your slip here now, or submit your tentative booking and send the receipt to our WhatsApp concierge (+94 77 547 4996) within 24 hours.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label htmlFor="client-name-input" className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="client-name-input"
            type="text"
            name="name"
            autoComplete="name"
            aria-required="true"
            placeholder="e.g. Nayomi Senanayake"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-deep min-h-[48px]"
          />
        </div>

        <div>
          <label htmlFor="client-phone-input" className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
            Phone (WhatsApp Number) <span className="text-red-500">*</span>
          </label>
          <input
            id="client-phone-input"
            type="tel"
            name="tel"
            autoComplete="tel"
            aria-required="true"
            placeholder="e.g. 077 547 4996"
            value={clientPhone}
            onChange={(e) => onClientPhoneChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-deep min-h-[48px]"
          />
        </div>

        <div>
          <label htmlFor="client-email-input" className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
            Email Address (Optional)
          </label>
          <input
            id="client-email-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="e.g. name@example.com"
            value={clientEmail}
            onChange={(e) => onClientEmailChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-deep min-h-[48px]"
          />
        </div>

        <div>
          <label htmlFor="client-occasion-select" className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
            Event / Occasion
          </label>
          <select
            id="client-occasion-select"
            value={occasion}
            onChange={(e) => onOccasionChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-deep min-h-[48px]"
          >
            <option value="Regular Care & Grooming">Regular Care & Grooming</option>
            <option value="Bridal Wedding Ceremony">Bridal Wedding Ceremony</option>
            <option value="Homecoming / Engagement">Homecoming / Engagement</option>
            <option value="Special Party or Function">Special Party or Function</option>
            <option value="Pre-Bridal Skincare Trial">Pre-Bridal Skincare Trial</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="client-notes-textarea" className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-1.5">
            Special Notes / Skin Sensitivities / Auspicious Timings
          </label>
          <textarea
            id="client-notes-textarea"
            rows={3}
            placeholder="Mention any allergies, hair texture notes, or auspicious Nekath timings..."
            value={specialNotes}
            onChange={(e) => onSpecialNotesChange(e.target.value)}
            className="w-full p-3.5 rounded-lg border border-gold-primary/40 bg-[#FAF7F2] text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-deep"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
