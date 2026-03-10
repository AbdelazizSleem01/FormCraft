import SubmissionsClient from "./SubmissionsClient";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel } from "@/lib/models";
import { FormSchema, SessionUser } from "@/types";
import { requireServerAuth } from "@/lib/server-auth";

async function getForms(user: SessionUser): Promise<FormSchema[]> {
  try {
    await connectDB();
    const forms = await FormSchemaModel.find(
      user.role === "super_admin" ? {} : { ownerId: user.userId }
    )
      .sort({ createdAt: -1 })
      .lean();
    return forms.map((f) => ({
      ...f,
      _id: String(f._id),
      createdAt: f.createdAt ? String(f.createdAt) : undefined,
      updatedAt: f.updatedAt ? String(f.updatedAt) : undefined,
    })) as unknown as FormSchema[];
  } catch {
    return [];
  }
}

export default async function SubmissionsPage() {
  const user = requireServerAuth();
  const forms = await getForms(user);

  return (
    <div className="space-y-6 animate-fade-up ">
      <div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          Submissions
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          All form responses stored in MongoDB — columns auto-expand with new fields
        </p>
      </div>
      <SubmissionsClient forms={forms} />
    </div>
  );
}
