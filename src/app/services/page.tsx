"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { SERVICES } from "@/lib/data";
import { ServiceItem } from "@/types";
import { getStoredServices, subscribeToServices, saveServicesToStorage } from "@/lib/services";

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);

  useEffect(() => {
    setServices(getStoredServices());

    // Live fetch directly from Supabase PostgreSQL database
    fetch("/api/services", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          saveServicesToStorage(data);
        }
      })
      .catch((err) => console.warn("Live services fetch fallback:", err));

    const unsubscribe = subscribeToServices((updated) => {
      setServices(updated);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const categories = [
    { id: "all", label: "All Treatments" },
    { id: "eyes", label: "Eyelines & Lashes" },
    { id: "bridal", label: "Bridal Couture" },
    { id: "facials", label: "Skin & Facials" },
    { id: "hair", label: "Hair Couture" },
    { id: "nails", label: "Nail Studio" },
  ];

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center space-y-3 sm:space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Aesthetic Treatment Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-stone-900 leading-tight">
          Services, Durations & <span className="italic text-gold-hover">Prices</span>
        </h1>
        <p className="text-xs sm:text-base text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          Transparent pricing in Sri Lankan Rupees (LKR) with scheduled treatment durations. Book individual services or curated luxury packages.
        </p>

        {/* Filter Tabs - Horizontal Swipeable on Phone, Centered Wrap on Tablet/Desktop */}
        <div className="pt-4 sm:pt-6">
          <div
            role="tablist"
            aria-label="Treatment Categories"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 -mx-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible"
          >
            {categories.map((c) => {
              const count = c.id === "all" ? services.length : services.filter((s) => s.category === c.id).length;
              const isSelected = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(c.id)}
                  className={`btn-luxury text-xs uppercase tracking-wider font-semibold px-4 sm:px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-1.5 min-h-[42px] whitespace-nowrap flex-shrink-0 ${
                    isSelected
                      ? "bg-gold-primary text-white shadow-md ring-2 ring-gold-primary/40"
                      : "bg-white text-stone-700 border border-gold-primary/30 hover:border-gold-primary hover:bg-gold-light/20"
                  }`}
                >
                  <span>{c.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? "bg-white/25 text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gold-primary/30 p-8 space-y-4 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-gold-deep mx-auto" />
            <h3 className="font-serif text-2xl text-stone-900 font-light">No treatments currently listed</h3>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              No services match the selected filter. Explore our other luxury aesthetic categories or view all treatments.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="btn-luxury bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm"
              >
                View All Treatments
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="luxury-card group bg-white rounded-xl overflow-hidden border border-gold-primary/30 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-stone-100">
                    <Image
                      src={service.image || "/images/service_eyelines.jpg"}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-espresso-900/80 backdrop-blur-sm text-gold-light text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded border border-gold-primary/30 group-hover:border-gold-primary transition duration-300">
                      {service.categoryName}
                    </div>
                    {service.isPopular && (
                      <div className="absolute top-3 right-3 bg-gold-primary text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                        Signature
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex justify-between items-center text-xs text-stone-500 font-light">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold-deep" />
                        {service.durationFormatted}
                      </span>
                      <span className="text-gold-deep font-medium">{service.tagline}</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900 leading-snug group-hover:text-gold-deep transition duration-300">
                      {service.name}
                    </h3>
                    <p className="text-xs text-stone-600 font-light leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <div className="pt-4 border-t border-gold-primary/20 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block tracking-wider">
                        Treatment Fee
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        LKR {service.priceLKR.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/services/${service.slug}`}
                        prefetch={true}
                        className="btn-luxury text-xs uppercase tracking-wider text-stone-700 hover:text-gold-deep font-semibold px-2.5 sm:px-3 py-2 transition"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/book?service=${service.id}`}
                        prefetch={true}
                        className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-3.5 sm:px-4 py-2 rounded shadow-gold transition inline-flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
