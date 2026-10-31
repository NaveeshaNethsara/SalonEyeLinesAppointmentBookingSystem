"use client";

import { useState } from "react";
import { Search, X, ArrowRight, Check, Sparkles, Clock, Trash2 } from "lucide-react";
import { ServiceItem } from "@/types";

interface ServiceSelectionStepProps {
  servicesList: ServiceItem[];
  selectedServices: ServiceItem[];
  onToggleService: (service: ServiceItem) => void;
  onClearServices: () => void;
  onProceed: () => void;
}

export function formatRitualDuration(services: ServiceItem[]): string {
  if (services.length === 0) return "0 mins";
  const totalMins = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const bufferMins = (services.length - 1) * 5;
  const grandTotalMins = totalMins + bufferMins;
  const hours = Math.floor(grandTotalMins / 60);
  const mins = grandTotalMins % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`;
  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${mins} mins`;
}

export function calculateTotalInvestment(services: ServiceItem[]): number {
  return services.reduce((sum, s) => sum + s.priceLKR, 0);
}

export default function ServiceSelectionStep({
  servicesList,
  selectedServices,
  onToggleService,
  onClearServices,
  onProceed
}: ServiceSelectionStepProps) {
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState<string>("all");
  const [bookingSearch, setBookingSearch] = useState<string>("");

  const filteredBookingServices = servicesList.filter((s) => {
    const matchesCat = bookingCategoryFilter === "all" || s.category === bookingCategoryFilter;
    const q = bookingSearch.toLowerCase().trim();
    const matchesQ =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const totalInvestment = calculateTotalInvestment(selectedServices);
  const totalDuration = formatRitualDuration(selectedServices);

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-light text-stone-900">
            1. Select Your Desired Treatments
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Choose one or multiple treatments. Contiguous schedules and 5-minute turnaround buffers are calculated automatically.
          </p>
        </div>
        {selectedServices.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                {selectedServices.length} {selectedServices.length === 1 ? "Treatment" : "Treatments"} in Ritual
              </span>
              <span className="text-xs font-semibold text-gold-deep">
                LKR {totalInvestment.toLocaleString()} • {totalDuration}
              </span>
            </div>
            <button
              type="button"
              onClick={onProceed}
              className="btn-luxury bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Proceed ({selectedServices.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3 pt-1">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search treatments by name or description..."
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAF7F2]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-primary"
          />
          {bookingSearch && (
            <button
              type="button"
              onClick={() => setBookingSearch("")}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Treatments" },
            { id: "eyes", label: "Eyelines & Lashes" },
            { id: "bridal", label: "Bridal Couture" },
            { id: "facials", label: "Skin & Facials" },
            { id: "hair", label: "Hair Couture" },
            { id: "nails", label: "Nail Lounge" },
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setBookingCategoryFilter(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
                bookingCategoryFilter === cat.id
                  ? "bg-gold-primary text-white shadow-sm font-semibold"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBookingServices.length === 0 ? (
        <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-stone-200 space-y-2">
          <p className="text-xs text-stone-500 font-light">No treatments match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setBookingCategoryFilter("all");
              setBookingSearch("");
            }}
            className="text-xs text-gold-deep font-semibold underline cursor-pointer"
          >
            View all offerings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredBookingServices.map((s) => {
            const isSelected = selectedServices.some((sel) => sel.id === s.id);
            return (
              <div
                key={s.id}
                onClick={() => onToggleService(s)}
                className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-start gap-4 ${
                  isSelected
                    ? "border-gold-primary bg-gold-light/20 ring-2 ring-gold-primary/40 shadow-sm"
                    : "border-stone-200 hover:border-gold-primary/50 bg-[#FAF7F2]/40"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-gold-deep tracking-wider block">
                      {s.categoryName} • {s.durationFormatted}
                    </span>
                    {s.isPopular && (
                      <span className="text-[9px] bg-gold-primary text-white px-1.5 py-0.2 rounded font-semibold inline-flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" /> Signature
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-lg font-medium text-stone-900">{s.name}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 font-light">{s.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-serif text-lg font-bold text-stone-900 block">
                    LKR {s.priceLKR.toLocaleString()}
                  </span>
                  <div className="mt-2 flex justify-end">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full border transition ${
                        isSelected
                          ? "bg-gold-primary border-gold-primary text-white"
                          : "border-stone-300 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Ritual Cart Summary Bar */}
      {selectedServices.length > 0 && (
        <div className="sticky bottom-0 z-30 pt-4">
          <div className="bg-espresso-900 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-gold-primary/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gold-primary/20 border border-gold-primary/40 flex items-center justify-center text-gold-primary flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-gold-light font-semibold">
                    Your Beauty Ritual ({selectedServices.length} {selectedServices.length === 1 ? "Treatment" : "Treatments"})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-300 mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold-primary" />
                    {totalDuration}
                  </span>
                  <span>•</span>
                  <span className="font-serif font-bold text-white text-sm">
                    Total: LKR {totalInvestment.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClearServices}
                className="px-3 py-2 rounded-xl border border-stone-700 hover:border-red-400 text-stone-400 hover:text-red-300 text-xs font-medium transition inline-flex items-center gap-1 cursor-pointer"
                title="Clear selected treatments"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>

              <button
                type="button"
                onClick={onProceed}
                className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-gold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Proceed to Specialist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
