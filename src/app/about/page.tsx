import Image from "next/image";
import Link from "next/link";
import { Award, Sparkles, HeartHandshake, ShieldCheck, Calendar, ArrowRight } from "lucide-react";
import { SALON_INFO, SPECIALISTS } from "@/lib/data";
import AboutSpecialistsSection from "@/components/AboutSpecialistsSection";

export const metadata = {
  title: "About Us | The EyeLines Story & Founder Nayani Munasinghe",
  description: "Learn about the heritage, values, and expert beauty team of Salon EyeLines in Aluthgama, led by Master Bridal Director Nayani Munasinghe.",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Heritage & Devotion
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl font-light text-stone-900">
          The Story of <span className="italic text-gold-hover">Salon EyeLines</span>
        </h1>
        <p className="text-base text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          More than 15 years of dedicated artistry on the Southern coastline of Sri Lanka, founded on the timeless philosophy that beauty is an intimate, sacred experience.
        </p>
      </div>

      {/* Founder's Feature Story */}
      <section className="bg-white py-20 border-y border-gold-primary/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-stone-900 group">
                <Image
                  src="/images/nayani_munasinghe.jpg"
                  alt="Founder & Master Bridal Director Nayani Munasinghe"
                  fill
                  quality={95}
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover object-top transition duration-700 ease-out group-hover:scale-102"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-gold-primary/30 rounded-2xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-espresso-900 text-white p-5 rounded-xl border border-gold-primary/40 shadow-xl max-w-xs text-left">
                <span className="text-gold-primary font-serif text-xl font-medium block">Nayani Munasinghe</span>
                <span className="text-[11px] uppercase tracking-wider text-stone-300">Founder & Master Bridal Director</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
                The Visionary
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 leading-snug">
                &ldquo;Every woman carries a singular elegance that simply awaits its true definition.&rdquo;
              </h2>
              <p className="text-base text-stone-700 font-light leading-relaxed">
                When Nayani Munasinghe opened the doors of Salon EyeLines in Aluthgama, her ambition was to break away from rushed, mechanical salon environments. She envisioned a tranquil sanctuary where clients could slow down, be heard, and experience high-fashion European precision right on Ganegama Road.
              </p>
              <p className="text-sm text-stone-600 font-light leading-relaxed">
                With extensive training in traditional Kandyan royal regalia, modern Western bridal aesthetics, and micro-pigment eye styling, Nayani has guided over 1,200 brides down the aisle with calm grace and impeccable artistry. Today, the salon continues to be celebrated across Aluthgama, Bentota, Beruwala, and Kalutara for its warm family ethos and flawless results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="border-l-2 border-gold-primary pl-4">
                  <span className="font-serif text-2xl font-bold text-stone-900 block">15+ Years</span>
                  <span className="text-xs text-stone-500 font-light">Industry Leadership</span>
                </div>
                <div className="border-l-2 border-gold-primary pl-4">
                  <span className="font-serif text-2xl font-bold text-stone-900 block">100% Pure</span>
                  <span className="text-xs text-stone-500 font-light">Certified Ingredients</span>
                </div>
                <div className="border-l-2 border-gold-primary pl-4">
                  <span className="font-serif text-2xl font-bold text-stone-900 block">4.9 / 5.0</span>
                  <span className="text-xs text-stone-500 font-light">Client Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy Values */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            Our Core Pillars
          </span>
          <h2 className="font-serif text-4xl font-light text-stone-900">
            A Higher Standard of <span className="italic text-gold-hover">Beauty Care</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="luxury-card group bg-white rounded-xl p-8 border border-gold-primary/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-light/60 flex items-center justify-center text-gold-deep transition duration-300 group-hover:scale-110 group-hover:bg-gold-primary group-hover:text-white">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 font-medium group-hover:text-gold-deep transition duration-300">Certified Master Technicians</h3>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              Every cosmetologist on our floor has undergone rigorous professional qualification in facial skin mapping, chemical safety, and international bridal styling.
            </p>
          </div>

          <div className="luxury-card group bg-white rounded-xl p-8 border border-gold-primary/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-light/60 flex items-center justify-center text-gold-deep transition duration-300 group-hover:scale-110 group-hover:bg-gold-primary group-hover:text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 font-medium group-hover:text-gold-deep transition duration-300">Sterilization & Client Safety</h3>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              We employ hospital-grade autoclave sterilization for reusable metal instruments and single-use disposables for threading, waxing, and nail care.
            </p>
          </div>

          <div className="luxury-card group bg-white rounded-xl p-8 border border-gold-primary/30 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-light/60 flex items-center justify-center text-gold-deep transition duration-300 group-hover:scale-110 group-hover:bg-gold-primary group-hover:text-white">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 font-medium group-hover:text-gold-deep transition duration-300">Genuine Care & Hospitality</h3>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              From fresh Ceylon herbal tea upon your arrival to personalized post-treatment care follow-ups, your wellbeing and comfort remain our supreme priority.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Roster (Dynamic client component connected to specialists store) */}
      <AboutSpecialistsSection />

      {/* CTA */}
      <div className="py-20 text-center space-y-4">
        <h3 className="font-serif text-3xl font-light text-stone-900">
          Ready to experience the EyeLines touch?
        </h3>
        <div>
          <Link
            href="/book"
            prefetch={true}
            className="btn-luxury shimmer-gold inline-flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-4 rounded shadow-gold transition"
          >
            <Calendar className="w-4 h-4" />
            Reserve Your Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
