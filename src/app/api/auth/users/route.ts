import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getAuthenticatedUser } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/auth/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users from database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser || (authUser.role !== "SALON_OWNER" && authUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Only salon owners or super admins can create user credentials." },
        { status: 403 }
      );
    }

    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists in PostgreSQL." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const created = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        role: (role as Role) || "STAFF",
        passwordHash
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/users error:", error);
    return NextResponse.json(
      { error: "Failed to create user in PostgreSQL." },
      { status: 500 }
    );
  }
}
