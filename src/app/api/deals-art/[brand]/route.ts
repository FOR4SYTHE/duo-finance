import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  try {
    const { brand } = await params;
    const brandLower = brand.toLowerCase();
    
    // Map brand to the generated art artifact prefix
    const artPrefixMap: Record<string, string> = {
      foodpanda: "foodpanda_art",
      grab: "grab_art",
      shopee: "shopee_art",
      lazada: "shopee_art", // share shopping bag
      klook: "travel_art",
      agoda: "travel_art",
      cheapflights: "travel_art",
    };

    const prefix = artPrefixMap[brandLower];
    if (!prefix) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const artifactDir = "/home/bnkxx/.gemini/antigravity-ide/brain/82985ced-c19e-4af5-a884-b4579aafbf95";
    
    // Find the actual file matching the prefix (since timestamps are appended)
    const files = fs.readdirSync(artifactDir);
    const targetFile = files.find(f => f.startsWith(prefix) && f.endsWith(".png"));

    if (!targetFile) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imagePath = path.join(artifactDir, targetFile);
    const imageBuffer = fs.readFileSync(imagePath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving deals art:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
