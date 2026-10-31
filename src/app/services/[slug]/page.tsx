"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, CheckCircle2, Calendar, Phone, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { SERVICES, SALON_INFO } from "@/lib/data";
import { ServiceItem } from "@/types";
import { getStoredServices, saveServicesToStorage } from "@/lib/services";

interface ServiceDetailsProps {
  params: Promise<{ slug: string }>;
}

export default function ServiceDetailsPage({ params }: ServiceDetailsProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [service, setService] = useState<ServiceItem | null>(() => {
    return SERVICES.find((s) => s.slug === slug || s.id === slug) || null;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const list = getStoredServices();
    const found = list.find((s) => s.slug === slug || s.id === slug);
    if (found) {
      setService(found);
    }

    // Live fetch directly from Supabase PostgreSQL database
    fetch("/api/services", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ServiceItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          saveServicesToStorage(data);
          const liveMatch = data.find((s) => s.slug === slug || s.id === slug);
          if (liveMatch) {
            setService(liveMatch);
          }
        }
      })
      .catch((err) => console.warn("Live service lookup fallback:", err))
      .finally(() => setIsLoaded(true));
  }, [slug]);

  if (!service && isLoaded) {
    return (
      <div className="py-24 max-w-3xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-light/60 flex items-center justify-center mx-auto text-gold-deep">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-light text-stone-900">
          Treatment Offering Not Found
        </h1>
        <p className="text-sm text-stone-600 font-light max-w-md mx-auto">
          The requested service may have been updated or removed from the Salon EyeLines catalog.
        </p>
        <Link
          href="/services"
          className="btn-luxury shimmer-gold inline-flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded shadow-gold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Salon Treatments</span>
        </Link>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-24 text-center text-stone-400">
        <Sparkles className="w-6 h-6 animate-spin-slow mx-auto text-gold-primary mb-2" />
        <span className="text-xs tracking-wider uppercase">Loading treatment details...</span>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-gold-deep transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all treatments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Media & Highlights */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-stone-100">
              <Image
                src={service.image || "/images/service_eyelines.jpg"}
                alt={service.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-espresso-900/85 text-gold-light text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded border border-gold-primary/30">
                {service.categoryName}
              </div>
              {service.isPopular && (
                <div className="absolute top-4 right-4 bg-gold-primary text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm">
                  Signature Offering
                </div>
              )}
            </div>

            {/* Treatment Breakdown */}
            <div className="bg-white rounded-2xl p-8 border border-gold-primary/30 shadow-sm space-y-6">
              <h2 className="font-serif text-3xl font-light text-stone-900">
                What to Expect During Your Session
              </h2>
              <p className="text-sm text-stone-600 font-light leading-relaxed">
                {service.description}
              </p>

              {service.fullDetails && service.fullDetails.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs uppercase tracking-widest text-gold-deep font-semibold">
                    Procedure & Formulation Highlights:
                  </h4>
                  <ul className="space-y-2.5">
                    {service.fullDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700 font-light">
                        <CheckCircle2 className="w-4 h-4 text-gold-deep flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reservation Summary Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-8 border border-gold-primary/40 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-gold-deep font-semibold block mb-1">
                  {service.tagline}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 leading-snug">
                  {service.name}
                </h1>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-gold-primary/20 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-light">Session Duration:</span>
                  <span className="font-medium text-stone-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold-deep" />
                    {service.durationFormatted} ({service.durationMinutes} mins)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-light">Studio Location:</span>
                  <span className="font-medium text-stone-900">Ganegama Rd, Aluthgama</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-light">Payment Terms:</span>
                  <span className="font-medium text-stone-900">Pay at Salon (Cash / Card)</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-gold-primary/20 pt-4">
                <span className="text-xs uppercase tracking-wider text-stone-500">Total Treatment Price</span>
                <span className="font-serif text-3xl font-bold text-stone-900">
                  LKR {service.priceLKR.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href={`/book?service=${service.id}`}
                  prefetch={true}
                  className="w-full text-center block bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest py-4 rounded shadow-gold transition"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Reserve This Treatment Now
                </Link>

                <a
                  href={`https://wa.me/94775474996?text=${encodeURIComponent(`Hello Salon EyeLines! I would like to inquire about booking ${service.name} (LKR ${service.priceLKR.toLocaleString()}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block bg-transparent border border-green-600 text-green-700 hover:bg-green-600 hover:text-white text-xs font-semibold uppercase tracking-widest py-3.5 rounded transition"
                >
                  Quick WhatsApp Inquiry
                </a>
              </div>

              <div className="border-t border-gold-primary/20 pt-4 text-center">
                <p className="text-xs text-stone-500 font-light">
                  Need custom auspicious Nekath timings? <br />
                  Call direct at <strong className="text-stone-800">{SALON_INFO.phone}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
