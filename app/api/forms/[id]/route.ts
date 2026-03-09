import { NextRequest, NextResponse } from "next/server";
import { ownerFilter, requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel, FormSubmissionModel } from "@/lib/models";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "forms:read");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const form = await FormSchemaModel.findOne({ _id: params.id, ...ownerFilter(user) }).lean();
    if (!form) {
      return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error("GET /api/forms/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch form" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "forms:update");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();
    const form = await FormSchemaModel.findOneAndUpdate(
      { _id: params.id, ...ownerFilter(user) },
      body,
      {
        new: true,
        runValidators: true,
      }
    ).lean();
    if (!form) {
      return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error("PUT /api/forms/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "forms:delete");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const form = await FormSchemaModel.findOneAndDelete({ _id: params.id, ...ownerFilter(user) });
    if (!form) {
      return NextResponse.json({ success: false, error: "Form not found" }, { status: 404 });
    }
    await FormSubmissionModel.deleteMany({ formId: params.id, ...ownerFilter(user) });
    return NextResponse.json({ success: true, message: "Form deleted" });
  } catch (error) {
    console.error("DELETE /api/forms/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete form" }, { status: 500 });
  }
}
