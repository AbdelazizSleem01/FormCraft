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
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit bg-base-200 border border-base-300">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === id ? 'bg-base-300 text-base-content border border-base-300' : 'text-neutral-content/60 hover:text-base-content'}`}
          >
            <Icon size={14} />
            {label}
            {id === "preview" && !savedForm && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-accent/15 text-accent font-mono" style={{ fontSize: "0.6rem" }}>
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
            <div className="card bg-base-200 border border-base-300 overflow-hidden">
              <div className="px-6 py-4 border-b border-base-300">
                <h3 className="font-bold text-base-content font-display">
                  {savedForm.name}
                </h3>
                {savedForm.description && (
                  <p className="text-xs mt-0.5 text-neutral-content/60">{savedForm.description}</p>
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
            <div className="card bg-base-200 border-2 border-dashed border-base-300/20 p-12 text-center">
              <p className="font-medium mb-2 text-neutral-content/80 font-display">
                Save your form first
              </p>
              <p className="text-sm text-neutral-content/60">
                Go to the Builder tab, fill in the details, and click "Save Form Schema"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

