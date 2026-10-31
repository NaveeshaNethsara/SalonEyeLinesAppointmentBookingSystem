import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Clock, MessageSquare, Facebook } from "lucide-react";
import { SALON_INFO } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[#FFF9F5]/85 backdrop-blur-[2px] border-t border-gold-primary/30 pt-16 pb-8 text-stone-700 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-primary">
                <Image
                  src="/images/salon_eyelines_logo.jpg"
                  alt="Salon EyeLines"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-medium tracking-wide text-stone-900 uppercase block leading-none">
                  Salon EyeLines
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                  Elegance Redefined • Aluthgama
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              Where beauty meets master artistry. Founded on European spa tranquility, certified craftsmanship, and authentic Sri Lankan warmth under the leadership of {SALON_INFO.founder}.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={SALON_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-gold-primary/40 flex items-center justify-center text-stone-700 hover:bg-gold-primary hover:text-white transition"
                title="Facebook Community (10,370+ followers)"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SALON_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-gold-primary/40 flex items-center justify-center text-stone-700 hover:bg-green-600 hover:text-white transition"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Signature Services */}
          <div>
            <h4 className="font-serif text-lg text-stone-900 mb-4 font-semibold uppercase tracking-wider">
              Signature Treatments
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-stone-600">
              <li>
                <Link href="/services/precision-eyeliner-definition" className="hover:text-gold-deep transition">
                  Signature Precision Eyeliner
                </Link>
              </li>
              <li>
                <Link href="/services/royal-kandyan-bridal-dressing" className="hover:text-gold-deep transition">
                  Royal Kandyan Bridal Dressing
                </Link>
              </li>
              <li>
                <Link href="/services/keratin-lash-lift-tint" className="hover:text-gold-deep transition">
                  Keratin Lash Lift & Tint
                </Link>
              </li>
              <li>
                <Link href="/services/diamond-radiance-glow-facial" className="hover:text-gold-deep transition">
                  Diamond Radiance Glow Facial
                </Link>
              </li>
              <li>
                <Link href="/services/brazilian-keratin-smoothing" className="hover:text-gold-deep transition">
                  Brazilian Keratin Smoothing
                </Link>
              </li>
              <li>
                <Link href="/services/deluxe-gel-manicure-art" className="hover:text-gold-deep transition">
                  Deluxe Gel Manicure & Nail Art
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation Links */}
          <div>
            <h4 className="font-serif text-lg text-stone-900 mb-4 font-semibold uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-stone-600">
              <li>
                <Link href="/about" prefetch={true} className="hover:text-gold-deep transition">
                  The EyeLines Story & Team
                </Link>
              </li>
              <li>
                <Link href="/services" prefetch={true} className="hover:text-gold-deep transition">
                  Full Price & Duration Menu
                </Link>
              </li>
              <li>
                <Link href="/gallery" prefetch={true} className="hover:text-gold-deep transition">
                  Transformation Gallery
                </Link>
              </li>
              <li>
                <Link href="/book" prefetch={true} className="hover:text-gold-deep transition">
                  Online Appointment Booking
                </Link>
              </li>
              <li>
                <Link href="/appointments" prefetch={true} className="hover:text-gold-deep transition">
                  Look Up or Cancel Booking
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="hover:text-gold-deep transition">
                  Map Directions & Hours
                </Link>
              </li>
              <li>
                <Link href="/admin" prefetch={true} className="text-gold-deep hover:text-stone-900 font-medium transition flex items-center gap-1 pt-1">
                  Salon Admin Portal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Visit & Direct Contact */}
          <div>
            <h4 className="font-serif text-lg text-stone-900 mb-4 font-semibold uppercase tracking-wider">
              Salon Studio
            </h4>
            <div className="space-y-3 text-sm text-stone-600 font-light">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-deep flex-shrink-0 mt-0.5" />
                <span>{SALON_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-deep flex-shrink-0" />
                <a href={`tel:${SALON_INFO.phone}`} className="hover:text-gold-deep font-medium text-stone-800">
                  {SALON_INFO.phone}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gold-deep flex-shrink-0 mt-0.5" />
                <span>{SALON_INFO.hours}</span>
              </p>
            </div>
            <div className="mt-5">
              <Link
                href="/book"
                className="w-full text-center block bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded transition"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold-primary/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 font-light gap-4">
          <p>© 2026 Salon EyeLines. All rights reserved. Elegance Redefined.</p>
          <p>48, Ganegama Road, Aluthgama, Sri Lanka • Powered by Salon SaaS Architecture</p>
        </div>
      </div>
    </footer>
  );
}
