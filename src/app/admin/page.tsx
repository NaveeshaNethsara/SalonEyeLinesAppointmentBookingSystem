"use client";

import { useState, useEffect } from "react";
import { Check, AlertTriangle, Sparkles } from "lucide-react";
import { AppointmentRecord, ServiceItem, SpecialistItem, AdminUserRecord } from "@/types";
import { SPECIALISTS } from "@/lib/data";
import {
  getStoredServices,
  createService,
  updateExistingService,
  deleteServiceById,
  restoreDefaultServices,
  subscribeToServices,
  saveServicesToStorage,
} from "@/lib/services";
import {
  getStoredSpecialists,
  createSpecialist,
  updateExistingSpecialist,
  deleteSpecialistById,
  restoreDefaultSpecialists,
  subscribeToSpecialists,
  saveSpecialistsToStorage,
} from "@/lib/specialists";

import AdminLoginGate from "@/components/admin/AdminLoginGate";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminAppointmentsTab from "@/components/admin/tabs/AdminAppointmentsTab";
import AdminServicesTab from "@/components/admin/tabs/AdminServicesTab";
import AdminStaffTab from "@/components/admin/tabs/AdminStaffTab";
import AdminUsersTab from "@/components/admin/tabs/AdminUsersTab";

import AdminServiceModal from "@/components/admin/modals/AdminServiceModal";
import AdminSpecialistModal from "@/components/admin/modals/AdminSpecialistModal";
import AdminUserModal from "@/components/admin/modals/AdminUserModal";
import AdminRescheduleModal from "@/components/admin/modals/AdminRescheduleModal";
import AdminWhatsAppModal from "@/components/admin/modals/AdminWhatsAppModal";
import AdminConfirmModal from "@/components/admin/modals/AdminConfirmModal";
import AdminDepositReviewModal from "@/components/admin/modals/AdminDepositReviewModal";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "services" | "staff" | "users">("appointments");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("salon_admin_user") || localStorage.getItem("salon_admin_user");
      if (cached) return true;
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; role: string } | null>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("salon_admin_user") || localStorage.getItem("salon_admin_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return null;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Data collections with instant sessionStorage cache hydration
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("salon_admin_appointments_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("salon_admin_appointments_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return false;
          }
        }
      } catch {}
    }
    return true;
  });
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<SpecialistItem[]>(SPECIALISTS);
  const [dbUsers, setDbUsers] = useState<AdminUserRecord[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [isDeleteServiceModalOpen, setIsDeleteServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const [isResetServicesConfirmOpen, setIsResetServicesConfirmOpen] = useState(false);

  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistItem | null>(null);

  const [isDeleteSpecialistModalOpen, setIsDeleteSpecialistModalOpen] = useState(false);
  const [specialistToDelete, setSpecialistToDelete] = useState<SpecialistItem | null>(null);

  const [isResetSpecialistsConfirmOpen, setIsResetSpecialistsConfirmOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<AppointmentRecord | null>(null);
  const [whatsAppModalAppt, setWhatsAppModalAppt] = useState<AppointmentRecord | null>(null);
  const [depositReviewAppt, setDepositReviewAppt] = useState<AppointmentRecord | null>(null);
  const [isSweepingExpired, setIsSweepingExpired] = useState(false);

  // Phone normalizer for WhatsApp
  const formatWhatsAppPhone = (phone: string): string => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "94" + cleaned.slice(1);
    } else if (cleaned.length === 9 && ["7", "1", "2", "3"].includes(cleaned[0])) {
      cleaned = "94" + cleaned;
    }
    return cleaned;
  };

  // Pre-written appointment templates for WhatsApp
  const getPreWrittenWhatsAppMessage = (
    appt: AppointmentRecord,
    type: "confirmation" | "reminder" | "thankyou" | "deposit_verified" | "deposit_expired" = "confirmation"
  ): string => {
    if (type === "reminder") {
      return (
        `✨ *SALON EYELINES — APPOINTMENT REMINDER*\n\n` +
        `Dear ${appt.clientName},\n\n` +
        `Friendly reminder of your bespoke beauty appointment tomorrow at *Salon EyeLines*:\n\n` +
        `💆‍♀️ *Treatment:* ${appt.serviceName}\n` +
        `🌟 *Specialist:* ${appt.staffName}\n` +
        `📅 *Date:* ${appt.date}\n` +
        `⏰ *Time Slot:* ${appt.time}\n` +
        `📋 *Booking Reference:* ${appt.referenceCode}\n` +
        `📍 *Sanctuary:* 48, Ganegama Road, Aluthgama 12080\n\n` +
        `We look forward to welcoming you! If you need any assistance, please reply directly here.\n\n` +
        `_Salon EyeLines — Haute Beauté & Bridal Sanctuary_`
      );
    }

    if (type === "thankyou") {
      return (
        `✨ *SALON EYELINES — THANK YOU FOR VISITING*\n\n` +
        `Dear ${appt.clientName},\n\n` +
        `Thank you for visiting *Salon EyeLines* today for your *${appt.serviceName}* with *${appt.staffName}*!\n\n` +
        `We hope your ritual was deeply rejuvenating. If you have any aftercare questions, feel free to message us here.\n\n` +
        `We look forward to welcoming you back soon!\n\n` +
        `_With elegance,_ \n` +
        `*Nayani Munasinghe & Team EyeLines*`
      );
    }

    if (type === "deposit_verified") {
      const depositPaid = appt.depositPaidLKR || appt.depositRequiredLKR || Math.round((appt.totalPriceLKR || 0) * 0.2);
      const balance = Math.max(0, (appt.totalPriceLKR || 0) - depositPaid);
      return (
        `✨ *SALON EYELINES — BRIDAL ADVANCE DEPOSIT VERIFIED*\n\n` +
        `Dear ${appt.clientName},\n\n` +
        `We have verified your advance bank deposit for your bridal reservation!\n\n` +
        `📋 *Booking Reference:* ${appt.referenceCode}\n` +
        `👰 *Bridal Treatment:* ${appt.serviceName}\n` +
        `🌟 *Lead Specialist:* ${appt.staffName}\n` +
        `📅 *Reserved Date:* ${appt.date} at ${appt.time}\n` +
        `💰 *Deposit Received:* LKR ${depositPaid.toLocaleString()}\n` +
        `💵 *Balance Payable at Salon:* LKR ${balance.toLocaleString()}\n` +
        `📍 *Location:* 48, Ganegama Road, Aluthgama 12080\n\n` +
        `Your bespoke bridal specialist slot is now 100% locked into our master schedule. We look forward to creating your perfection!\n\n` +
        `_Haute Beauté & Bridal Sanctuary — Elegance Redefined._`
      );
    }

    if (type === "deposit_expired") {
      return (
        `✨ *SALON EYELINES — BRIDAL RESERVATION HOLD EXPIRED*\n\n` +
        `Dear ${appt.clientName},\n\n` +
        `We are writing to notify you that the 24-hour advance deposit verification window for your bridal reservation has elapsed, and the reserved slot has been released back to our schedule:\n\n` +
        `📋 *Booking Reference:* ${appt.referenceCode}\n` +
        `👰 *Treatment:* ${appt.serviceName}\n` +
        `🌟 *Specialist:* ${appt.staffName}\n` +
        `📅 *Original Date:* ${appt.date} at ${appt.time}\n\n` +
        `If you have already completed your bank transfer or wish to re-secure your specialist slot, please reply immediately with your slip or call us at +94 77 547 4996 so our concierge can assist you.\n\n` +
        `_Salon EyeLines — Haute Beauté & Bridal Sanctuary_`
      );
    }

    // Default: Complete Booking Confirmation
    return (
      `✨ *SALON EYELINES — APPOINTMENT CONFIRMATION*\n\n` +
      `Dear ${appt.clientName},\n\n` +
      `Your reservation at *Salon EyeLines* has been confirmed!\n\n` +
      `📋 *Booking Reference:* ${appt.referenceCode}\n` +
      `💆‍♀️ *Treatment:* ${appt.serviceName}\n` +
      `🌟 *Specialist:* ${appt.staffName}\n` +
      `📅 *Date:* ${appt.date}\n` +
      `⏰ *Time Slot:* ${appt.time}\n` +
      `💎 *Total Investment:* LKR ${Number(appt.totalPriceLKR || 0).toLocaleString()}\n` +
      `📍 *Location:* 48, Ganegama Road, Aluthgama 12080, Sri Lanka\n\n` +
      `Please arrive 10 minutes prior to your bespoke consultation. If you need to modify your schedule, reply directly to this message or call us at +94 77 547 4996.\n\n` +
      `_Haute Beauté & Bridal Sanctuary — Elegance Redefined._`
    );
  };

  const loadDbUsers = () => {
    fetch("/api/auth/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbUsers(data);
        }
      })
      .catch((err) => console.warn("Failed to load DB users:", err));
  };

  // Mount effect: Session verification + initial loads
  useEffect(() => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("salon_admin_token") || sessionStorage.getItem("salon_admin_token") || "")
      : "";
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("/api/auth/me", { headers })
      .then(async (res) => {
        if (!res.ok) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("salon_admin_user");
            sessionStorage.removeItem("salon_admin_token");
            localStorage.removeItem("salon_admin_user");
            localStorage.removeItem("salon_admin_token");
          }
          setIsAuthenticated(false);
          return;
        }
        const data = await res.json();
        if (data?.authenticated && data.user) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("salon_admin_user", JSON.stringify(data.user));
            localStorage.setItem("salon_admin_user", JSON.stringify(data.user));
          }
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          loadDbUsers();
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        const cached = typeof window !== "undefined"
          ? (sessionStorage.getItem("salon_admin_user") || localStorage.getItem("salon_admin_user"))
          : null;
        if (!cached) {
          setIsAuthenticated(false);
        }
      });

    // 1. Appointments live from Supabase PostgreSQL
    fetch("/api/appointments", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
          try {
            sessionStorage.setItem("salon_admin_appointments_cache", JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => console.warn("PostgreSQL appointments sync deferred:", err))
      .finally(() => {
        setIsLoadingAppointments(false);
      });

    // 2. Services live from Supabase PostgreSQL
    setServicesList(getStoredServices());
    fetch("/api/services", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServicesList(data);
          saveServicesToStorage(data);
        }
      })
      .catch((err) => console.warn("Live services admin fetch error:", err));

    const unsubscribeServices = subscribeToServices((updated) => {
      setServicesList(updated);
    });

    // 2b. Specialists live from Supabase PostgreSQL
    setStaffList(getStoredSpecialists());
    fetch("/api/specialists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStaffList(data);
          saveSpecialistsToStorage(data);
        }
      })
      .catch((err) => console.warn("Live specialists admin fetch error:", err));

    const unsubscribeSpecialists = subscribeToSpecialists((updated) => {
      setStaffList(updated);
    });

    // 3. Tab parameter from URL (?tab=services)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "services" || tabParam === "staff" || tabParam === "appointments" || tabParam === "users") {
        setActiveTab(tabParam as any);
      }
    }

    return () => {
      unsubscribeServices();
      unsubscribeSpecialists();
    };
  }, []);

  const handleTabChange = (tab: "appointments" | "services" | "staff" | "users") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("salon_admin_user");
      sessionStorage.removeItem("salon_admin_token");
      localStorage.removeItem("salon_admin_user");
      localStorage.removeItem("salon_admin_token");
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsLoggingOut(false);
    showToast("Signed out from admin management", "info");
  };

  // Appointment Status update
  const handleUpdateStatus = async (
    refCode: string,
    newStatus: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ) => {
    try {
      const res = await fetch(`/api/appointments/${refCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        showToast(`Failed to update status in Supabase database`, "warning");
        return;
      }

      const updated = appointments.map((a) =>
        a.referenceCode === refCode ? { ...a, status: newStatus } : a
      );
      setAppointments(updated);
      showToast(`Appointment ${refCode} updated to ${newStatus}`, "info");
    } catch (err) {
      console.error("PostgreSQL status sync error:", err);
      showToast(`Network error updating status`, "warning");
    }
  };

  // Deposit Verification
  const handleVerifyDeposit = async (
    refCode: string,
    depositPaidLKR: number,
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/appointments/${refCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_DEPOSIT",
          depositPaidLKR,
          notes
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to verify deposit in database", "warning");
        return;
      }

      const updated = appointments.map((a) =>
        a.referenceCode === refCode
          ? {
              ...a,
              status: "CONFIRMED" as const,
              depositPaidLKR,
              depositVerifiedAt: new Date().toISOString()
            }
          : a
      );
      setAppointments(updated);
      showToast(`Deposit of LKR ${depositPaidLKR.toLocaleString()} verified for ${refCode}`, "success");

      // Locate updated appointment and offer instant WhatsApp notification
      const verifiedAppt = updated.find((a) => a.referenceCode === refCode);
      if (verifiedAppt) {
        setWhatsAppModalAppt(verifiedAppt);
      }
    } catch (err) {
      console.error("Deposit verification network error:", err);
      showToast("Network error verifying deposit", "warning");
    }
  };

  // Extend Deposit Hold by +24 Hours (Staff Action)
  const handleExtendHold = async (refCode: string) => {
    try {
      const token = typeof window !== "undefined"
        ? (localStorage.getItem("salon_admin_token") || sessionStorage.getItem("salon_admin_token") || "")
        : "";
      const res = await fetch(`/api/appointments/${refCode}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: "EXTEND_HOLD",
          additionalHours: 24
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extend deposit hold.");
      }

      showToast(`Deposit hold for ${refCode} successfully extended by +24 hours!`, "success");

      // Update in state: reset createdAt to now
      const nowIso = new Date().toISOString();
      setAppointments((prev) =>
        prev.map((a) =>
          a.referenceCode === refCode
            ? { ...a, createdAt: nowIso }
            : a
        )
      );

      // If review modal is currently open on this appointment, update its createdAt
      if (depositReviewAppt?.referenceCode === refCode) {
        setDepositReviewAppt((prev) =>
          prev ? { ...prev, createdAt: nowIso } : null
        );
      }
    } catch (err: any) {
      console.error("Extend hold error:", err);
      showToast(err.message || "Failed to extend hold", "warning");
    }
  };

  // Automated / On-Demand Sweep of Expired Deposit Holds
  const handleSweepExpiredDeposits = async () => {
    setIsSweepingExpired(true);
    try {
      const token = typeof window !== "undefined"
        ? (localStorage.getItem("salon_admin_token") || sessionStorage.getItem("salon_admin_token") || "")
        : "";
      const res = await fetch("/api/cron/cleanup-expired-deposits", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sweep expired deposit holds.");
      }

      if (data.reconciledCount > 0) {
        showToast(`Swept and released ${data.reconciledCount} expired deposit hold(s)`, "info");
        // Reload appointments from live database
        const refreshed = await fetch("/api/appointments", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store"
        }).then((r) => r.json());
        if (Array.isArray(refreshed)) {
          setAppointments(refreshed);
        }
      } else {
        showToast("No expired deposit holds found. All reservations active.", "info");
      }
    } catch (err: any) {
      console.error("Sweep expired deposits error:", err);
      showToast(err.message || "Failed to sweep expired deposits", "warning");
    } finally {
      setIsSweepingExpired(false);
    }
  };

  // Reschedule Confirmation
  const handleConfirmReschedule = async (
    refCode: string,
    newDate: string,
    newTime: string,
    newStaffId: string
  ) => {
    const res = await fetch(`/api/appointments/${refCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newDate,
        time: newTime,
        staffId: newStaffId,
        status: "CONFIRMED",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to reschedule appointment.");
    }

    const targetStaff = SPECIALISTS.find((s) => s.id === newStaffId);
    const updatedList = appointments.map((a) => {
      if (a.referenceCode === refCode) {
        return {
          ...a,
          date: newDate,
          time: newTime,
          staffId: newStaffId,
          staffName: targetStaff?.name || a.staffName,
          status: "CONFIRMED" as const,
        };
      }
      return a;
    });

    setAppointments(updatedList);
    setRescheduleModalAppt(null);
    showToast(
      `Appointment ${refCode} successfully rescheduled to ${newDate} at ${newTime}! Status restored to Confirmed.`,
      "success"
    );
  };

  // Service Save / Create / Update
  const handleSaveService = async (serviceData: any) => {
    if (serviceData.id) {
      const updated = await updateExistingService(serviceData.id, serviceData);
      showToast(`Successfully updated "${updated.name}" in database`, "success");
    } else {
      const created = await createService(serviceData);
      showToast(`Successfully added new treatment "${created.name}" to database`, "success");
    }

    const refreshed = await fetch("/api/services", { cache: "no-store" }).then((r) => r.json());
    if (Array.isArray(refreshed)) {
      setServicesList(refreshed);
    }
  };

  // Service Delete
  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    const name = serviceToDelete.name;
    try {
      await deleteServiceById(serviceToDelete.id);
      setIsDeleteServiceModalOpen(false);
      setServiceToDelete(null);
      showToast(`Removed "${name}" from salon catalog database`, "warning");

      const refreshed = await fetch("/api/services", { cache: "no-store" }).then((r) => r.json());
      if (Array.isArray(refreshed)) {
        setServicesList(refreshed);
      }
    } catch (err: any) {
      console.error("Failed to delete service from database:", err);
      showToast(err.message || "Failed to delete service from database", "warning");
    }
  };

  // Service Restore Defaults
  const handleConfirmResetServices = () => {
    restoreDefaultServices();
    setIsResetServicesConfirmOpen(false);
    showToast("Restored salon catalog to the original 12 signature offerings", "info");
  };

  // Specialist Save / Create / Update
  const handleSaveSpecialist = async (specialistData: any) => {
    if (specialistData.id) {
      await updateExistingSpecialist(specialistData.id, specialistData);
      showToast(`Updated profile for ${specialistData.name} in database`, "success");
    } else {
      await createSpecialist(specialistData);
      showToast(`Added ${specialistData.name} to Salon EyeLines database roster`, "success");
    }

    const refreshed = await fetch("/api/specialists", { cache: "no-store" }).then((r) => r.json());
    if (Array.isArray(refreshed)) {
      setStaffList(refreshed);
    }
  };

  // Specialist Delete
  const handleConfirmDeleteSpecialist = async () => {
    if (!specialistToDelete) return;
    const name = specialistToDelete.name;
    try {
      await deleteSpecialistById(specialistToDelete.id);
      setIsDeleteSpecialistModalOpen(false);
      setSpecialistToDelete(null);
      showToast(`Removed "${name}" from database specialists roster`, "warning");

      const refreshed = await fetch("/api/specialists", { cache: "no-store" }).then((r) => r.json());
      if (Array.isArray(refreshed)) {
        setStaffList(refreshed);
      }
    } catch (err: any) {
      console.error("Failed to delete specialist from database:", err);
      showToast(err.message || "Failed to delete specialist", "warning");
    }
  };

  // Specialist Restore Defaults
  const handleConfirmResetSpecialists = () => {
    restoreDefaultSpecialists();
    setIsResetSpecialistsConfirmOpen(false);
    showToast("Restored specialists roster to original salon artisans", "info");
  };

  // User Create
  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: "STAFF" | "SALON_OWNER" | "SUPER_ADMIN";
  }) => {
    const res = await fetch("/api/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create user in PostgreSQL.");
    }
    setDbUsers((prev) => [...prev, data]);
    showToast(`Created credential for "${data.name}" in PostgreSQL database!`, "success");
  };

  // User Delete
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const token = typeof window !== "undefined"
        ? (localStorage.getItem("salon_admin_token") || sessionStorage.getItem("salon_admin_token") || "")
        : "";
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/auth/users/${userToDelete.id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user account.");
      }
      setDbUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      const deletedName = userToDelete.name;
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
      showToast(`User account "${deletedName}" was deleted successfully.`, "warning");
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      showToast(err.message || "Failed to delete user account", "warning");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Analytics Metrics
  const totalRevenue = appointments
    .filter((a) => a.status !== "CANCELLED")
    .reduce((sum, a) => sum + a.totalPriceLKR, 0);

  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const inProgressCount = appointments.filter((a) => a.status === "IN_PROGRESS").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length;
  const activeBookingsCount = confirmedCount + inProgressCount;

  // Unauthenticated Gateway
  if (!isAuthenticated) {
    return (
      <AdminLoginGate
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          loadDbUsers();
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="py-12 bg-[#FAF7F2] min-h-screen">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium ${
              toast.type === "success"
                ? "bg-stone-900 text-gold-light border-gold-primary/50"
                : toast.type === "warning"
                ? "bg-red-900 text-white border-red-500/50"
                : "bg-espresso-900 text-gold-light border-gold-primary/30"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-gold-primary" />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-gold-primary" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header & Top Metrics */}
        <AdminHeader
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddService={() => {
            setEditingService(null);
            setIsServiceModalOpen(true);
          }}
          onOpenAddUser={() => setIsUserModalOpen(true)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          isLoadingAppointments={isLoadingAppointments}
          activeBookingsCount={activeBookingsCount}
          completedCount={completedCount}
          cancelledCount={cancelledCount}
          totalRevenue={totalRevenue}
          appointmentsCount={appointments.length}
          servicesCount={servicesList.length}
          staffCount={staffList.length}
          usersCount={dbUsers.length}
        />

        {/* Tab 1: Appointments */}
        {activeTab === "appointments" && (
          <AdminAppointmentsTab
            appointments={appointments}
            isLoading={isLoadingAppointments}
            onUpdateStatus={handleUpdateStatus}
            onOpenReschedule={(appt) => setRescheduleModalAppt(appt)}
            onOpenWhatsAppModal={(appt) => setWhatsAppModalAppt(appt)}
            onOpenDepositReview={(appt) => setDepositReviewAppt(appt)}
            onSweepExpiredDeposits={handleSweepExpiredDeposits}
            isSweepingExpired={isSweepingExpired}
            formatWhatsAppPhone={formatWhatsAppPhone}
            getPreWrittenWhatsAppMessage={getPreWrittenWhatsAppMessage}
          />
        )}

        {/* Tab 2: Services */}
        {activeTab === "services" && (
          <AdminServicesTab
            services={servicesList}
            onOpenAddService={() => {
              setEditingService(null);
              setIsServiceModalOpen(true);
            }}
            onOpenEditService={(service) => {
              setEditingService(service);
              setIsServiceModalOpen(true);
            }}
            onOpenDeleteService={(service) => {
              setServiceToDelete(service);
              setIsDeleteServiceModalOpen(true);
            }}
            onOpenResetDefaults={() => setIsResetServicesConfirmOpen(true)}
          />
        )}

        {/* Tab 3: Staff */}
        {activeTab === "staff" && (
          <AdminStaffTab
            staffList={staffList}
            onOpenAddSpecialist={() => {
              setEditingSpecialist(null);
              setIsSpecialistModalOpen(true);
            }}
            onOpenEditSpecialist={(specialist) => {
              setEditingSpecialist(specialist);
              setIsSpecialistModalOpen(true);
            }}
            onOpenDeleteSpecialist={(specialist) => {
              setSpecialistToDelete(specialist);
              setIsDeleteSpecialistModalOpen(true);
            }}
            onOpenResetSpecialists={() => setIsResetSpecialistsConfirmOpen(true)}
          />
        )}

        {/* Tab 4: Users */}
        {activeTab === "users" && (
          <AdminUsersTab
            dbUsers={dbUsers}
            currentUser={currentUser}
            onOpenCreateUser={() => setIsUserModalOpen(true)}
            onOpenDeleteUser={(user) => {
              setUserToDelete(user);
              setIsDeleteUserModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Service Add/Edit Modal */}
      <AdminServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        editingService={editingService}
        onSave={handleSaveService}
        showToast={showToast}
      />

      {/* Service Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteServiceModalOpen}
        onClose={() => {
          setIsDeleteServiceModalOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDeleteService}
        title="Delete Treatment?"
        description={
          serviceToDelete ? (
            <>
              Are you sure you want to delete <strong>{serviceToDelete.name}</strong> (LKR {serviceToDelete.priceLKR.toLocaleString()})?
            </>
          ) : null
        }
        warningText="This will immediately remove it from the client website and booking concierge."
        confirmText="Delete Now"
        cancelText="Keep Service"
        variant="danger"
        icon="trash"
      />

      {/* Service Restore Defaults Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isResetServicesConfirmOpen}
        onClose={() => setIsResetServicesConfirmOpen(false)}
        onConfirm={handleConfirmResetServices}
        title="Restore Default Catalog?"
        description="This will reset the catalog back to the original 12 salon offerings from Nayani Munasinghe. Any custom treatments added will be replaced with the default master menu."
        confirmText="Restore Defaults"
        cancelText="Cancel"
        variant="gold"
        icon="reset"
      />

      {/* Specialist Add/Edit Modal */}
      <AdminSpecialistModal
        isOpen={isSpecialistModalOpen}
        onClose={() => {
          setIsSpecialistModalOpen(false);
          setEditingSpecialist(null);
        }}
        editingSpecialist={editingSpecialist}
        onSave={handleSaveSpecialist}
      />

      {/* Specialist Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteSpecialistModalOpen}
        onClose={() => {
          setIsDeleteSpecialistModalOpen(false);
          setSpecialistToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSpecialist}
        title="Delete Specialist"
        description={
          specialistToDelete ? (
            <>
              Are you sure you want to remove <strong className="text-stone-900">{specialistToDelete.name}</strong> ({specialistToDelete.role}) from the Salon EyeLines roster? Clients will no longer be able to select this stylist when booking appointments.
            </>
          ) : null
        }
        confirmText="Confirm Delete"
        cancelText="Cancel"
        variant="danger"
        icon="warning"
      />

      {/* Specialist Restore Defaults Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isResetSpecialistsConfirmOpen}
        onClose={() => setIsResetSpecialistsConfirmOpen(false)}
        onConfirm={handleConfirmResetSpecialists}
        title="Restore Default Specialists"
        description="This will restore the specialists roster back to the original 4 founding artisans (Nayani Munasinghe with HD portrait, Dilini, Kasuni, and Sachini). Any custom added stylists will be removed."
        confirmText="Restore Defaults"
        cancelText="Cancel"
        variant="gold"
        icon="reset"
      />

      {/* User Create Modal */}
      <AdminUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onCreateUser={handleCreateUser}
      />

      {/* User Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => {
          if (!isDeletingUser) {
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteUser}
        title="Delete User Account?"
        description={
          userToDelete ? (
            <span>
              Are you sure you want to permanently delete the account for{" "}
              <strong className="text-stone-900 font-semibold">{userToDelete.name}</strong>{" "}
              (<span className="font-mono text-stone-700">{userToDelete.email}</span>)?
              This user will immediately lose access to the management portal.
            </span>
          ) : null
        }
        warningText="This action is permanent and cannot be undone."
        confirmText={isDeletingUser ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />

      {/* Reschedule Appointment Modal */}
      <AdminRescheduleModal
        isOpen={!!rescheduleModalAppt}
        appointment={rescheduleModalAppt}
        staffList={staffList}
        onClose={() => setRescheduleModalAppt(null)}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* WhatsApp Concierge Modal */}
      <AdminWhatsAppModal
        isOpen={!!whatsAppModalAppt}
        appointment={whatsAppModalAppt}
        onClose={() => setWhatsAppModalAppt(null)}
        formatWhatsAppPhone={formatWhatsAppPhone}
        getPreWrittenWhatsAppMessage={getPreWrittenWhatsAppMessage}
        showToast={showToast}
      />

      {/* Deposit Slip Review & Verification Modal */}
      <AdminDepositReviewModal
        isOpen={!!depositReviewAppt}
        onClose={() => setDepositReviewAppt(null)}
        appointment={depositReviewAppt}
        onConfirmVerify={handleVerifyDeposit}
        onExtendHold={handleExtendHold}
        onOpenWhatsAppModal={(appt) => setWhatsAppModalAppt(appt)}
      />
    </div>
  );
}
