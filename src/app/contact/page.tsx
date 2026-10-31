import { MapPin, Phone, Clock, MessageSquare, Facebook, Send } from "lucide-react";
import { SALON_INFO } from "@/lib/data";

export const metadata = {
  title: "Contact & Studio Location | Salon EyeLines Aluthgama",
  description: "Find Salon EyeLines at 48, Ganegama Road, Aluthgama, Sri Lanka. Contact us on 077 547 4996 or WhatsApp for appointments and directions.",
};

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Visit Our Aluthgama Studio
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl font-light text-stone-900">
          Find Us & Get in <span className="italic text-gold-hover">Touch</span>
        </h1>
        <p className="text-base text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          Conveniently located in Ganegama Road, Aluthgama, offering dedicated customer parking and easy road access.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-8 border border-gold-primary/30 shadow-card space-y-8">
            <div>
              <h2 className="font-serif text-3xl font-light text-stone-900 mb-2">
                Salon EyeLines Studio
              </h2>
              <p className="text-xs text-stone-500 font-light">
                Under the creative direction of {SALON_INFO.founder}.
              </p>
            </div>

            <div className="space-y-6 text-sm text-stone-700">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gold-light/60 text-gold-deep flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-1">Address</h4>
                  <p className="font-light text-stone-600 leading-relaxed">{SALON_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gold-light/60 text-gold-deep flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-1">Direct Telephone</h4>
                  <a href={`tel:${SALON_INFO.phone}`} className="font-medium text-stone-900 hover:text-gold-deep transition block">
                    {SALON_INFO.phone}
                  </a>
                  <a href={`tel:${SALON_INFO.phoneInternational}`} className="text-xs text-stone-500 font-light block">
                    International: {SALON_INFO.phoneInternational}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gold-light/60 text-gold-deep flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-1">WhatsApp Concierge</h4>
                  <a
                    href={SALON_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline font-medium text-sm flex items-center gap-1"
                  >
                    Open WhatsApp Chat (+94 77 547 4996)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-gold-light/60 text-gold-deep flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-1">Hours of Operation</h4>
                  <p className="font-light text-stone-600">{SALON_INFO.hours}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gold-primary/20 flex gap-3">
              <a
                href={SALON_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold uppercase tracking-wider transition"
              >
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${SALON_INFO.phone}`}
                className="flex-1 text-center py-3 bg-gold-primary hover:bg-gold-hover text-white rounded text-xs font-semibold uppercase tracking-wider transition shadow-sm"
              >
                Call Salon
              </a>
            </div>
          </div>

          {/* Right Map Column */}
          <div className="lg:col-span-7 h-[500px] rounded-2xl overflow-hidden border border-gold-primary/30 shadow-card">
            <iframe
              title="Salon EyeLines Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15858.918174127917!2d79.995000!3d6.425000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae22dd81f08f87b%3A0x6b24bb8d56bce430!2sAluthgama%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
