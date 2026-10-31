import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/services";
import { getAuthenticatedUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found in database" }, { status: 404 });
    }

    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.category && { category: body.category }),
        ...(body.categoryName && { categoryName: body.categoryName }),
        ...(body.tagline !== undefined && { tagline: body.tagline?.trim() }),
        ...(body.description && { description: body.description?.trim() }),
        ...(body.priceLKR !== undefined && { priceLKR: Number(body.priceLKR) }),
        ...(body.durationMinutes !== undefined && { durationMinutes: Number(body.durationMinutes) }),
        ...(body.image && { imageUrl: body.image }),
        ...(body.isPopular !== undefined && { isPopular: !!body.isPopular }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive })
      }
    });

    const formatted = {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      category: updated.category,
      categoryName: updated.categoryName,
      tagline: updated.tagline,
      description: updated.description,
      priceLKR: Number(updated.priceLKR),
      durationMinutes: updated.durationMinutes,
      durationFormatted: formatDuration(updated.durationMinutes),
      image: updated.imageUrl || "/images/service_eyelines.jpg",
      isPopular: updated.isPopular
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("PUT /api/services/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update service in PostgreSQL." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      }
    });

    if (existing) {
      await prisma.service.delete({
        where: { id: existing.id }
      });
    }

    return NextResponse.json({ success: true, message: "Service deleted from PostgreSQL." });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete service from PostgreSQL." },
      { status: 500 }
    );
  }
}
