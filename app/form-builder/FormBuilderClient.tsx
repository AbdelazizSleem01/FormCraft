"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Eye } from "lucide-react";
import FormBuilder from "@/components/FormBuilder";
import DynamicForm from "@/components/DynamicForm";
import { FormSchema } from "@/types";

export default function FormBuilderClient({ initialForm }: { initialForm: FormSchema | null }) {
  const [tab, setTab] = useState<"build" | "preview">("build");
  const [savedForm, setSavedForm] = useState<FormSchema | null>(initialForm);
  const router = useRouter();

  const handleSaved = (form: FormSchema) => {
    setSavedForm(form);
  };

  const tabs = [
    { id: "build", label: "Builder", icon: Wrench },
    { id: "preview", label: "Preview & Submit", icon: Eye },
  ] as const;

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: tab === id ? "var(--surface-overlay)" : "transparent",
              color: tab === id ? "var(--text-primary)" : "var(--text-muted)",
              border: tab === id ? "1px solid var(--border)" : "1px solid transparent",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <Icon size={14} />
            {label}
            {id === "preview" && !savedForm && (
              <span
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: "rgba(255,176,32,0.15)", color: "#FFB020", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}
              >
                Save first
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "build" ? (
        <FormBuilder initialForm={initialForm ?? undefined} onSaved={handleSaved} />
      ) : (
        <div className="max-w-lg mx-auto">
          {savedForm ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <h3 className="font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
                  {savedForm.name}
                </h3>
                {savedForm.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{savedForm.description}</p>
                )}
              </div>
              <div className="p-6">
                <DynamicForm
                  form={savedForm}
                  onSubmitted={() => router.push("/dashboard/submissions")}
                />
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
            >
              <p className="font-medium mb-2" style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}>
                Save your form first
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Go to the Builder tab, fill in the details, and click &quot;Save Form Schema&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
