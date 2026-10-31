"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Check, 
  Copy, 
  Send, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { AppointmentRecord } from "@/types";

type WhatsAppTemplateType = "confirmation" | "reminder" | "thankyou" | "deposit_verified" | "deposit_expired";

interface AdminWhatsAppModalProps {
  isOpen: boolean;
  appointment: AppointmentRecord | null;
  onClose: () => void;
  formatWhatsAppPhone: (phone: string) => string;
  getPreWrittenWhatsAppMessage: (
    appt: AppointmentRecord,
    type?: WhatsAppTemplateType
  ) => string;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function AdminWhatsAppModal({
  isOpen,
  appointment,
  onClose,
  formatWhatsAppPhone,
  getPreWrittenWhatsAppMessage,
  showToast,
}: AdminWhatsAppModalProps) {
  const [whatsAppMsgType, setWhatsAppMsgType] = useState<WhatsAppTemplateType>("confirmation");
  const [whatsAppCustomText, setWhatsAppCustomText] = useState("");
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState(false);

  useEffect(() => {
    if (appointment) {
      const defaultType: WhatsAppTemplateType = 
        appointment.status === "CANCELLED"
          ? "deposit_expired"
          : appointment.depositPaidLKR
          ? "deposit_verified"
          : "confirmation";
      setWhatsAppMsgType(defaultType);
      setWhatsAppCustomText(getPreWrittenWhatsAppMessage(appointment, defaultType));
      setCopiedWhatsAppMsg(false);
    }
  }, [appointment, isOpen, getPreWrittenWhatsAppMessage]);

  if (!isOpen || !appointment) return null;

  const handleChangeWhatsAppType = (type: WhatsAppTemplateType) => {
    setWhatsAppMsgType(type);
    setWhatsAppCustomText(getPreWrittenWhatsAppMessage(appointment, type));
  };

  const handleSendViaWhatsAppWeb = () => {
    const cleanPhone = formatWhatsAppPhone(appointment.clientPhone);
    const text = encodeURIComponent(whatsAppCustomText);
    const url = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSendViaWhatsAppApp = () => {
    const cleanPhone = formatWhatsAppPhone(appointment.clientPhone);
    const text = encodeURIComponent(whatsAppCustomText);
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsAppCustomText);
    setCopiedWhatsAppMsg(true);
    showToast("WhatsApp appointment message copied to clipboard!", "success");
    setTimeout(() => setCopiedWhatsAppMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-emerald-500/40 shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-espresso-900 p-6 text-white flex justify-between items-center border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold block">
                Client Messaging Concierge
              </span>
              <h3 className="font-serif text-2xl font-light text-white">
                Send WhatsApp DM to Client
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Recipient Details & International Number Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-stone-900">
                  {appointment.clientName}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300">
                  {appointment.referenceCode}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {appointment.serviceName} • {appointment.date} at {appointment.time}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-emerald-900 font-bold block">
                WhatsApp International Format
              </span>
              <p className="font-mono text-sm font-bold text-emerald-700">
                +{formatWhatsAppPhone(appointment.clientPhone)}
              </p>
              <p className="text-[10px] text-stone-500 font-light">
                (Original: {appointment.clientPhone})
              </p>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 font-semibold mb-2">
              Select Pre-Written Message Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleChangeWhatsAppType("confirmation")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${
                  whatsAppMsgType === "confirmation"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-medium">1. Confirmation</span>
                  <span className="text-[10px] font-normal text-stone-500 block">Complete booking details</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeWhatsAppType("reminder")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${
                  whatsAppMsgType === "reminder"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-medium">2. 24h Reminder</span>
                  <span className="text-[10px] font-normal text-stone-500 block">Upcoming visit reminder</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeWhatsAppType("thankyou")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${
                  whatsAppMsgType === "thankyou"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-medium">3. Thank You</span>
                  <span className="text-[10px] font-normal text-stone-500 block">Post-treatment message</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeWhatsAppType("deposit_verified")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${
                  whatsAppMsgType === "deposit_verified"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-medium">4. Deposit Verified</span>
                  <span className="text-[10px] font-normal text-stone-500 block">Bridal advance confirmed</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeWhatsAppType("deposit_expired")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${
                  whatsAppMsgType === "deposit_expired"
                    ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="block font-medium">5. Hold Expired</span>
                  <span className="text-[10px] font-normal text-stone-500 block">24h hold elapsed notice</span>
                </div>
              </button>
            </div>
          </div>

          {/* Message Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-stone-600 font-semibold">
                Pre-Written Message (Editable)
              </label>
              <span className="text-[11px] text-stone-400">
                Supports WhatsApp markdown (*bold*, _italic_)
              </span>
            </div>
            <textarea
              rows={8}
              value={whatsAppCustomText}
              onChange={(e) => setWhatsAppCustomText(e.target.value)}
              className="w-full p-4 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed bg-[#FCFAF7]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleCopyWhatsAppMessage}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copiedWhatsAppMsg ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSendViaWhatsAppApp}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                title="Open via WhatsApp App on Desktop or Mobile"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp App</span>
              </button>

              <button
                type="button"
                onClick={handleSendViaWhatsAppWeb}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition inline-flex items-center justify-center gap-2 cursor-pointer"
                title="Directly opens WhatsApp Web in browser with chat pre-filled"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
