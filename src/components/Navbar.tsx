"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Clock, Calendar, Menu, X, ShieldCheck } from "lucide-react";
import { SALON_INFO } from "@/lib/data";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/appointments", label: "My Booking" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-espresso-900 text-ivory-200 text-xs py-2 border-b border-gold-primary/20 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-gold-primary" />
              {SALON_INFO.address}
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-gold-primary" />
              {SALON_INFO.hours}
            </span>
          </div>
          <div className="flex items-center space-x-5">
            <a
              href={`tel:${SALON_INFO.phone}`}
              className="flex items-center gap-1.5 text-stone-300 hover:text-gold-primary transition"
              aria-label={`Call salon at ${SALON_INFO.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-gold-primary" />
              {SALON_INFO.phone}
            </a>
            <a
              href={SALON_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/30 text-gold-light hover:bg-gold-primary/20 transition text-[11px]"
              aria-label="Salon EyeLines Facebook community"
            >
              ★ {SALON_INFO.facebookFollowers}
            </a>
            <Link
              href="/admin"
              prefetch={true}
              className="flex items-center gap-1 text-gold-light hover:text-white transition text-[11px] uppercase tracking-wider font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-primary" />
              Salon Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Top Utility Bar */}
      <div className="bg-espresso-900 text-ivory-200 text-[11px] py-1.5 px-4 border-b border-gold-primary/20 md:hidden flex justify-between items-center">
        <a
          href={`tel:${SALON_INFO.phone}`}
          className="flex items-center gap-1.5 text-stone-300 hover:text-gold-light transition"
          aria-label={`Call ${SALON_INFO.phone}`}
        >
          <Phone className="w-3 h-3 text-gold-primary" />
          <span>{SALON_INFO.phone}</span>
        </a>
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-[10px]">Aluthgama</span>
          <Link
            href="/admin"
            prefetch={true}
            className="flex items-center gap-1 text-gold-light hover:text-white font-semibold transition"
          >
            <ShieldCheck className="w-3 h-3 text-gold-primary" />
            <span>Admin</span>
          </Link>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-gold-primary/30 shadow-xs transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Brand Logo & Name */}
            <Link href="/" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 group" aria-label="Salon EyeLines Home">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gold-primary shadow-sm group-hover:scale-105 group-hover:border-gold-deep transition duration-300 flex-shrink-0">
                <Image
                  src="/images/salon_eyelines_logo.jpg"
                  alt="Salon EyeLines Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-2xl font-medium tracking-wider text-stone-800 uppercase leading-none group-hover:text-gold-deep transition">
                  Salon EyeLines
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold-deep font-semibold mt-0.5 sm:mt-1">
                  Elegance Redefined • Aluthgama
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with Active HIG State */}
            <nav className="hidden lg:flex items-center space-x-6" aria-label="Primary Navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative text-xs uppercase tracking-widest transition py-1.5 px-1 font-medium ${
                      isActive
                        ? "text-gold-deep font-bold"
                        : "text-stone-700 hover:text-gold-deep"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-deep rounded-full animate-in fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions: Desktop Button + Mobile Quick Book & Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/book"
                prefetch={true}
                className="btn-luxury shimmer-gold inline-flex items-center gap-1.5 sm:gap-2 bg-gold-primary hover:bg-gold-hover text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest px-3.5 sm:px-6 py-2 sm:py-3 rounded-lg shadow-gold transition"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">Book Appointment</span>
                <span className="xs:hidden sm:hidden">Book</span>
              </Link>

              {/* Mobile Menu Button - Accessible Touch Target */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-stone-700 hover:text-gold-deep hover:bg-gold-light/20 transition cursor-pointer"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Backdrop & Smooth Transition */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 top-16 sm:top-20 bg-stone-900/50 backdrop-blur-xs z-30 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-40 lg:hidden bg-white/95 backdrop-blur-xl border-b border-gold-primary/30 px-5 py-5 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between text-sm uppercase tracking-wider py-3 px-3.5 rounded-xl font-medium transition min-h-[48px] ${
                      isActive
                        ? "bg-gold-light/40 text-gold-deep font-bold"
                        : "text-stone-800 hover:bg-stone-50 hover:text-gold-deep active:bg-gold-light/20"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-gold-deep" />}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                <Link
                  href="/admin"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 text-xs uppercase tracking-wider text-gold-deep font-semibold py-3 px-3.5 rounded-xl bg-gold-light/15 hover:bg-gold-light/30 transition min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-primary" />
                  <span>Salon Admin Management Portal</span>
                </Link>

                <a
                  href={`tel:${SALON_INFO.phone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider hover:border-gold-primary transition"
                >
                  <Phone className="w-3.5 h-3.5 text-gold-deep" />
                  <span>Call {SALON_INFO.phone}</span>
                </a>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
