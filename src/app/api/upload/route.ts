import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 5MB" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uuid = crypto.randomUUID();
  const isCover = request.nextUrl.searchParams.get("type") === "cover";

  await mkdir(UPLOAD_DIR, { recursive: true });

  if (isCover) {
    // Generate 4 variants for cover images
    const heroBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .avif({ quality: 80 })
      .toBuffer();

    const cardBuffer = await sharp(buffer)
      .resize({ width: 640, withoutEnlargement: true })
      .avif({ quality: 80 })
      .toBuffer();

    const ogBuffer = await sharp(buffer)
      .resize({ width: 1200, height: 630, fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const blurBuffer = await sharp(buffer)
      .resize({ width: 32 })
      .png()
      .toBuffer();

    const blurDataUrl = `data:image/png;base64,${blurBuffer.toString("base64")}`;

    await Promise.all([
      writeFile(path.join(UPLOAD_DIR, `${uuid}-hero.avif`), heroBuffer),
      writeFile(path.join(UPLOAD_DIR, `${uuid}-card.avif`), cardBuffer),
      writeFile(path.join(UPLOAD_DIR, `${uuid}-og.jpg`), ogBuffer),
    ]);

    const basePath = `/uploads/${uuid}`;

    return NextResponse.json({ basePath, blurDataUrl });
  }

  // Default: single optimized image (for TipTap inline images)
  const filename = `${uuid}.avif`;
  const optimized = await sharp(buffer)
    .avif({ quality: 80 })
    .resize({ width: 1920, withoutEnlargement: true })
    .toBuffer();

  await writeFile(path.join(UPLOAD_DIR, filename), optimized);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
