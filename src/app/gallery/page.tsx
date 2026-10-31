"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/data";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Bridal", "Eyes", "Skin", "Hair", "Nails", "Interior"];

  const filtered = activeCategory === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Visual Transformations
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl font-light text-stone-900">
          The Salon EyeLines <span className="italic text-gold-hover">Gallery</span>
        </h1>
        <p className="text-base text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          Witness our real bride transformations, precision eyelines styling, and the soothing luxury interior of our Ganegama Road sanctuary in Aluthgama.
        </p>

        {/* Filter Pills */}
        <div role="tablist" aria-label="Gallery Categories" className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            const count = cat === "All" ? GALLERY_ITEMS.length : GALLERY_ITEMS.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(cat)}
                className={`btn-luxury text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-full transition cursor-pointer flex items-center gap-1.5 min-h-[40px] ${
                  isSelected
                    ? "bg-gold-primary text-white shadow-md ring-2 ring-gold-primary/40"
                    : "bg-white text-stone-700 border border-gold-primary/30 hover:border-gold-primary hover:bg-gold-light/20"
                }`}
              >
                <span>{cat}</span>
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

      {/* Gallery Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="luxury-card group relative h-96 rounded-2xl overflow-hidden border-2 border-white shadow-card cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-108 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/85 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition duration-300"></div>

              <div className="absolute bottom-6 left-6 right-6 space-y-2 transform transition duration-300 group-hover:-translate-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gold-light bg-gold-deep/40 px-2.5 py-0.5 rounded border border-gold-primary/40">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl font-normal text-white leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram/Facebook Callout */}
        <div className="mt-20 p-10 bg-white rounded-2xl border border-gold-primary/30 shadow-card text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold-deep font-semibold">
            Social Community
          </span>
          <h3 className="font-serif text-3xl font-light text-stone-900">
            Follow Our Latest Daily Makeovers
          </h3>
          <p className="text-sm text-stone-600 font-light leading-relaxed">
            We regularly post bridal dressing diaries, client video testimonials, and hair care tips for our 10,370+ followers on Facebook.
          </p>
          <div className="pt-2 flex justify-center gap-4 flex-wrap">
            <a
              href="https://web.facebook.com/profile.php?id=61569979371238"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury bg-espresso-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded transition"
            >
              Visit Facebook Page (10K+ Followers)
            </a>
            <Link
              href="/book"
              prefetch={true}
              className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded shadow-gold transition"
            >
              Book Your Transformation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
