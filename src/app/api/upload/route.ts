import { NextRequest, NextResponse } from "next/server";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const extraFiles = formData.getAll("files") as File[];
    const allFiles = [...files, ...extraFiles].filter((f) => f && typeof f.arrayBuffer === "function");

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploaded = await Promise.all(
      allFiles.map(async (file) => {
        // Validate MIME type
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image`);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToR2(buffer, file.name, file.type);
        return {
          url: result.url,
          key: result.key,
          name: file.name,
          size: file.size,
        };
      })
    );

    return NextResponse.json({
      success: true,
      url: uploaded[0]?.url,
      urls: uploaded.map((u) => u.url),
      files: uploaded,
    });
  } catch (error: any) {
    console.error("Cloudflare R2 Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudflare R2" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, url, keys, urls } = body;

    const targets: string[] = [];
    if (key) targets.push(key);
    if (url) targets.push(url);
    if (Array.isArray(keys)) targets.push(...keys);
    if (Array.isArray(urls)) targets.push(...urls);

    const validTargets = targets.filter(
      (t) => typeof t === "string" && t.trim().length > 0
    );

    if (validTargets.length === 0) {
      return NextResponse.json(
        { error: "Key, url, keys, or urls are required" },
        { status: 400 }
      );
    }

    const deletedCount = await deleteFromR2(validTargets);
    return NextResponse.json({ success: true, deletedCount });
  } catch (error: any) {
    console.error("Cloudflare R2 Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image from Cloudflare R2" },
      { status: 500 }
    );
  }
}
