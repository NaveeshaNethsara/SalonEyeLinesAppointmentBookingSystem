import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, formatDuration } from "@/lib/services";
import { SERVICES } from "@/lib/data";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    if (!services || services.length === 0) {
      return NextResponse.json(SERVICES);
    }

    const formatted = services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      categoryName: s.categoryName,
      tagline: s.tagline || s.categoryName,
      description: s.description,
      priceLKR: Number(s.priceLKR),
      durationMinutes: s.durationMinutes,
      durationFormatted: formatDuration(s.durationMinutes),
      image: s.imageUrl || "/images/service_eyelines.jpg",
      isPopular: s.isPopular
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.warn("GET /api/services fallback to static data:", error);
    return NextResponse.json(SERVICES);
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized access. Staff authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get default salon
    let salon = await prisma.salon.findFirst();
    if (!salon) {
      salon = await prisma.salon.create({
        data: {
          name: "Salon EyeLines",
          slug: "salon-eyelines"
        }
      });
    }

    const baseSlug = body.slug || slugify(body.name);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.service.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const created = await prisma.service.create({
      data: {
        ...(body.id ? { id: body.id } : {}),
        salonId: salon.id,
        name: body.name.trim(),
        slug: uniqueSlug,
        category: body.category,
        categoryName: body.categoryName || body.category,
        tagline: body.tagline?.trim(),
        description: body.description?.trim(),
        priceLKR: Number(body.priceLKR) || 0,
        durationMinutes: Number(body.durationMinutes) || 60,
        imageUrl: body.image || "/images/service_eyelines.jpg",
        isPopular: !!body.isPopular,
        isActive: true
      }
    });

    const formatted = {
      id: created.id,
      name: created.name,
      slug: created.slug,
      category: created.category,
      categoryName: created.categoryName,
      tagline: created.tagline,
      description: created.description,
      priceLKR: Number(created.priceLKR),
      durationMinutes: created.durationMinutes,
      durationFormatted: formatDuration(created.durationMinutes),
      image: created.imageUrl || "/images/service_eyelines.jpg",
      isPopular: created.isPopular
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { error: "Failed to create service in PostgreSQL database." },
      { status: 500 }
    );
  }
}
