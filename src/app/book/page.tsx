"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TIME_SLOTS, SPECIALISTS } from "@/lib/data";
import { ServiceItem, SpecialistItem, AppointmentRecord } from "@/types";
import { getStoredServices, saveServicesToStorage } from "@/lib/services";
import { getStoredSpecialists, saveSpecialistsToStorage } from "@/lib/specialists";
import {
  getTodayColomboDate,
  getTomorrowColomboDate,
  isSlotInPast,
} from "@/lib/appointments";

import BookingProgressBar from "@/components/booking/BookingProgressBar";
import ServiceSelectionStep from "@/components/booking/ServiceSelectionStep";
import SpecialistSelectionStep from "@/components/booking/SpecialistSelectionStep";
import DateTimeSelectionStep from "@/components/booking/DateTimeSelectionStep";
import CustomerDetailsStep from "@/components/booking/CustomerDetailsStep";
import BookingConfirmationStep from "@/components/booking/BookingConfirmationStep";

function BookingContent() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("service") || "";
  const initialStaffId = searchParams.get("specialist") || "";

  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<SpecialistItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [specialistsList, setSpecialistsList] = useState<SpecialistItem[]>(SPECIALISTS);

  // Form details
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("Regular Care & Grooming");
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [depositSlipUrl, setDepositSlipUrl] = useState<string>("");

  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [serverSlots, setServerSlots] = useState<
    Array<{ time: string; available: boolean; reason?: string; staffId?: string; staffName?: string }>
  >([]);

  // Initial setup: Date, services, specialists, and URL preselection
  useEffect(() => {
    const today = getTodayColomboDate();
    const hasRemainingToday = TIME_SLOTS.some((t) => !isSlotInPast(today, t, 0));
    setSelectedDate(hasRemainingToday ? today : getTomorrowColomboDate());

    const currentServices = getStoredServices();
    setServicesList(currentServices);

    const currentSpecialists = getStoredSpecialists();
    setSpecialistsList(currentSpecialists);

    if (initialServiceId) {
      const found = currentServices.find((s) => s.id === initialServiceId || s.slug === initialServiceId);
      if (found) setSelectedServices([found]);
    }

    if (initialStaffId) {
      const foundStaff = currentSpecialists.find((s) => s.id === initialStaffId);
      if (foundStaff) setSelectedStaff(foundStaff);
    }

    // Live fetch services from PostgreSQL
    fetch("/api/services", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ServiceItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          saveServicesToStorage(data);
          setServicesList(data);
          if (initialServiceId) {
            const found = data.find((s) => s.id === initialServiceId || s.slug === initialServiceId);
            if (found) setSelectedServices([found]);
          }
        }
      })
      .catch((err) => console.warn("Live services fetch error in book:", err));

    // Live fetch specialists from PostgreSQL
    fetch("/api/specialists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SpecialistItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          saveSpecialistsToStorage(data);
          setSpecialistsList(data);
          if (initialStaffId) {
            const foundStaff = data.find((s) => s.id === initialStaffId);
            if (foundStaff) setSelectedStaff(foundStaff);
          }
        }
      })
      .catch((err) => console.warn("Live specialists fetch error in book:", err));
  }, [initialServiceId, initialStaffId]);

  // Live fetch available slots directly from server for all selected services
  useEffect(() => {
    if (!selectedDate || selectedServices.length === 0) return;
    const staffQuery =
      selectedStaff?.id && selectedStaff.id !== "any"
        ? `&staffId=${encodeURIComponent(selectedStaff.id)}`
        : "";
    const serviceIdsQuery = selectedServices.map((s) => s.id).join(",");

    fetch(
      `/api/bookings/slots?date=${encodeURIComponent(selectedDate)}&serviceIds=${encodeURIComponent(
        serviceIdsQuery
      )}${staffQuery}`,
      { cache: "no-store" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.slots)) {
          setServerSlots(data.slots);
        }
      })
      .catch((err) => console.warn("Failed to fetch slots from server:", err));
  }, [selectedDate, selectedServices, selectedStaff?.id]);

  // If slot becomes unavailable on date/service change, clear selection (only while user is actively on date/time step)
  useEffect(() => {
    if (step === 3 && selectedTime && serverSlots.length > 0) {
      const slot = serverSlots.find((s) => s.time === selectedTime);
      if (slot && !slot.available) {
        setSelectedTime("");
      }
    }
  }, [serverSlots, selectedTime, step]);

  const handleToggleService = (service: ServiceItem) => {
    setErrorMsg("");
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleClearServices = () => {
    setSelectedServices([]);
    setErrorMsg("");
  };

  const handleTabStepClick = (targetStep: number) => {
    setErrorMsg("");
    if (targetStep === step) return;

    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    if (targetStep === 2) {
      if (selectedServices.length === 0) {
        setErrorMsg("Please select at least one treatment service first to continue.");
        return;
      }
      setStep(2);
    } else if (targetStep === 3) {
      if (selectedServices.length === 0) {
        setErrorMsg("Please select at least one treatment service first.");
        return;
      }
      if (!selectedStaff) {
        setSelectedStaff(specialistsList[0] || SPECIALISTS[0]);
      }
      setStep(3);
    } else if (targetStep === 4) {
      if (selectedServices.length === 0) {
        setErrorMsg("Please select at least one treatment service first.");
        return;
      }
      if (!selectedDate || !selectedTime) {
        setErrorMsg("Please choose both a date and an available time slot.");
        return;
      }
      setStep(4);
    }
  };

  const handleNextStep = async () => {
    setErrorMsg("");

    if (step === 1) {
      if (selectedServices.length === 0) {
        setErrorMsg("Please select at least one treatment service to continue.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedStaff) {
        setSelectedStaff(specialistsList[0] || SPECIALISTS[0]);
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate) {
        setErrorMsg("Please select an appointment date.");
        return;
      }
      if (!selectedTime) {
        setErrorMsg("Please choose an available time slot.");
        return;
      }

      const slot = serverSlots.find((s) => s.time === selectedTime);
      const isPast = isSlotInPast(selectedDate, selectedTime);
      if (isPast || (slot && !slot.available)) {
        setErrorMsg(
          slot?.reason || "The selected time slot is no longer available. Please choose another slot."
        );
        setSelectedTime("");
        return;
      }

      setStep(4);
    } else if (step === 4) {
      if (!selectedDate || !selectedTime) {
        setErrorMsg("Please choose an appointment date and available time slot before continuing.");
        setStep(3);
        return;
      }
      if (!clientName.trim() || clientName.length < 3) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!clientPhone.trim() || clientPhone.length < 9) {
        setErrorMsg("Please enter a valid phone number (WhatsApp preferred).");
        return;
      }

      const slot = serverSlots.find((s) => s.time === selectedTime);
      const isPast = isSlotInPast(selectedDate, selectedTime);
      if (isPast || (slot && !slot.available)) {
        setErrorMsg(
          slot?.reason || "The selected time slot has expired or is no longer available. Please choose another slot."
        );
        setStep(3);
        setSelectedTime("");
        return;
      }

      let finalStaff = selectedStaff;
      if (!finalStaff || finalStaff.id === "any") {
        finalStaff = specialistsList[0] || SPECIALISTS[0];
      }

      setIsSubmittingBooking(true);
      setErrorMsg("");

      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceIds: selectedServices.map((s) => s.id),
            staffId: finalStaff.id,
            date: selectedDate,
            time: selectedTime,
            clientName: clientName.trim(),
            clientPhone: clientPhone.trim(),
            clientEmail: clientEmail.trim() || undefined,
            occasion,
            specialNotes: specialNotes.trim() || undefined,
            depositSlipUrl: depositSlipUrl || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "Failed to confirm reservation in database. Please choose another slot.");
          setIsSubmittingBooking(false);
          return;
        }

        const primaryService = selectedServices[0];
        const authoritativeRecord: AppointmentRecord = {
          id: data.id,
          referenceCode: data.referenceCode,
          serviceId: primaryService ? primaryService.id : "",
          serviceName: data.serviceName || selectedServices.map((s) => s.name).join(" + "),
          staffId: finalStaff.id,
          staffName: data.staffName || finalStaff.name,
          date: data.date || selectedDate,
          time: data.time || selectedTime,
          clientName: data.clientName || clientName.trim(),
          clientPhone: data.clientPhone || clientPhone.trim(),
          clientEmail: clientEmail.trim() || undefined,
          occasion,
          specialNotes: specialNotes.trim() || undefined,
          totalPriceLKR: Number(
            data.totalPriceLKR || selectedServices.reduce((sum, s) => sum + s.priceLKR, 0)
          ),
          status: data.status || "CONFIRMED",
          createdAt: data.createdAt || new Date().toISOString(),
          depositRequiredLKR: data.depositRequiredLKR,
          depositPaidLKR: data.depositPaidLKR,
          depositSlipUrl: data.depositSlipUrl || depositSlipUrl || undefined,
          depositVerifiedAt: data.depositVerifiedAt,
        };

        try {
          const storedRefs: string[] = JSON.parse(
            localStorage.getItem("salon_recent_booking_refs") || "[]"
          );
          if (!storedRefs.includes(data.referenceCode)) {
            storedRefs.unshift(data.referenceCode);
            localStorage.setItem(
              "salon_recent_booking_refs",
              JSON.stringify(storedRefs.slice(0, 10))
            );
          }
        } catch {}

        setConfirmedBooking(authoritativeRecord);
        setIsSubmittingBooking(false);
        setStep(5);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to connect to reservation service. Please check network.");
        setIsSubmittingBooking(false);
      }
    }
  };

  return (
    <div className="py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-8 sm:mb-10 space-y-2 sm:space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
          Concierge Appointment Service
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-900 leading-tight">
          Reserve Your Signature Experience
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md mx-auto">
          Tailored aesthetic excellence in Aluthgama. Select one or more treatments for your bespoke ritual.
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <BookingProgressBar
        step={step}
        selectedServices={selectedServices}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onStepClick={handleTabStepClick}
      />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in-50">
          {errorMsg}
        </div>
      )}

      {/* Wizard Step Panes */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 lg:p-10 border border-gold-primary/30 shadow-card">
        {step === 1 && (
          <ServiceSelectionStep
            servicesList={servicesList}
            selectedServices={selectedServices}
            onToggleService={handleToggleService}
            onClearServices={handleClearServices}
            onProceed={() => {
              if (selectedServices.length === 0) {
                setErrorMsg("Please select at least one treatment service to continue.");
                return;
              }
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <SpecialistSelectionStep
            specialistsList={specialistsList}
            selectedStaff={selectedStaff}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
          />
        )}

        {step === 3 && (
          <DateTimeSelectionStep
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedStaff={selectedStaff}
            selectedServices={selectedServices}
            serverSlots={serverSlots}
            onSelectDate={(date) => setSelectedDate(date)}
            onSelectTime={(time) => setSelectedTime(time)}
            onClearError={() => setErrorMsg("")}
          />
        )}

        {step === 4 && (
          <CustomerDetailsStep
            clientName={clientName}
            clientPhone={clientPhone}
            clientEmail={clientEmail}
            occasion={occasion}
            specialNotes={specialNotes}
            selectedServices={selectedServices}
            selectedStaff={selectedStaff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            depositSlipUrl={depositSlipUrl}
            onClientNameChange={setClientName}
            onClientPhoneChange={setClientPhone}
            onClientEmailChange={setClientEmail}
            onOccasionChange={setOccasion}
            onSpecialNotesChange={setSpecialNotes}
            onDepositSlipUrlChange={setDepositSlipUrl}
          />
        )}

        {step === 5 && confirmedBooking && (
          <BookingConfirmationStep
            confirmedBooking={confirmedBooking}
            selectedStaff={selectedStaff}
            selectedServices={selectedServices}
          />
        )}

        {/* Wizard Footer Navigation */}
        {step < 5 && (
          <div className="mt-10 pt-6 border-t border-gold-primary/20 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-luxury inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-stone-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              disabled={isSubmittingBooking}
              onClick={handleNextStep}
              className={`btn-luxury shimmer-gold inline-flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded shadow-gold transition group cursor-pointer ${
                isSubmittingBooking ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <span>
                {isSubmittingBooking
                  ? "Securing with Database..."
                  : step === 4
                  ? "Confirm & Reserve Slot"
                  : "Continue"}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone-500">Loading appointment concierge...</div>}>
      <BookingContent />
    </Suspense>
  );
}
