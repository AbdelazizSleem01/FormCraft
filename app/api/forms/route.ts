import { NextRequest, NextResponse } from "next/server";
import { ownerFilter, requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "forms:read");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const forms = await FormSchemaModel.find(ownerFilter(user)).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error("GET /api/forms error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch forms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "forms:create");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Form name is required" }, { status: 400 });
    }

    const form = await FormSchemaModel.create({
      ...body,
      ownerId: user.userId,
    });
    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error("POST /api/forms error:", error);
    return NextResponse.json({ success: false, error: "Failed to create form" }, { status: 500 });
  }
}
