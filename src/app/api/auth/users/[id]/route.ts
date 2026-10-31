import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Only SALON_OWNER or SUPER_ADMIN can delete user accounts
    if (authUser.role !== "SALON_OWNER" && authUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Permission denied. Only salon owners or super admins can delete user accounts." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Safety check: Cannot delete own active account
    if (
      targetUser.id === authUser.id ||
      targetUser.email.toLowerCase() === authUser.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "You cannot delete your own active administrator account." },
        { status: 400 }
      );
    }

    // Safety check: If target is SALON_OWNER or SUPER_ADMIN, ensure other owners/admins remain
    if (targetUser.role === "SALON_OWNER" || targetUser.role === "SUPER_ADMIN") {
      const remainingAdmins = await prisma.user.count({
        where: {
          role: { in: ["SALON_OWNER", "SUPER_ADMIN"] },
          id: { not: id }
        }
      });
      if (remainingAdmins === 0) {
        return NextResponse.json(
          { error: "Cannot delete the sole remaining administrator account." },
          { status: 400 }
        );
      }
    }

    // Detach relations before deletion to prevent foreign key errors
    await prisma.staff.updateMany({
      where: { userId: id },
      data: { userId: null }
    });

    await prisma.auditLog.updateMany({
      where: { userId: id },
      data: { userId: null }
    });

    // Delete user from database
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `User account "${targetUser.name}" (${targetUser.email}) has been permanently deleted.`
    });
  } catch (error) {
    console.error("DELETE /api/auth/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user account from database." },
      { status: 500 }
    );
  }
}
