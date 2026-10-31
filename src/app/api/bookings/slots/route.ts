import { NextResponse } from "next/server";
import { bookingEngine } from "@/services/booking-engine.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim();
    const serviceId = searchParams.get("serviceId")?.trim();
    const serviceIdsParam = searchParams.get("serviceIds")?.trim();
    const staffId = searchParams.get("staffId")?.trim() || undefined;

    if (!date) {
      return NextResponse.json({ error: "Missing required query parameter: date (YYYY-MM-DD)" }, { status: 400 });
    }

    let serviceIds: string[] = [];
    if (serviceIdsParam) {
      serviceIds = serviceIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (serviceId) {
      serviceIds = [serviceId];
    }

    if (serviceIds.length === 0) {
      return NextResponse.json({ error: "At least one serviceId must be specified" }, { status: 400 });
    }

    const slots = await bookingEngine.getAvailableSlots({
      date,
      serviceIds,
      staffId
    });

    return NextResponse.json({ date, slots });
  } catch (error: any) {
    console.error("GET /api/bookings/slots error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to calculate available slots." },
      { status: 500 }
    );
  }
}
