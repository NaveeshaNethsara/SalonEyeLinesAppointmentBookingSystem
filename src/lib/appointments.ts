import { AppointmentRecord } from "@/types";

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Colombo time (UTC+5:30)
 */
export function getTodayColomboDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD in Asia/Colombo time (UTC+5:30)
 */
export function getTomorrowColomboDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

/**
 * Parses date string (YYYY-MM-DD) and time string ("09:30 AM" or "14:30")
 * into a UTC Date object accounting for Asia/Colombo timezone (UTC+5:30)
 */
export function parseSriLankaDateTime(dateStr: string, timeStr: string): Date {
  const cleanTime = (timeStr || "10:00 AM").trim().toUpperCase();
  const [timePart, modifier] = cleanTime.split(" ");
  let [hoursStr, minutesStr] = timePart.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split("-").map(Number);
  // Sri Lanka is UTC+5:30
  return new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));
}

/**
 * Checks whether a given date and time slot has already passed
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "09:30 AM"
 * @param bufferMinutes grace window in minutes (default 10 mins)
 */
export function isSlotInPast(
  dateStr: string,
  timeStr: string,
  bufferMinutes: number = 10
): boolean {
  if (!dateStr || !timeStr) return false;
  try {
    const slotUtc = parseSriLankaDateTime(dateStr, timeStr);
    const nowUtc = Date.now();
    return slotUtc.getTime() <= nowUtc + bufferMinutes * 60 * 1000;
  } catch (e) {
    console.warn("isSlotInPast parsing error:", e);
    return false;
  }
}

/**
 * Reconciles a single appointment's status based on scheduled date and elapsed time.
 * - CANCELLED stays CANCELLED
 * - If appointment end time has elapsed (assuming 60m duration default), auto-marks COMPLETED
 * - If appointment is currently in progress, marks IN_PROGRESS
 * - If in the future and was CONFIRMED, stays CONFIRMED
 */
export function reconcileAppointmentRecord(
  appt: AppointmentRecord,
  durationMinutes: number = 60
): AppointmentRecord {
  if (appt.status === "CANCELLED") return appt;

  try {
    const startUtc = parseSriLankaDateTime(appt.date, appt.time);
    const endUtc = new Date(startUtc.getTime() + durationMinutes * 60 * 1000);
    const nowTime = Date.now();

    if (endUtc.getTime() <= nowTime) {
      if (appt.status !== "COMPLETED") {
        return { ...appt, status: "COMPLETED" };
      }
    } else if (startUtc.getTime() <= nowTime && endUtc.getTime() > nowTime) {
      if (appt.status !== "IN_PROGRESS") {
        return { ...appt, status: "IN_PROGRESS" };
      }
    } else if (appt.status === "COMPLETED" && startUtc.getTime() > nowTime) {
      // Future appointment was marked completed prematurely; revert to CONFIRMED
      return { ...appt, status: "CONFIRMED" };
    }
  } catch (e) {
    console.warn("reconcileAppointmentRecord error:", e);
  }

  return appt;
}

/**
 * Reconciles an array of appointments, returning updated array and change flag.
 */
export function reconcileAppointmentList(
  appointments: AppointmentRecord[]
): { updatedList: AppointmentRecord[]; hasChanges: boolean } {
  let hasChanges = false;
  const updatedList = appointments.map((a) => {
    const reconciled = reconcileAppointmentRecord(a);
    if (reconciled.status !== a.status) {
      hasChanges = true;
    }
    return reconciled;
  });

  return { updatedList, hasChanges };
}
