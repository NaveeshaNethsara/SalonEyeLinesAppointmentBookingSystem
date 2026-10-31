"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Star, Heart, CheckCircle2 } from "lucide-react";
import { SALON_INFO, SERVICES, HIGHLIGHTS } from "@/lib/data";
import { ServiceItem } from "@/types";
import { getStoredServices, subscribeToServices, saveServicesToStorage } from "@/lib/services";
import ScrollMotionGraphics3D from "@/components/ScrollMotionGraphics3D";
import ScrollRevealMotion from "@/components/ScrollRevealMotion";

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<ServiceItem[]>(() =>
    SERVICES.filter((s) => s.isPopular)
  );

  useEffect(() => {
    const list = getStoredServices();
    setFeaturedServices(list.filter((s) => s.isPopular));

    // Live fetch directly from Supabase PostgreSQL database
    fetch("/api/services", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ServiceItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          saveServicesToStorage(data);
          setFeaturedServices(data.filter((s) => s.isPopular));
        }
      })
      .catch((err) => console.warn("Live homepage services fallback:", err));

    return subscribeToServices((updated) => {
      setFeaturedServices(updated.filter((s) => s.isPopular));
    });
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ===== GLOBAL 3D SCROLL MOTION GRAPHICS (Three.js + Scroll-linked) ===== */}
      <ScrollMotionGraphics3D />
      {/* ===== GSAP ScrollTrigger Section Reveal Animations ===== */}
      <ScrollRevealMotion />

      {/* ==========================================================================
          HERO SECTION (Kosmetik Aurora Style Couture Showcase)
          ========================================================================== */}
      <section className="relative min-h-[auto] lg:min-h-[85vh] flex items-center justify-center py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#FAF7F2]/40 via-[#FFF9F5]/30 to-[#FAF7F2]/40">

        {/* Subtle Background Ambience */}
        <div className="absolute inset-0 z-0 opacity-15 mix-blend-multiply pointer-events-none">
          <Image
            src="/images/salon_hero.jpg"
            alt="Salon EyeLines Ambience"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Botanical Watermark Accents from Kosmetik Aurora Reference (Animated Floating Layer) */}
        <div className="absolute top-10 left-6 opacity-60 pointer-events-none z-10 hidden md:block animate-float-slow">
          <Image src="/images/flower_accent.png" alt="Flower accent" width={80} height={60} />
        </div>
        <div className="absolute bottom-16 right-6 opacity-60 pointer-events-none z-10 hidden md:block animate-float-reverse">
          <Image src="/images/flower_right.png" alt="Flower accent" width={80} height={60} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-gold-primary/40 shadow-sm text-gold-deep text-[11px] sm:text-xs uppercase tracking-widest font-semibold shimmer-gold">
                <Sparkles className="w-3.5 h-3.5 text-gold-deep animate-spin-slow flex-shrink-0" />
                <span>Southern Coast Premier Beauty Sanctuary</span>
              </div>

              <h1 className="font-serif text-[2.75rem] sm:text-6xl lg:text-7xl font-light text-stone-900 leading-[1.06] sm:leading-[1.08] tracking-tight">
                A Dream Becomes <br />
                an <span className="italic font-normal text-gold-hover">Experience</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-stone-600 font-light leading-relaxed max-w-xl">
                Where master bridal transformations, precision eyelines artistry, and world-class beauty rituals converge in an atmosphere of pure serenity in Aluthgama.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href="/book"
                  prefetch={true}
                  className="btn-luxury shimmer-gold inline-flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-7 py-3.5 sm:py-4 rounded shadow-gold transition group w-full sm:w-auto text-center"
                >
                  <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Reserve Your Visit</span>
                </Link>
                <Link
                  href="/services"
                  prefetch={true}
                  className="btn-luxury inline-flex items-center justify-center gap-2 bg-white/70 sm:bg-transparent border border-gold-primary text-gold-deep hover:bg-gold-primary hover:text-white text-xs font-semibold uppercase tracking-widest px-7 py-3.5 sm:py-4 rounded transition group w-full sm:w-auto text-center"
                >
                  <span>Explore Treatment Menu</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Trust Metric Counters (2 cols on phone, 4 on tablet/desktop) */}
              <div className="pt-6 sm:pt-8 border-t border-gold-primary/30 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-lg">
                <div className="bg-white/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-gold-primary/20 transition hover:-translate-y-0.5 duration-200">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">15+</div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gold-deep font-medium mt-1">Years Craft</div>
                </div>
                <div className="bg-white/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-gold-primary/20 transition hover:-translate-y-0.5 duration-200">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">10K+</div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gold-deep font-medium mt-1">Happy Clients</div>
                </div>
                <div className="bg-white/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-gold-primary/20 transition hover:-translate-y-0.5 duration-200">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">1,200+</div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gold-deep font-medium mt-1">Radiant Brides</div>
                </div>
                <div className="bg-white/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-gold-primary/20 transition hover:-translate-y-0.5 duration-200">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 flex items-center">
                    4.9<Star className="w-4 h-4 fill-amber-400 text-amber-400 inline ml-1" />
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gold-deep font-medium mt-1">500+ Reviews</div>
                </div>
              </div>
            </div>

            {/* Right Media Frame */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Ambient Gold Glow Halo behind Hero Image */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-gold-primary/35 via-gold-light/25 to-transparent rounded-3xl blur-2xl ambient-gold-glow -z-10" />

              <div className="relative w-full h-[260px] sm:h-[380px] lg:h-[500px] rounded-2xl overflow-hidden border-4 sm:border-8 border-white shadow-2xl transition duration-500 hover:shadow-gold">
                <Image
                  src="/images/salon_hero.jpg"
                  alt="Salon EyeLines Interior"
                  fill
                  className="object-cover transition duration-700 hover:scale-105"
                  priority
                />
              </div>

              {/* Floating Award Pill with mobile-safe positioning */}
              <div className="absolute bottom-2 left-2 sm:-bottom-6 sm:-left-6 right-2 sm:right-auto bg-white/95 backdrop-blur-md border border-gold-primary/40 rounded-xl p-3 sm:p-4 shadow-xl flex items-center gap-3 sm:max-w-xs animate-float-slow hover:scale-105 transition duration-300">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gold-light flex items-center justify-center text-gold-deep flex-shrink-0 animate-pulse-gentle">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-gold-deep text-gold-deep" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900">Voted #1 Bridal Studio</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-light">Aluthgama, Bentota & Beruwala Region</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          THE STORY SPLIT SECTION (Das EyeLines - Aurora Split Layout)
          ========================================================================== */}
      <section className="py-14 sm:py-20 lg:py-24 bg-white/85 backdrop-blur-[2px] border-y border-gold-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Image Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[480px] rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src="/images/service_eyelines.jpg"
                  alt="Precision Eyeliner Definition by Nayani Munasinghe"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-espresso-900 text-white rounded-lg p-3.5 sm:p-5 border border-gold-primary/40 shadow-xl text-center">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-gold-primary block leading-none">15+</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-300 mt-1 block">Years of Trust</span>
              </div>
            </div>

            {/* Story Details */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
                The EyeLines Sanctuary
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900 leading-tight">
                Master Artistry Designed to Awaken Your <span className="italic text-gold-hover">True Radiance</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed">
                Since our founding in Aluthgama, Salon EyeLines has been inspired by a singular devotion: bringing world-class beauty expertise to clients who cherish fine aesthetics, personal care, and authentic warmth.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Under the visionary leadership of Master Cosmetologist {SALON_INFO.founder} and our expert team, Salon EyeLines has grown into the Southern Coast&apos;s premier destination for bespoke bridal couture, precision eye and lash architecture, and revitalizing skin wellness.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-gold-deep flex-shrink-0" />
                  <span>Bespoke Kandyan & Western Bridal</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-gold-deep flex-shrink-0" />
                  <span>Signature Micro-Eyeliner & Lashes</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-gold-deep flex-shrink-0" />
                  <span>Private Air-Conditioned Bridal Suite</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-gold-deep flex-shrink-0" />
                  <span>Clinically Pure Global Formulations</span>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex gap-4">
                <Link
                  href="/about"
                  prefetch={true}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-900 hover:text-gold-deep transition group"
                >
                  <span>Read Founder Nayani Munasinghe&apos;s Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          FEATURED TREATMENT MENU
          ========================================================================== */}
      <section className="py-14 sm:py-20 lg:py-24 bg-[#FAF7F2]/80 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
              Curated Master Menu
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900">
              Signature Treatments & <span className="italic text-gold-hover">Experiences</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light">
              Crafted with medical-grade hygiene, international products, and unmatched attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="luxury-card group bg-white rounded-xl overflow-hidden border border-gold-primary/30 shadow-card flex flex-col"
              >
                <div className="relative h-52 sm:h-60 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-espresso-900/80 backdrop-blur-sm text-gold-light text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded border border-gold-primary/30 group-hover:border-gold-primary transition duration-300">
                    {service.categoryName}
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-grow space-y-3">
                  <div className="flex justify-between items-center text-xs text-stone-500 font-light">
                    <span>{service.durationFormatted}</span>
                    <span className="text-gold-deep font-medium">{service.tagline}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900 leading-snug group-hover:text-gold-deep transition duration-300">
                    {service.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-light line-clamp-3 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t border-gold-primary/20 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block tracking-wider">Price</span>
                      <span className="font-serif text-lg sm:text-xl font-semibold text-stone-900">
                        LKR {service.priceLKR.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
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
                        className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs uppercase tracking-wider font-semibold px-3.5 sm:px-4 py-2 rounded transition shadow-sm"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/services"
              prefetch={true}
              className="btn-luxury inline-flex items-center justify-center gap-2 bg-transparent border border-gold-primary text-gold-deep hover:bg-gold-primary hover:text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded transition group w-full sm:w-auto"
            >
              <span>View All Treatments & Prices</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          THE 10 BESONDERHEITEN / HIGHLIGHTS (Kosmetik Aurora Signature Pattern)
          ========================================================================== */}
      <section className="py-14 sm:py-20 lg:py-24 bg-[#FFF9F5]/80 backdrop-blur-[2px] border-t border-gold-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
              The 10 Distinctive Highlights
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900">
              Amenities That Define <span className="italic text-gold-hover">Excellence</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light">
              Inspired by the world&apos;s leading European salons, these ten commitments elevate every minute of your visit at Salon EyeLines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.number}
                className="luxury-card group bg-white rounded-xl p-5 sm:p-6 border border-gold-primary/30 shadow-sm text-center relative flex flex-col justify-between"
              >
                <div className="absolute top-3 right-4 font-serif text-xl text-gold-primary/30 group-hover:text-gold-deep group-hover:scale-110 transition duration-300 font-bold">
                  {item.number}
                </div>
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-full bg-gold-light/60 text-gold-deep flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-gold-primary group-hover:text-white transition duration-300">
                    <ShieldCheck className="w-5 h-5 text-gold-deep group-hover:text-white transition duration-300" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900 mb-1 leading-snug group-hover:text-gold-deep transition duration-300">
                    {item.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-gold-deep font-semibold block mb-2">
                    {item.subtitle}
                  </span>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          ROYAL BRIDAL COUTURE SECTION
          ========================================================================== */}
      <section className="py-14 sm:py-20 lg:py-24 bg-gradient-to-br from-espresso-950 via-espresso-900 to-espresso-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-primary font-semibold block">
                Bespoke Bridal Sanctum
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
                Timeless Splendor for Your Most <span className="italic text-gold-primary">Sacred Day</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                From traditional Kandyan Osariya drapery with antique 7-necklace sets to ethereal European lace bridal veils, our dedicated bridal suites are designed to make you unforgettable.
              </p>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                We understand the sacred significance of auspicious wedding times (Nekath). Our specialized bridal team opens as early as 4:00 AM upon request, providing complete privacy, peaceful air-conditioning, and family waiting rooms.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="bg-white/5 border border-gold-primary/20 rounded-lg p-3.5 sm:p-4">
                  <h4 className="font-serif text-base sm:text-lg text-gold-light mb-1">Royal Kandyan Suite</h4>
                  <p className="text-xs text-stone-400 mb-2">Full Nalalpatiya, Osariya drape & HD makeup.</p>
                  <span className="text-xs sm:text-sm font-semibold text-gold-primary">From LKR 75,000</span>
                </div>
                <div className="bg-white/5 border border-gold-primary/20 rounded-lg p-3.5 sm:p-4">
                  <h4 className="font-serif text-base sm:text-lg text-gold-light mb-1">Western Elegance Suite</h4>
                  <p className="text-xs text-stone-400 mb-2">Veil placement, tiara, glass-skin & updo.</p>
                  <span className="text-xs sm:text-sm font-semibold text-gold-primary">From LKR 65,000</span>
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <Link
                  href="/book?service=bride-01"
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-7 py-3.5 sm:py-4 rounded shadow-gold transition w-full sm:w-auto text-center"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Private Bridal Consultation
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 mt-6 lg:mt-0">
              <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[520px] rounded-2xl overflow-hidden border-4 border-gold-primary/40 shadow-2xl">
                <Image
                  src="/images/service_bridal.jpg"
                  alt="Bridal Dressing by Nayani Munasinghe"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          CTA BANNER
          ========================================================================== */}
      <section className="py-14 sm:py-20 bg-gold-light/40 border-t border-gold-primary/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            Begin Your Transformation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-900">
            Book Your Next Appointment in 60 Seconds
          </h2>
          <p className="text-stone-600 font-light max-w-xl mx-auto text-xs sm:text-sm lg:text-base">
            No account creation required. Seamless guest booking with real-time slot validation and instant WhatsApp confirmation directly to your phone.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              prefetch={true}
              className="inline-flex items-center justify-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 sm:px-10 py-3.5 sm:py-4 rounded shadow-gold transition transform hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              <Calendar className="w-4 h-4" />
              Book Online Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
