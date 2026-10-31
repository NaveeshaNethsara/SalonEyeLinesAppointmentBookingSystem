import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingEngine } from "@/services/booking-engine.service";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const refsParam = searchParams.get("refs")?.trim();
    const refList = refsParam
      ? refsParam.split(",").map((r) => r.trim()).filter((r) => r.length >= 3)
      : [];

    const query =
      searchParams.get("query")?.trim() ||
      searchParams.get("ref")?.trim() ||
      searchParams.get("phone")?.trim();

    // Guard customer privacy: Only authenticated staff can view the full appointment ledger.
    // Unauthenticated clients can only look up specific records by Reference Code, multi-refs, or Phone number.
    if (!authUser && !query && refList.length === 0) {
      return NextResponse.json(
        { error: "Unauthorized access. Staff authentication required to view all appointments." },
        { status: 401 }
      );
    }

    if (!authUser && query && query.length < 3 && refList.length === 0) {
      return NextResponse.json([]);
    }

    const formatted = await bookingEngine.listBookings({
      query: query || undefined,
      referenceCodes: refList.length > 0 ? refList : undefined,
      autoReconcile: true
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments from PostgreSQL database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.serviceId && (!body.serviceIds || body.serviceIds.length === 0)) {
      return NextResponse.json({ error: "No treatment selected." }, { status: 400 });
    }

    if (!body.clientPhone || !body.clientName) {
      return NextResponse.json({ error: "Customer name and phone number are required." }, { status: 400 });
    }

    const serviceIds =
      body.serviceIds && Array.isArray(body.serviceIds) && body.serviceIds.length > 0
        ? body.serviceIds
        : [body.serviceId];

    // Delegate creation to authoritative transaction-safe BookingEngine
    const booking = await bookingEngine.createBooking({
      serviceIds,
      staffId: body.staffId,
      date: body.date,
      startTime: body.time,
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      occasion: body.occasion,
      specialNotes: body.specialNotes,
      origin: body.origin || "ONLINE",
      isAnonymousWalkin: body.isAnonymousWalkin,
      adminOverrideConflict: body.adminOverrideConflict,
      depositSlipUrl: body.depositSlipUrl
    });

    const serviceNames = booking.items.map((i: any) => i.service.name).join(" + ");
    const staffNames = Array.from(new Set(booking.items.map((i: any) => i.staff.name))).join(", ");

    return NextResponse.json(
      {
        id: booking.id,
        referenceCode: booking.referenceCode,
        serviceName: serviceNames,
        staffName: staffNames,
        date: body.date,
        time: body.time,
        clientName: booking.customer.name,
        clientPhone: booking.customer.phone,
        totalPriceLKR: Number(booking.totalPriceLKR),
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        depositRequiredLKR: booking.depositRequiredLKR ? Number(booking.depositRequiredLKR) : undefined,
        depositPaidLKR: booking.depositPaidLKR ? Number(booking.depositPaidLKR) : undefined,
        depositSlipUrl: booking.depositSlipUrl || undefined,
        depositVerifiedAt: booking.depositVerifiedAt ? booking.depositVerifiedAt.toISOString() : undefined
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/appointments error:", error);
    const message = error?.message || "Failed to book appointment in PostgreSQL.";
    const status =
      message.includes("already booked") || message.includes("hold")
        ? 409
        : message.includes("past") || message.includes("closed")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
