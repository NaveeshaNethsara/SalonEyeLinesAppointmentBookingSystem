"use client";

import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import { SALON_INFO } from "@/lib/data";

interface AdminHeaderProps {
  currentUser: { id: string; email: string; name: string; role: string } | null;
  activeTab: "appointments" | "services" | "staff" | "users";
  onTabChange: (tab: "appointments" | "services" | "staff" | "users") => void;
  onOpenAddService: () => void;
  onOpenAddUser: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  isLoadingAppointments?: boolean;
  activeBookingsCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  appointmentsCount: number;
  servicesCount: number;
  staffCount: number;
  usersCount: number;
}

export default function AdminHeader({
  currentUser,
  activeTab,
  onTabChange,
  onOpenAddService,
  onOpenAddUser,
  onLogout,
  isLoggingOut,
  isLoadingAppointments = false,
  activeBookingsCount,
  completedCount,
  cancelledCount,
  totalRevenue,
  appointmentsCount,
  servicesCount,
  staffCount,
  usersCount,
}: AdminHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Dashboard Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gold-primary/30 shadow-card flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-deep font-semibold">
              Management Portal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              System Active
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-900">
            Salon EyeLines Admin
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Welcome back, <strong>{currentUser?.name || SALON_INFO.founder}</strong> ({currentUser?.role || "SALON_OWNER"}). Manage reservations, treatments, pricing, and system credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === "services" && (
            <button
              onClick={onOpenAddService}
              className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Treatment
            </button>
          )}
          {activeTab === "users" && (
            <button
              onClick={onOpenAddUser}
              className="btn-luxury shimmer-gold bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Create New Credential
            </button>
          )}
          <Link
            href="/book"
            className="bg-stone-900 hover:bg-stone-800 text-gold-light text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded shadow-sm inline-flex items-center gap-1.5 border border-gold-primary/30"
          >
            <Plus className="w-4 h-4 text-gold-primary" />
            New Walk-In Booking
          </Link>
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="bg-stone-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-stone-600 text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded shadow-sm inline-flex items-center gap-1.5 border border-stone-200 transition cursor-pointer"
            title="Sign Out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gold-primary/30 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold-light/60 flex items-center justify-center text-gold-deep flex-shrink-0">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase text-stone-500 font-medium block">Active</span>
            {isLoadingAppointments && appointmentsCount === 0 ? (
              <span className="inline-block w-8 h-7 bg-stone-200/80 rounded animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{activeBookingsCount}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gold-primary/30 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase text-stone-500 font-medium block">Completed</span>
            {isLoadingAppointments && appointmentsCount === 0 ? (
              <span className="inline-block w-8 h-7 bg-stone-200/80 rounded animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{completedCount}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gold-primary/30 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase text-stone-500 font-medium block">Cancelled</span>
            {isLoadingAppointments && appointmentsCount === 0 ? (
              <span className="inline-block w-8 h-7 bg-stone-200/80 rounded animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{cancelledCount}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gold-primary/30 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase text-stone-500 font-medium block">Booked Value</span>
            {isLoadingAppointments && appointmentsCount === 0 ? (
              <span className="inline-block w-24 h-6 bg-stone-200/80 rounded animate-pulse my-0.5" />
            ) : (
              <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                LKR {totalRevenue.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex border-b border-gold-primary/30 gap-4 sm:gap-6 text-xs uppercase tracking-wider font-semibold overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => onTabChange("appointments")}
          className={`pb-3 border-b-2 transition whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
            activeTab === "appointments"
              ? "border-gold-primary text-gold-deep"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <span>Appointments</span>
          {isLoadingAppointments && appointmentsCount === 0 ? (
            <span className="w-6 h-3.5 bg-gold-primary/20 rounded animate-pulse" />
          ) : (
            <span>({appointmentsCount})</span>
          )}
        </button>
        <button
          onClick={() => onTabChange("services")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "services"
              ? "border-gold-primary text-gold-deep"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <span>Services ({servicesCount})</span>
          <span className="bg-gold-light text-gold-deep text-[10px] px-2 py-0.5 rounded-full font-bold">
            CRUD
          </span>
        </button>
        <button
          onClick={() => onTabChange("staff")}
          className={`pb-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "staff"
              ? "border-gold-primary text-gold-deep"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Staff & Specialists ({staffCount})
        </button>
        <button
          onClick={() => onTabChange("users")}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "users"
              ? "border-gold-primary text-gold-deep"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gold-primary" />
          <span>Users & Roles ({usersCount})</span>
        </button>
      </div>
    </div>
  );
}
