"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Plus, RotateCcw, Clock, Sparkles, ArrowRight, Edit2, Trash2 } from "lucide-react";
import { ServiceItem } from "@/types";

interface AdminServicesTabProps {
  services: ServiceItem[];
  onOpenAddService: () => void;
  onOpenEditService: (service: ServiceItem) => void;
  onOpenDeleteService: (service: ServiceItem) => void;
  onOpenResetDefaults: () => void;
}

export default function AdminServicesTab({
  services,
  onOpenAddService,
  onOpenEditService,
  onOpenDeleteService,
  onOpenResetDefaults,
}: AdminServicesTabProps) {
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>("all");

  const filteredServices = services.filter((s) => {
    const matchesCategory =
      serviceCategoryFilter === "all" || s.category === serviceCategoryFilter;
    const query = serviceSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.tagline.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.categoryName.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Control Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gold-primary/30 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold">
                Live Catalog Management
              </span>
              <span className="text-[10px] bg-gold-light text-gold-deep px-2 py-0.5 rounded font-semibold">
                Dynamic Sync
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 mt-1">
              Active Salon Services & Pricing
            </h3>
            <p className="text-xs text-stone-500 font-light mt-1">
              Changes here immediately update the public website catalog and online booking concierge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenResetDefaults}
              className="text-stone-500 hover:text-stone-800 text-xs px-3 py-2 rounded border border-stone-200 hover:border-stone-300 inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Reset to default 12 services"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={onOpenAddService}
              className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded shadow-gold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Treatment
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-4 border-t border-gold-primary/20">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, category, description..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-primary/50 transition"
            />
            {serviceSearch && (
              <button
                type="button"
                onClick={() => setServiceSearch("")}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {[
              { id: "all", label: "All Offerings" },
              { id: "eyes", label: "Eyelines & Lashes" },
              { id: "bridal", label: "Bridal Couture" },
              { id: "facials", label: "Skin & Facials" },
              { id: "hair", label: "Hair Couture" },
              { id: "nails", label: "Nail Lounge" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setServiceCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  serviceCategoryFilter === cat.id
                    ? "bg-gold-primary text-white shadow-xs"
                    : "bg-[#FAF7F2] text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gold-primary/20 space-y-3">
          <p className="text-sm text-stone-500 italic">No services match your current filter.</p>
          <button
            type="button"
            onClick={() => {
              setServiceSearch("");
              setServiceCategoryFilter("all");
            }}
            className="text-xs text-gold-deep underline font-medium cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gold-primary/30 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-6 relative group"
            >
              <div>
                {/* Image and Badges Header */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-stone-100">
                  <Image
                    src={s.image || "/images/service_eyelines.jpg"}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 text-stone-900 backdrop-blur-xs">
                      {s.categoryName}
                    </span>
                    {s.isPopular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-primary text-white shadow-xs inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Signature
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/90 text-white font-semibold backdrop-blur-xs">
                      Active
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <h4 className="font-serif text-xl text-stone-900 font-medium leading-snug group-hover:text-gold-deep transition">
                  {s.name}
                </h4>
                <p className="text-xs text-gold-deep font-medium mt-0.5">
                  {s.tagline}
                </p>

                {/* Description */}
                <p className="text-xs text-stone-600 font-light mt-2 line-clamp-2 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Footer Info & Actions */}
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-light">
                    <Clock className="w-3.5 h-3.5 text-gold-deep" />
                    <span>{s.durationFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-lg font-bold text-stone-900">
                      LKR {s.priceLKR.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Edit, Delete, View */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/services/${s.slug}`}
                    target="_blank"
                    className="text-[11px] text-stone-500 hover:text-gold-deep font-medium inline-flex items-center gap-1"
                  >
                    <span>Preview</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditService(s)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-gold-light/60 text-stone-700 hover:text-gold-deep rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                      title="Edit treatment details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDeleteService(s)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                      title="Delete treatment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
