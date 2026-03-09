import { NextRequest, NextResponse } from "next/server";
import { ownerFilter, requireAuth, requirePermission } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { FormSubmissionModel } from "@/lib/models";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "submissions:update");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const body = await req.json();

    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json(
        { success: false, error: "data is required" },
        { status: 400 }
      );
    }

    const submission = await FormSubmissionModel.findOneAndUpdate(
      { _id: params.id, ...ownerFilter(user) },
      { data: body.data },
      { new: true, runValidators: true }
    ).lean();

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error("PUT /api/submissions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  const forbidden = requirePermission(user, "submissions:delete");
  if (forbidden) return forbidden;

  try {
    await connectDB();
    const submission = await FormSubmissionModel.findOneAndDelete({ _id: params.id, ...ownerFilter(user) });
    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    console.error("DELETE /api/submissions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
