import { NextRequest, NextResponse } from "next/server";
import { ownerFilter, requireAuth } from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel, FormSubmissionModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "").trim();

    if (!q) return NextResponse.json({ success: true, data: [] });

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const filter = ownerFilter(user);

    const [forms, submissions] = await Promise.all([
      FormSchemaModel.find({
        ...filter,
        $or: [{ name: regex }, { description: regex }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      FormSubmissionModel.find({
        ...filter,
        formName: regex,
      })
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const formResults = forms.map((item) => ({
      id: String(item._id),
      type: "form",
      title: item.name,
      subtitle: item.description || "Form schema",
      href: `/dashboard/forms`,
    }));

    const submissionResults = submissions.map((item) => ({
      id: String(item._id),
      type: "submission",
      title: item.formName,
      subtitle: "Open submissions table",
      href: `/dashboard/submissions?formId=${item.formId}`,
    }));

    return NextResponse.json({ success: true, data: [...formResults, ...submissionResults] });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
