"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { FormSchema, FormSubmission } from "@/types";
import LogoDisplay from "./LogoDisplay";

interface DynamicFormProps {
  form: FormSchema;
  onSubmitted?: (submission: FormSubmission) => void;
}

export default function DynamicForm({ form, onSubmitted }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (id: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const missing = form.fields
      .filter((f) => f.required && !values[f.id] && values[f.id] !== false)
      .map((f) => f.label);

    if (missing.length > 0) {
      setError(`Required: ${missing.join(", ")}`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Build labeled submission data
      const data: Record<string, unknown> = {};
      form.fields.forEach((field) => {
        data[field.label] = values[field.id] ?? (field.type === "checkbox" ? false : "");
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: form._id,
          formName: form.name,
          data,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      setSubmitted(true);
      onSubmitted?.(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-secondary/10 border border-secondary/30">
          <CheckCircle2 size={28} className="text-secondary" />
        </div>
        <h3 className="font-bold text-lg mb-2 text-base-content font-display">
          Submitted!
        </h3>
        <p className="text-sm mb-6 text-neutral-content/60">
          Your response has been saved to the database
        </p>
        <button
          onClick={() => { setSubmitted(false); setValues({}); }}
          className="btn btn-outline btn-primary btn-sm"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {form.fields
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-1.5 text-neutral-content/80">
              {field.label}
              {field.required && <span className="text-error ml-1">*</span>}
            </label>

            {field.type === "textarea" && (
              <textarea
                className="textarea textarea-bordered w-full resize-none bg-base-300"
                placeholder={field.placeholder}
                rows={3}
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )}

            {field.type === "select" && (
              <select
                className="select select-bordered w-full bg-base-300"
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setValue(field.id, !Boolean(values[field.id]))}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all border-2 ${Boolean(values[field.id]) ? 'bg-primary border-primary' : 'bg-base-300 border-base-300/30'}`}
                >
                  {Boolean(values[field.id]) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-neutral-content/80">
                  {field.placeholder || "Yes"}
                </span>
              </div>
            )}

            {field.type === "logo" && (
              <div className="space-y-3">
                <div className="relative">
                  <Globe
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-content/60"
                  />
                  <input
                    className="input input-bordered w-full bg-base-300 pl-9"
                    type="url"
                    placeholder={field.placeholder || "https://example.com"}
                    value={(values[field.id] as string) || ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                </div>
                {Boolean(values[field.id]) && (
                  <div className="p-3 rounded-lg flex items-center gap-3 bg-base-300 border border-base-300">
                    <span className="text-xs text-neutral-content/60">Preview:</span>
                    <LogoDisplay url={values[field.id] as string} size="sm" showDomain />
                  </div>
                )}
              </div>
            )}

            {!["textarea", "select", "checkbox", "logo"].includes(field.type) && (
              <input
                className="input input-bordered w-full bg-base-300"
                type={field.type}
                placeholder={field.placeholder}
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )}
          </div>
        ))}

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Submitting...
          </>
        ) : (
          <>
            <Send size={15} />
            Submit Response
          </>
        )}
      </button>
    </div>
  );
}

