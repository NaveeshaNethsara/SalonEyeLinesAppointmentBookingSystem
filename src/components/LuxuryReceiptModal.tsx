"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Printer,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Phone,
  Check,
  Sparkles
} from "lucide-react";
import { AppointmentRecord, SpecialistItem, ServiceItem } from "@/types";

interface LuxuryReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AppointmentRecord | null;
  specialist?: SpecialistItem | null;
  service?: ServiceItem | null;
}

export default function LuxuryReceiptModal({
  isOpen,
  onClose,
  booking,
  specialist,
  service
}: LuxuryReceiptModalProps) {
  const [downloadingType, setDownloadingType] = useState<"pdf" | "image" | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // HIG Modality: Dismiss modal with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptCanvas = async () => {
    const receiptElement = document.getElementById("salon-luxury-receipt");
    if (!receiptElement) throw new Error("Receipt element not found");

    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default;

    return await html2canvas(receiptElement, {
      scale: 2.2, // Crisp 2.2x Retina rendering
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY
    });
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingType("pdf");
      const canvas = await generateReceiptCanvas();
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pageHeight - margin * 2) {
        // Fits on single page, position nicely
        const topMargin = Math.max(margin, (pageHeight - contentHeight) / 3);
        pdf.addImage(imgData, "PNG", margin, topMargin, contentWidth, contentHeight, undefined, "FAST");
      } else {
        // Multi-page if tall
        let heightLeft = contentHeight;
        let position = margin;

        pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight, undefined, "FAST");
        heightLeft -= pageHeight - margin * 2;

        while (heightLeft > 0) {
          position = heightLeft - contentHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight, undefined, "FAST");
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`Salon-EyeLines-Receipt-${booking.referenceCode}.pdf`);
      setDownloadSuccess("PDF downloaded to your device!");
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (error) {
      console.error("Failed to generate downloadable PDF receipt:", error);
      // Fallback: trigger print dialog
      window.print();
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setDownloadingType("image");
      const canvas = await generateReceiptCanvas();

      const imageBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0)
      );

      if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Salon-EyeLines-Receipt-${booking.referenceCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        setDownloadSuccess("Image downloaded to your device!");
        setTimeout(() => setDownloadSuccess(null), 3500);
      } else {
        // Data URL fallback
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Salon-EyeLines-Receipt-${booking.referenceCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess("Image downloaded to your device!");
        setTimeout(() => setDownloadSuccess(null), 3500);
      }
    } catch (error) {
      console.error("Failed to generate downloadable receipt image:", error);
      window.print();
    } finally {
      setDownloadingType(null);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-6 cursor-default">
        {/* Floating Action Controls Header (Hidden on Print) */}
        <div className="no-print mb-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-espresso-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gold-primary/40">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span id="receipt-dialog-title" className="text-gold-light font-medium tracking-wide block">
                Official Reservation Receipt Ready
              </span>
              <span className="text-[10px] text-stone-300">
                Download to your phone or computer anytime
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Download as PDF Button */}
            <button
              type="button"
              disabled={!!downloadingType}
              onClick={handleDownloadPDF}
              className="btn-luxury shimmer-gold bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 min-h-[40px]"
              title="Download official PDF document directly to your device"
            >
              {downloadingType === "pdf" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-emerald-200" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Download as High-Res Image Button */}
            <button
              type="button"
              disabled={!!downloadingType}
              onClick={handleDownloadImage}
              className="btn-luxury bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 min-h-[40px]"
              title="Download crystal-clear high-res PNG image to your photo gallery"
            >
              {downloadingType === "image" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Image...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-200" />
                  <span>Download Image</span>
                </>
              )}
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="btn-luxury bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 hover:text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition min-h-[40px]"
              title="Open print dialog"
            >
              <Printer className="w-4 h-4 text-gold-light" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-stone-200 hover:text-white transition cursor-pointer ml-1"
              aria-label="Close reservation receipt dialog"
              title="Close Receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {downloadSuccess && (
          <div className="no-print mb-4 p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{downloadSuccess}</span>
          </div>
        )}

        {/* ==========================================================================
            THE LUXURY RECEIPT (Rendered on screen, captured by html2canvas & Print)
            ========================================================================== */}
        <div
          id="salon-luxury-receipt"
          className="bg-white text-stone-900 rounded-2xl p-6 sm:p-10 shadow-2xl border-4 border-double border-[#C5A880] relative overflow-hidden"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {/* Subtle Watermark Logo in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <div className="w-96 h-96 relative">
              <Image
                src="/images/salon_eyelines_logo.jpg"
                alt="Salon EyeLines Seal"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-[#C5A880] text-xs select-none">✦</div>
          <div className="absolute top-2 right-2 text-[#C5A880] text-xs select-none">✦</div>
          <div className="absolute bottom-2 left-2 text-[#C5A880] text-xs select-none">✦</div>
          <div className="absolute bottom-2 right-2 text-[#C5A880] text-xs select-none">✦</div>

          {/* 1. RECEIPT HEADER */}
          <div className="text-center space-y-2 border-b-2 border-[#C5A880]/30 pb-6">
            <div className="w-16 h-16 mx-auto rounded-full p-0.5 border-2 border-[#C5A880] shadow-sm overflow-hidden relative mb-2">
              <Image
                src="/images/salon_eyelines_logo.jpg"
                alt="Salon EyeLines"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-normal text-stone-900 tracking-wider">
              SALON EYELINES
            </h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C6A42] font-sans font-semibold">
              Haute Beauté &amp; Bridal Sanctuary • Aluthgama, Sri Lanka
            </p>
            <p className="text-xs text-stone-500 font-sans font-light">
              48, Ganegama Road, Aluthgama 12080 • Hotline: 077 547 4996 • WhatsApp: +94 77 547 4996
            </p>
          </div>

          {/* 2. RECEIPT BANNER & REFERENCE */}
          <div className="my-6 bg-[#FAF7F2] p-4 rounded-xl border border-[#C5A880]/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C6A42] font-semibold block">
                Official Booking Pass &amp; Receipt
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900 tracking-wider">
                Ref: {booking.referenceCode}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                Issue Date: {currentDateFormatted}
              </span>
            </div>

            <div className="text-right sm:text-right flex flex-col items-center sm:items-end">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONFIRMED RESERVATION</span>
              </span>
              <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">
                Status: Verified by Concierge
              </span>
            </div>
          </div>

          {/* 3. TWO-COLUMN CLIENT & APPOINTMENT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-stone-200 font-sans text-xs">
            {/* Left: Guest Information */}
            <div className="space-y-2.5 bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
              <span className="text-[10px] uppercase tracking-wider text-[#8C6A42] font-bold block border-b border-stone-200 pb-1">
                Guest Information
              </span>
              <div className="flex justify-between">
                <span className="text-stone-500">Client Name:</span>
                <strong className="text-stone-900 font-serif text-sm">{booking.clientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Contact / WhatsApp:</span>
                <span className="text-stone-800 font-mono font-medium">{booking.clientPhone}</span>
              </div>
              {booking.clientEmail && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span className="text-stone-800">{booking.clientEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Occasion:</span>
                <span className="text-stone-800 font-medium">{booking.occasion || "Personal Beauty Care"}</span>
              </div>
              {booking.specialNotes && (
                <div className="pt-1 text-[11px] text-stone-600 border-t border-stone-200">
                  <span className="italic">&ldquo;{booking.specialNotes}&rdquo;</span>
                </div>
              )}
            </div>

            {/* Right: Appointment Window & Artisan */}
            <div className="space-y-2.5 bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
              <span className="text-[10px] uppercase tracking-wider text-[#8C6A42] font-bold block border-b border-stone-200 pb-1">
                Schedule &amp; Artisan
              </span>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Assigned Stylist:</span>
                <div className="flex items-center gap-1.5 text-right">
                  {specialist?.avatar ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden relative border border-[#C5A880]">
                      <Image
                        src={specialist.avatar}
                        alt={booking.staffName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <strong className="text-stone-900 font-medium">{booking.staffName}</strong>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date:</span>
                <strong className="text-stone-900">{booking.date}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Time Window:</span>
                <strong className="text-[#8C6A42] font-bold">{booking.time}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Salon Sanctum:</span>
                <span className="text-stone-800">Private Suite, Ganegama Road</span>
              </div>
            </div>
          </div>

          {/* 4. TREATMENT ITEMIZATION TABLE */}
          <div className="py-6 font-sans">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6A42] font-bold block mb-3">
              Treatment Itemization
            </span>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-[#C5A880]/30 text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-semibold">Service Description</th>
                  <th className="py-2.5 font-semibold text-center">Stylist</th>
                  <th className="py-2.5 font-semibold text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-3.5 pr-2">
                    <p className="font-serif text-sm font-medium text-stone-900">{booking.serviceName}</p>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">
                      Bespoke salon experience with premium certified formulations.
                    </p>
                  </td>
                  <td className="py-3.5 text-center text-stone-700 whitespace-nowrap">
                    {booking.staffName}
                  </td>
                  <td className="py-3.5 text-right font-serif text-sm font-semibold text-stone-900 whitespace-nowrap">
                    LKR {booking.totalPriceLKR.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. FINANCIAL TOTALS BOX */}
          <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#C5A880]/40 font-sans space-y-2">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Treatment Subtotal:</span>
              <span>LKR {booking.totalPriceLKR.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Sanitization &amp; Service Fee:</span>
              <span className="text-emerald-700 font-medium">Included (Complimentary)</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Advance Deposit:</span>
              <span>LKR 0 (Pay on Arrival)</span>
            </div>
            <div className="border-t border-[#C5A880]/30 pt-2 flex justify-between items-baseline">
              <div>
                <span className="font-serif text-base font-bold text-stone-900 block">
                  Total Payable at Salon:
                </span>
                <span className="text-[10px] text-stone-500 font-light">
                  Cash, Credit/Debit Card, or Bank Transfer accepted at counter
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-[#8C6A42]">
                LKR {booking.totalPriceLKR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 6. SALON ETIQUETTE & GUIDELINES */}
          <div className="mt-6 pt-5 border-t border-stone-200 font-sans text-[11px] text-stone-500 grid grid-cols-1 sm:grid-cols-3 gap-3 leading-relaxed">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <span>Please arrive 5–10 mins prior to your slot to savor our Ceylon herbal tea.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <span>Hospital autoclave sterilized instruments &amp; single-use disposables.</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <span>To reschedule or inquire, WhatsApp our concierge directly at +94 77 547 4996.</span>
            </div>
          </div>

          {/* 7. AUTHENTICATION & FOUNDER SIGN-OFF */}
          <div className="mt-8 pt-6 border-t-2 border-[#C5A880]/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <div className="text-center sm:text-left space-y-1">
              <p className="font-serif text-sm italic text-stone-800">
                &ldquo;Every woman carries a singular elegance that simply awaits its true definition.&rdquo;
              </p>
              <p className="text-[11px] text-stone-500">
                Thank you for reserving your beauty sanctuary with Salon EyeLines.
              </p>
            </div>

            {/* Founder Digital Seal */}
            <div className="text-center sm:text-right flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-[#C5A880] flex flex-col items-center justify-center text-[8px] text-[#8C6A42] font-semibold tracking-tighter uppercase p-1 bg-white shadow-xs">
                <span>Salon</span>
                <span className="font-serif font-bold text-[10px]">EyeLines</span>
                <span>Verified</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-serif italic text-base text-stone-900 block leading-none">
                  Nayani Munasinghe
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-500 block mt-1">
                  Founder &amp; Master Bridal Director
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden on Print) */}
        <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3 bg-espresso-950/90 p-4 rounded-2xl border border-gold-primary/30 shadow-xl">
          <button
            type="button"
            disabled={!!downloadingType}
            onClick={handleDownloadPDF}
            className="btn-luxury shimmer-gold bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            {downloadingType === "pdf" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading PDF to Device...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-emerald-200" />
                <span>Download PDF to Device</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!!downloadingType}
            onClick={handleDownloadImage}
            className="btn-luxury bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            {downloadingType === "image" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading PNG to Device...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Image to Device (PNG)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-luxury bg-white border border-stone-300 hover:border-gold-primary text-stone-700 text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition"
          >
            <Printer className="w-4 h-4 text-gold-deep" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
