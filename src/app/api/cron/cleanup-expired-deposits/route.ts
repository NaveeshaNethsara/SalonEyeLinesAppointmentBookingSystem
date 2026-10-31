import { NextResponse } from "next/server";
import { bookingEngine } from "@/services/booking-engine.service";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function handleCleanup(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const authUser = await getAuthenticatedUser();

    // Authorization: valid CRON_SECRET, active staff session, or local development mode
    const isCronAuthorized = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);
    const isStaffAuthorized = !!authUser;
    const isDev = process.env.NODE_ENV !== "production";

    if (!isCronAuthorized && !isStaffAuthorized && !isDev) {
      return NextResponse.json(
        { error: "Unauthorized access. Valid CRON_SECRET or staff session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const expiryHoursParam = searchParams.get("hours");
    const expiryHours = expiryHoursParam ? parseInt(expiryHoursParam, 10) : 24;

    const result = await bookingEngine.reconcileExpiredDeposits({ expiryHours });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reconciledCount: result.reconciledCount,
      expiredBookings: result.expiredBookings
    });
  } catch (error: any) {
    console.error("Cron deposit cleanup error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reconcile expired deposit holds." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}
