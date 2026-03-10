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
      <div className="rounded-xl p-16 text-center bg-base-200 border-2 border-dashed border-base-300/20">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-base-300">
          <Layers size={24} className="text-primary" />
        </div>
        <h3 className="font-bold text-lg mb-2 text-base-content font-display">
          No forms yet
        </h3>
        <p className="text-sm mb-6 text-neutral-content/60">
          Create your first dynamic form to start collecting data
        </p>
        <Link
          href="/form-builder"
          className="btn btn-primary"
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
            className="card bg-base-200 border border-base-300 hover:-translate-y-1 transition-all duration-200"
          >
            {/* Header */}
            <div className="card-body p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-base-300">
                  <Layers size={17} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate text-base-content font-display">
                    {form.name}
                  </h3>
                  {form.description && (
                    <p className="text-xs mt-0.5 truncate text-neutral-content/60">
                      {form.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-neutral-content/60 mt-2">
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
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.from(new Set(form.fields.map((f) => f.type))).slice(0, 4).map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded-full text-xs bg-base-300 border border-base-300 text-neutral-content/60 font-mono"
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-base-300">
                <button
                  onClick={() => setActiveForm(form)}
                  className="flex-1 btn btn-sm p-2 bg-primary/10 border border-base-300 text-primary hover:bg-primary/20"
                >
                  <Send size={11} /> Submit
                </button>
                <Link
                  href={`/form-builder?edit=${form._id}`}
                  className="flex-1 btn btn-sm bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20"
                >
                  <Pencil size={11} /> Edit
                </Link>
                <Link
                  href={`/dashboard/submissions?formId=${form._id}`}
                  className="flex-1 btn btn-sm whitespace-nowrap bg-secondary/10 border border-secondary text-secondary hover:bg-secondary/20"
                >
                  <Eye size={11} /> View Data
                </Link>
                <button
                  onClick={() => handleDelete(form._id!)}
                  disabled={deleting === form._id}
                  className="btn btn-sm  p-2"
                >
                  {deleting === form._id
                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* New form card */}
        <Link
          href="/form-builder"
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-base-300/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 min-h-48"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-base-300">
            <Plus size={18} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-neutral-content/60">
            New Form
          </span>
        </Link>
      </div>

      {/* Submit modal */}
      {mounted && activeForm && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveForm(null); }}
        >
          <div className="card bg-base-200 border border-base-300 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
            {/* Modal header */}
            <div className="card-body p-6 border-b border-base-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base-content font-display">
                    {activeForm.name}
                  </h3>
                  {activeForm.description && (
                    <p className="text-xs mt-0.5 text-neutral-content/60">{activeForm.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setActiveForm(null)}
                  className="btn btn-sm btn-ghost btn-square"
                >
                  <X size={14} />
                </button>
              </div>
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

