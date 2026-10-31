"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SPECIALISTS } from "@/lib/data";
import { SpecialistItem } from "@/types";
import { getStoredSpecialists, subscribeToSpecialists, saveSpecialistsToStorage } from "@/lib/specialists";

export default function AboutSpecialistsSection() {
  const [specialists, setSpecialists] = useState<SpecialistItem[]>(SPECIALISTS);

  useEffect(() => {
    setSpecialists(getStoredSpecialists());

    // Live fetch directly from Supabase PostgreSQL database
    fetch("/api/specialists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SpecialistItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          saveSpecialistsToStorage(data);
          setSpecialists(data);
        }
      })
      .catch((err) => console.warn("Live specialists fetch fallback:", err));

    const unsubscribe = subscribeToSpecialists((updated) => {
      setSpecialists(updated);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <section className="bg-[#FFF9F5] py-24 border-t border-gold-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            The Artisan Team
          </span>
          <h2 className="font-serif text-4xl font-light text-stone-900">
            Meet Your Beauty <span className="italic text-gold-hover">Specialists</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {specialists.map((spec) => (
            <div
              key={spec.id}
              className="luxury-card group bg-white rounded-xl p-6 border border-gold-primary/30 shadow-card text-center flex flex-col justify-between"
            >
              <div>
                <div className="w-20 h-20 rounded-full mx-auto bg-gold-light border-2 border-gold-primary flex items-center justify-center font-serif text-2xl font-bold text-gold-deep mb-4 shadow-sm group-hover:scale-108 group-hover:border-gold-deep transition duration-300 overflow-hidden relative">
                  {spec.avatar ? (
                    <Image
                      src={spec.avatar}
                      alt={spec.name}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  ) : (
                    spec.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                  )}
                </div>
                <h3 className="font-serif text-xl font-medium text-stone-900 mb-1 group-hover:text-gold-deep transition duration-300">
                  {spec.name}
                </h3>
                <span className="text-[11px] uppercase tracking-wider text-gold-deep font-semibold block mb-3">
                  {spec.role}
                </span>
                <p className="text-xs text-stone-600 font-light leading-relaxed mb-4">
                  {spec.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-gold-primary/20">
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {(spec.specialties || []).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#FAF7F2] border border-gold-primary/30 px-2.5 py-0.5 rounded text-stone-700 transition hover:bg-gold-light/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/book?staff=${spec.id}`}
                  prefetch={true}
                  className="btn-luxury w-full text-center block text-xs uppercase tracking-wider bg-gold-primary/10 hover:bg-gold-primary text-gold-deep hover:text-white font-semibold py-2.5 rounded transition"
                >
                  Book with {spec.name.split(" ")[0]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
