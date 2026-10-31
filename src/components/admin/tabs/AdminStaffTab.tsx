"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Plus, RotateCcw, ExternalLink, Check, Edit2, Trash2, Users } from "lucide-react";
import { SpecialistItem } from "@/types";

interface AdminStaffTabProps {
  staffList: SpecialistItem[];
  onOpenAddSpecialist: () => void;
  onOpenEditSpecialist: (specialist: SpecialistItem) => void;
  onOpenDeleteSpecialist: (specialist: SpecialistItem) => void;
  onOpenResetSpecialists: () => void;
}

export default function AdminStaffTab({
  staffList,
  onOpenAddSpecialist,
  onOpenEditSpecialist,
  onOpenDeleteSpecialist,
  onOpenResetSpecialists,
}: AdminStaffTabProps) {
  const [specialistSearch, setSpecialistSearch] = useState("");

  const filteredStaff = staffList.filter((st) => {
    if (!specialistSearch.trim()) return true;
    const q = specialistSearch.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.role.toLowerCase().includes(q) ||
      (st.specialties || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gold-primary/30 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            Artisan Team & Staff Roster
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 mt-0.5">
            Beauty Stylists & Specialists ({staffList.length})
          </h3>
          <p className="text-xs text-stone-500 font-light mt-1 max-w-2xl">
            Manage master bridal directors, lash cosmetologists, and aestheticians. Stylist profile photos sync directly to the{" "}
            <Link href="/book" target="_blank" className="text-gold-deep underline font-medium hover:text-stone-900">
              Choose Your Beauty Specialist
            </Link>{" "}
            booking concierge and the{" "}
            <Link href="/about" target="_blank" className="text-gold-deep underline font-medium hover:text-stone-900">
              About Us
            </Link>{" "}
            team showcase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenResetSpecialists}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:border-gold-primary hover:text-stone-900 hover:bg-stone-50 transition inline-flex items-center gap-1.5 cursor-pointer"
            title="Reset to default 4 salon specialists"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddSpecialist}
            className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 rounded-xl shadow-gold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon & Search Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search specialists by name, role, or specialty (e.g. Nayani, Eyeliner, Bridal)..."
            value={specialistSearch}
            onChange={(e) => setSpecialistSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 shadow-sm"
          />
          {specialistSearch && (
            <button
              type="button"
              onClick={() => setSpecialistSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="md:col-span-4 flex items-center justify-between sm:justify-end gap-3 bg-white border border-stone-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-xs text-stone-500">
            Photos set: <strong className="text-stone-800">{staffList.filter((s) => !!s.avatar).length}</strong> / {staffList.length}
          </span>
          <Link
            href="/book"
            target="_blank"
            className="text-xs font-semibold text-gold-deep hover:underline inline-flex items-center gap-1"
          >
            <span>Preview Booking</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Specialists Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStaff.map((st) => {
          const isFounder = st.role.toLowerCase().includes("founder") || st.id === "spec-01";
          return (
            <div
              key={st.id}
              className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-gold-primary/40 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                {/* Avatar / Photo preview */}
                <div className="w-20 h-20 rounded-full bg-gold-light border-2 border-gold-primary flex items-center justify-center font-serif text-2xl font-bold text-gold-deep flex-shrink-0 overflow-hidden relative shadow-sm">
                  {st.avatar ? (
                    <Image
                      src={st.avatar}
                      alt={st.name}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  ) : (
                    st.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-xl text-stone-900 font-medium truncate">
                      {st.name}
                    </h4>
                    {isFounder && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-espresso-900 text-gold-light border border-gold-primary/40">
                        Founder
                      </span>
                    )}
                    {st.avatar ? (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Photo Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                        Initials Only
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gold-deep uppercase tracking-wider font-semibold block mt-1">
                    {st.role}
                  </span>
                  <span className="text-xs text-stone-500 font-light block mt-0.5">
                    {st.experience}
                  </span>

                  <p className="text-xs text-stone-600 font-light mt-2 line-clamp-2 leading-relaxed">
                    {st.bio}
                  </p>
                </div>
              </div>

              {/* Specialties & Actions */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                  {(st.specialties || []).map((sp, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#FAF7F2] border border-gold-primary/25 text-stone-700 px-2 py-0.5 rounded"
                    >
                      {sp}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onOpenEditSpecialist(st)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:border-gold-primary hover:text-gold-deep hover:bg-gold-light/20 text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDeleteSpecialist(st)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty search state */}
      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300 space-y-3">
          <Users className="w-8 h-8 text-stone-400 mx-auto" />
          <h4 className="font-serif text-lg text-stone-800">No Specialists Found</h4>
          <p className="text-xs text-stone-500">
            No stylists match &quot;{specialistSearch}&quot;. Try a different search query.
          </p>
          <button
            type="button"
            onClick={() => setSpecialistSearch("")}
            className="text-xs text-gold-deep font-semibold underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
