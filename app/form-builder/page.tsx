import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SidebarProvider } from "@/components/SidebarContext";
import FormBuilderClient from "./FormBuilderClient";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel } from "@/lib/models";
import { FormSchema, SessionUser } from "@/types";
import { requireServerAuth } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

async function getInitialForm(user: SessionUser, editId?: string): Promise<FormSchema | null> {
  if (!editId) return null;

  try {
    await connectDB();
    const form = await FormSchemaModel.findOne({
      _id: editId,
      ...(user.role === "super_admin" ? {} : { ownerId: user.userId }),
    }).lean();
    if (!form) return null;

    return {
      ...form,
      _id: String(form._id),
      createdAt: form.createdAt ? String(form.createdAt) : undefined,
      updatedAt: form.updatedAt ? String(form.updatedAt) : undefined,
    } as unknown as FormSchema;
  } catch {
    return null;
  }
}

export default async function FormBuilderPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const user = requireServerAuth();
  if (!hasPermission(user, "forms:create")) {
    redirect("/dashboard");
  }

  const initialForm = await getInitialForm(user, searchParams?.edit);
  const isEditMode = Boolean(searchParams?.edit && initialForm);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SidebarProvider>
        <Sidebar user={user} />
        <TopBar user={user} />
        <main className="min-h-screen pt-[65px] md:ml-[240px]">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6 animate-fade-up">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
              >
                {isEditMode ? "Edit Form" : "Form Builder"}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {isEditMode
                  ? "Update fields, then save to apply changes"
                  : "Drag, drop, and configure fields, then save to MongoDB"}
              </p>
            </div>
            <FormBuilderClient initialForm={initialForm} />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
