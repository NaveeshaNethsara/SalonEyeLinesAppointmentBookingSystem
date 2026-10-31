"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, Phone, AlertCircle, CheckCircle2, XCircle, ArrowRight, Printer, Download, Loader2 } from "lucide-react";
import { AppointmentRecord } from "@/types";
import { reconcileAppointmentList } from "@/lib/appointments";
import LuxuryReceiptModal from "@/components/LuxuryReceiptModal";

export default function AppointmentsPage() {
  const [query, setQuery] = useState("");
  const [allBookings, setAllBookings] = useState<AppointmentRecord[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AppointmentRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<AppointmentRecord | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearchingServer, setIsSearchingServer] = useState(false);

  useEffect(() => {
    // 1. Instant cache retrieval for immediate 0ms render
    let hasCached = false;
    try {
      const cached = localStorage.getItem("salon_cached_my_bookings");
      if (cached) {
        const parsed: AppointmentRecord[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllBookings(parsed);
          setFilteredBookings(parsed);
          hasCached = true;
          setIsInitialLoading(false);
        }
      }
    } catch (e) {
      console.warn("Failed to load cached bookings:", e);
    }

    // 2. Fetch live recent bookings in ONE fast request
    try {
      const recentRefs: string[] = JSON.parse(localStorage.getItem("salon_recent_booking_refs") || "[]");
      if (Array.isArray(recentRefs) && recentRefs.length > 0) {
        if (!hasCached) {
          setIsInitialLoading(true);
        }
        setIsSearchingServer(true);
        const refsQuery = recentRefs.slice(0, 5).join(",");
        fetch(`/api/appointments?refs=${encodeURIComponent(refsQuery)}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((list: AppointmentRecord[]) => {
            if (Array.isArray(list)) {
              setAllBookings(list);
              setFilteredBookings(list);
              try {
                localStorage.setItem("salon_cached_my_bookings", JSON.stringify(list));
              } catch {}
            }
          })
          .catch((err) => console.warn("Live lookup error:", err))
          .finally(() => {
            setIsSearchingServer(false);
            setIsInitialLoading(false);
          });
      } else {
        setIsInitialLoading(false);
      }
    } catch (e) {
      console.error(e);
      setIsInitialLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const q = query.trim();
    if (!q) {
      setFilteredBookings(allBookings);
      return;
    }

    if (q.length >= 3) {
      setIsSearchingServer(true);
      try {
        const res = await fetch(`/api/appointments?query=${encodeURIComponent(q)}`);
        if (res.ok) {
          const remoteMatches: AppointmentRecord[] = await res.json();
          if (Array.isArray(remoteMatches)) {
            setFilteredBookings(remoteMatches);
          }
        }
      } catch (err) {
        console.warn("Live lookup error:", err);
      } finally {
        setIsSearchingServer(false);
      }
    } else {
      const qLower = q.toLowerCase();
      const localMatches = allBookings.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(qLower) ||
          b.clientPhone.toLowerCase().includes(qLower) ||
          b.clientName.toLowerCase().includes(qLower)
      );
      setFilteredBookings(localMatches);
    }
  };

  const handleCancelBooking = async (refCode: string) => {
    if (confirm(`Are you sure you want to cancel appointment ${refCode}?`)) {
      try {
        const res = await fetch(`/api/appointments/${refCode}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to cancel appointment in database.");
          return;
        }

        const updated = allBookings.map((b) =>
          b.referenceCode === refCode ? { ...b, status: "CANCELLED" as const } : b
        );
        setAllBookings(updated);
        setFilteredBookings(
          filteredBookings.map((b) =>
            b.referenceCode === refCode ? { ...b, status: "CANCELLED" as const } : b
          )
        );
      } catch (err) {
        console.error("PostgreSQL cancel sync error:", err);
        alert("Network error connecting to database server.");
      }
    }
  };

  return (
    <div className="py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2 sm:space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Client Self-Service Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-900 leading-tight">
          My Salon Appointments
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md mx-auto">
          Look up your reserved beauty appointments using your Reference Code (e.g. EL-849201) or phone number.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8 sm:mb-12 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by Ref Code (e.g. EL-849201) or Phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gold-primary/40 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-primary min-h-[48px]"
          />
        </div>
        <button
          type="submit"
          disabled={isSearchingServer}
          className="bg-gold-primary hover:bg-gold-hover text-white px-6 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50 min-h-[48px] inline-flex items-center justify-center cursor-pointer"
        >
          {isSearchingServer ? "Looking up..." : "Look Up"}
        </button>
      </form>

      {/* Appointments List */}
      <div className="space-y-4">
        {isInitialLoading || (isSearchingServer && filteredBookings.length === 0) ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center border border-gold-primary/30 shadow-card space-y-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-gold-primary/25 animate-ping" />
              <div className="w-14 h-14 rounded-full border-2 border-gold-primary/30 border-t-gold-deep animate-spin flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gold-deep animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-stone-900 font-normal">
                Locating Your Salon Reservations...
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-light max-w-md mx-auto">
                Securely connecting to the Salon EyeLines database to retrieve your verified bookings, allocated specialists, and treatment schedules.
              </p>
            </div>
            {/* Shimmering card placeholders */}
            <div className="space-y-3 max-w-2xl mx-auto pt-2">
              <div className="h-28 rounded-xl bg-gradient-to-r from-stone-50 via-gold-50/40 to-stone-50 border border-gold-primary/20 animate-pulse p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-stone-200/80 rounded w-1/2" />
                  <div className="h-5 bg-gold-200/60 rounded-full w-24" />
                </div>
                <div className="flex gap-4">
                  <div className="h-3 bg-stone-200/60 rounded w-28" />
                  <div className="h-3 bg-stone-200/60 rounded w-24" />
                  <div className="h-3 bg-stone-200/60 rounded w-32" />
                </div>
              </div>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gold-primary/30 space-y-4">
            <AlertCircle className="w-12 h-12 text-gold-deep mx-auto opacity-70" />
            <h3 className="font-serif text-2xl text-stone-900 font-light">
              No Appointments Found
            </h3>
            <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
              {searched
                ? "No reservations match your search. Please check your reference code or phone number."
                : "You have no active salon bookings recorded on this device yet."}
            </p>
            <div className="pt-2">
              <Link
                href="/book"
                prefetch={true}
                className="inline-flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded shadow transition"
              >
                Book a New Appointment
              </Link>
            </div>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.referenceCode}
              className="bg-white rounded-xl p-4 sm:p-6 border border-gold-primary/30 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6"
            >
              <div className="space-y-2 w-full md:w-auto">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3">
                  <span className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    {b.serviceName}
                  </span>
                  {b.status === "CONFIRMED" ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Confirmed
                    </span>
                  ) : b.status === "IN_PROGRESS" ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                      In Session
                    </span>
                  ) : b.status === "COMPLETED" ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3 h-3 text-rose-500" />
                      Cancelled
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-stone-600 font-light">
                  <span className="flex items-center gap-1 font-mono font-medium text-gold-deep">
                    Ref: {b.referenceCode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {b.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {b.time}
                  </span>
                  <span>Specialist: <strong>{b.staffName}</strong></span>
                </div>

                <div className="text-xs text-stone-500 font-light">
                  Guest: <strong>{b.clientName}</strong> ({b.clientPhone}) • Occasion: {b.occasion}
                </div>
              </div>

              <div className="flex items-center gap-4 md:flex-col md:items-end w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  LKR {b.totalPriceLKR.toLocaleString()}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedReceiptBooking(b)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-gold-primary text-stone-700 hover:text-gold-deep text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer bg-white shadow-xs min-h-[38px]"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-deep" />
                    <span>Receipt</span>
                  </button>

                  {b.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleCancelBooking(b.referenceCode)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider transition underline min-h-[38px] px-1"
                    >
                      Cancel Slot
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Luxury Receipt Modal */}
      <LuxuryReceiptModal
        isOpen={!!selectedReceiptBooking}
        onClose={() => setSelectedReceiptBooking(null)}
        booking={selectedReceiptBooking}
      />
    </div>
  );
}
