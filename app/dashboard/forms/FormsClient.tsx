"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Eye, Calendar, Hash, X, Send, Pencil } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { FormSchema } from "@/types";
import DynamicForm from "@/components/DynamicForm";
import { formatDate } from "@/lib/utils";

export default function FormsClient({ initialForms }: { initialForms: FormSchema[] }) {
  const [forms, setForms] = useState<FormSchema[]>(initialForms);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form and all its submissions?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/forms/${id}`, { method: "DELETE" });
      setForms((prev) => prev.filter((f) => f._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  if (forms.length === 0) {
    return (
      <div
        className="rounded-xl p-16 text-center"
        style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}
        >
          <Layers size={24} style={{ color: "var(--accent)" }} />
        </div>
        <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
          No forms yet
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Create your first dynamic form to start collecting data
        </p>
        <Link
          href="/form-builder"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
            color: "white",
            fontFamily: "'Syne', sans-serif",
            boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
          }}
        >
          <Plus size={15} /> Create Form
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {forms.map((form) => (
          <div
            key={form._id}
            className="rounded-xl p-5 flex flex-col gap-4 group transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}
              >
                <Layers size={17} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
                  {form.name}
                </h3>
                {form.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                    {form.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Hash size={11} />
                {form.fields.length} fields
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>

            {/* Field types preview */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set(form.fields.map((f) => f.type))).slice(0, 4).map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: "var(--surface-overlay)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                  }}
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setActiveForm(form)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: "rgba(108,99,255,0.08)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  color: "var(--accent-soft)",
                }}
              >
                <Send size={11} /> Submit
              </button>
              <Link
                href={`/form-builder?edit=${form._id}`}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: "rgba(255,176,32,0.08)",
                  border: "1px solid rgba(255,176,32,0.25)",
                  color: "#FFB020",
                }}
              >
                <Pencil size={11} /> Edit
              </Link>
              <Link
                href={`/dashboard/submissions?formId=${form._id}`}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: "rgba(0,217,126,0.08)",
                  border: "1px solid rgba(0,217,126,0.2)",
                  color: "#00D97E",
                }}
              >
                <Eye size={11} /> View Data
              </Link>
              <button
                onClick={() => handleDelete(form._id!)}
                disabled={deleting === form._id}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-rose-500/10 disabled:opacity-40"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {deleting === form._id
                  ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  : <Trash2 size={12} />}
              </button>
            </div>
          </div>
        ))}

        {/* New form card */}
        <Link
          href="/form-builder"
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 border-dashed transition-all duration-200 hover:-translate-y-0.5 min-h-48"
          style={{ border: "2px dashed var(--border)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,99,255,0.4)";
            (e.currentTarget as HTMLElement).style.background = "rgba(108,99,255,0.04)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}
          >
            <Plus size={18} style={{ color: "var(--accent)" }} />
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            New Form
          </span>
        </Link>
      </div>

      {/* Submit modal */}
      {mounted && activeForm && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveForm(null); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden animate-fade-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Modal header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 className="font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
                  {activeForm.name}
                </h3>
                {activeForm.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{activeForm.description}</p>
                )}
              </div>
              <button
                onClick={() => setActiveForm(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <DynamicForm
                form={activeForm}
                onSubmitted={() => setSubmissionCount((c) => c + 1)}
              />
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
