import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SPECIALISTS } from "@/lib/data";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });

    if (staff && staff.length > 0) {
      const formatted = staff.map((st) => ({
        id: st.id,
        name: st.name,
        role: st.role,
        experience: st.experience || "5+ Years Experience",
        bio: st.bio || "",
        specialties: ["Bridal Artistry", "Aesthetic Care"],
        avatar: st.avatarUrl || undefined
      }));
      return NextResponse.json(formatted);
    }

    return NextResponse.json(SPECIALISTS);
  } catch (error) {
    console.warn("GET /api/specialists fallback to default:", error);
    return NextResponse.json(SPECIALISTS);
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

    // Ensure salon exists
    let salon = await prisma.salon.findFirst();
    if (!salon) {
      salon = await prisma.salon.create({
        data: {
          name: "Salon EyeLines",
          slug: "salon-eyelines"
        }
      });
    }

    const created = await prisma.staff.create({
      data: {
        salonId: salon.id,
        name: body.name.trim(),
        role: body.role.trim(),
        experience: body.experience?.trim() || "5+ Years Experience",
        bio: body.bio?.trim() || "",
        avatarUrl: body.avatar?.trim() || null,
        isActive: true
      }
    });

    const formatted = {
      id: created.id,
      name: created.name,
      role: created.role,
      experience: created.experience,
      bio: created.bio,
      specialties: body.specialties || ["Bridal Artistry", "Aesthetic Care"],
      avatar: created.avatarUrl || undefined
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/specialists error:", error);
    return NextResponse.json(
      { error: "Failed to persist specialist to database." },
      { status: 500 }
    );
  }
}
