"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { FormSchema, FormSubmission } from "@/types";
import LogoDisplay from "./LogoDisplay";
import { extractDomain } from "@/lib/utils";

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
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.3)" }}
        >
          <CheckCircle2 size={28} style={{ color: "#00D97E" }} />
        </div>
        <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
          Submitted!
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Your response has been saved to the database
        </p>
        <button
          onClick={() => { setSubmitted(false); setValues({}); }}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", color: "var(--accent-soft)" }}
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {field.label}
              {field.required && <span style={{ color: "var(--rose)" }}> *</span>}
            </label>

            {field.type === "textarea" && (
              <textarea
                className="form-input resize-none"
                placeholder={field.placeholder}
                rows={3}
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )}

            {field.type === "select" && (
              <select
                className="form-input"
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
                style={{ appearance: "none" }}
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "var(--surface-overlay)" }}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setValue(field.id, !Boolean(values[field.id]))}
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: Boolean(values[field.id]) ? "var(--accent)" : "var(--surface-overlay)",
                    border: `2px solid ${Boolean(values[field.id]) ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {Boolean(values[field.id]) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {field.placeholder || "Yes"}
                </span>
              </div>
            )}

            {field.type === "logo" && (
              <div className="space-y-3">
                <div className="relative">
                  <Globe
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    className="form-input"
                    style={{ paddingLeft: "2.2rem" }}
                    type="url"
                    placeholder={field.placeholder || "https://example.com"}
                    value={(values[field.id] as string) || ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                </div>
                {Boolean(values[field.id]) && (
                  <div
                    className="p-3 rounded-lg flex items-center gap-3"
                    style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Preview:</span>
                    <LogoDisplay url={values[field.id] as string} size="sm" showDomain />
                  </div>
                )}
              </div>
            )}

            {!["textarea", "select", "checkbox", "logo"].includes(field.type) && (
              <input
                className="form-input"
                type={field.type}
                placeholder={field.placeholder}
                value={(values[field.id] as string) || ""}
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )}
          </div>
        ))}

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.25)", color: "#FF4D6A" }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
        style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
          color: "white",
          fontFamily: "'Syne', sans-serif",
          boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
        }}
      >
        {submitting ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
        ) : (
          <><Send size={15} />Submit Response</>
        )}
      </button>
    </div>
  );
}
