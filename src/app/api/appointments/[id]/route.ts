import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingEngine } from "@/services/booking-engine.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const isRefCode = id.startsWith("EL-");
    const authUser = await getAuthenticatedUser();

    // Security check: Unauthenticated visitors cannot update by internal UUID
    if (!authUser && !isRefCode) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Security check: Unauthenticated clients accessing via reference code can only cancel or reschedule
    if (!authUser && isRefCode) {
      if (body.status && body.status !== "CANCELLED" && !body.date) {
        return NextResponse.json({ error: "Unauthorized action" }, { status: 403 });
      }
    }

    let updated: any;

    // 0. Deposit Verification (Staff Only)
    if (body.action === "VERIFY_DEPOSIT") {
      if (!authUser) {
        return NextResponse.json({ error: "Staff authentication required to verify deposits." }, { status: 401 });
      }
      updated = await bookingEngine.verifyDeposit(id, {
        depositPaidLKR: body.depositPaidLKR ? Number(body.depositPaidLKR) : undefined,
        notes: body.notes
      });
    } else if (body.action === "EXTEND_HOLD") {
      if (!authUser) {
        return NextResponse.json({ error: "Staff authentication required to extend deposit holds." }, { status: 401 });
      }
      updated = await bookingEngine.extendDepositHold(id, body.additionalHours || 24);
    } else if (body.date && body.time) {
      // 1. Rescheduling Date & Time
      updated = await bookingEngine.rescheduleBooking({
        bookingIdOrRef: id,
        newDate: body.date,
        newStartTime: body.time,
        newStaffId: body.staffId,
        isStaffAction: !!authUser
      });
    } else if (body.status === "CANCELLED") {
      // 2. Cancellation
      updated = await bookingEngine.cancelBooking({
        bookingIdOrRef: id,
        isStaffAction: !!authUser,
        reason: body.reason
      });
    } else if (body.status) {
      // 3. Status updates (e.g. COMPLETED, NO_SHOW, IN_PROGRESS by staff)
      updated = await bookingEngine.updateBookingStatus(id, body.status, body.specialNotes);
    } else {
      return NextResponse.json({ error: "No update parameters provided." }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/appointments/[id] error:", error);
    const message = error?.message || "Failed to update appointment in PostgreSQL.";
    const status =
      message.includes("not found")
        ? 404
        : message.includes("already booked")
        ? 409
        : message.includes("24 hours") || message.includes("past")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
