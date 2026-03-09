import { NextRequest, NextResponse } from "next/server";
import { ownerFilter, requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel, FormSubmissionModel, NotificationModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "submissions:read");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");

    const query = {
      ...(formId ? { formId } : {}),
      ...ownerFilter(user),
    };
    const submissions = await FormSubmissionModel.find(query).sort({ submittedAt: -1 }).lean();
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "submissions:create");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();

    if (!body.formId || !body.data) {
      return NextResponse.json(
        { success: false, error: "formId and data are required" },
        { status: 400 }
      );
    }

    const form = await FormSchemaModel.findOne({ _id: body.formId, ...ownerFilter(user) }).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, error: "Form not found" },
        { status: 404 }
      );
    }

    const submission = await FormSubmissionModel.create({
      ...body,
      ownerId: form.ownerId,
      formId: String(form._id),
    });

    await NotificationModel.create({
      userId: form.ownerId,
      title: "New submission received",
      message: `A new response was submitted to ${form.name}`,
      link: `/dashboard/submissions?formId=${String(form._id)}`,
      isRead: false,
    });

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save submission" },
      { status: 500 }
    );
  }
}
