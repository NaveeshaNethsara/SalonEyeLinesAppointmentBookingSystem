import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Allowed MIME types for salon catalog images
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const isSlip = formData.get("isSlip") === "true";
    const authUser = await getAuthenticatedUser();

    // If it is not a client deposit slip upload, require staff authentication
    if (!isSlip && !authUser) {
      return NextResponse.json(
        { error: "Unauthorized access. Staff authentication required to upload assets." },
        { status: 401 }
      );
    }

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided in upload request." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${file.type}). Please upload a JPG, PNG, WEBP, or AVIF photo.`
        },
        { status: 400 }
      );
    }

    const maxAllowedSize = isSlip ? 5 * 1024 * 1024 : MAX_FILE_SIZE;
    if (file.size > maxAllowedSize) {
      return NextResponse.json(
        { error: `File exceeds the ${isSlip ? "5MB" : "10MB"} limit. Please upload a smaller image.` },
        { status: 400 }
      );
    }

    // Determine extension safely
    const originalExt = path.extname(file.name).toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"].includes(originalExt)
      ? originalExt
      : ".jpg";

    // Create unique sanitized filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);

    const prefix = isSlip ? "slip" : "service";
    const filename = `${prefix}_${sanitizedBase}_${timestamp}_${randomSuffix}${safeExt}`;

    // Target upload folder in public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Convert file to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const destinationPath = path.join(uploadsDir, filename);
    await fs.writeFile(destinationPath, buffer);

    // Return the serving URL
    const url = `/api/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      mimeType: file.type
    });
  } catch (error) {
    console.error("Image upload API error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload. Please try again." },
      { status: 500 }
    );
  }
}
