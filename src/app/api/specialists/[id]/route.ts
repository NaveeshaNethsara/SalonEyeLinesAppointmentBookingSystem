import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.staff.findUnique({
      where: { id }
    });

    if (!existing) {
      // If specialist only existed in default memory/local, create it in DB
      let salon = await prisma.salon.findFirst();
      if (!salon) {
        salon = await prisma.salon.create({
          data: { name: "Salon EyeLines", slug: "salon-eyelines" }
        });
      }
      const created = await prisma.staff.create({
        data: {
          id,
          salonId: salon.id,
          name: body.name.trim(),
          role: body.role.trim(),
          experience: body.experience?.trim() || "5+ Years Experience",
          bio: body.bio?.trim() || "",
          avatarUrl: body.avatar?.trim() || null,
          isActive: true
        }
      });
      return NextResponse.json({
        id: created.id,
        name: created.name,
        role: created.role,
        experience: created.experience,
        bio: created.bio,
        specialties: body.specialties || ["Bridal Artistry"],
        avatar: created.avatarUrl || undefined
      });
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        role: body.role !== undefined ? body.role.trim() : undefined,
        experience: body.experience !== undefined ? body.experience.trim() : undefined,
        bio: body.bio !== undefined ? body.bio.trim() : undefined,
        avatarUrl: body.avatar !== undefined ? body.avatar.trim() || null : undefined
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      role: updated.role,
      experience: updated.experience,
      bio: updated.bio,
      specialties: body.specialties || ["Bridal Artistry"],
      avatar: updated.avatarUrl || undefined
    });
  } catch (error) {
    console.error("PUT /api/specialists/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update specialist in database." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.staff.findUnique({
      where: { id }
    });

    if (existing) {
      await prisma.staff.update({
        where: { id },
        data: { isActive: false }
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/specialists/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete specialist in database." },
      { status: 500 }
    );
  }
}
