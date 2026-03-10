"use client";

import { useState, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, Save, Type,
  Mail, Hash, Link as LinkIcon, AlignLeft, List, CheckSquare,
  Calendar, Image, X, AlertCircle, CheckCircle2,
} from "lucide-react";
import { FormField, FieldType, FormSchema } from "@/types";
import { generateId, cn } from "@/lib/utils";

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "text", label: "Text", icon: Type, description: "Short text input" },
  { type: "email", label: "Email", icon: Mail, description: "Email address" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric value" },
  { type: "url", label: "URL", icon: LinkIcon, description: "Website link" },
  { type: "logo", label: "Website Logo", icon: Image, description: "Direct image URL or domain logo" },
  { type: "textarea", label: "Textarea", icon: AlignLeft, description: "Long text" },
  { type: "select", label: "Dropdown", icon: List, description: "Select options" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Boolean toggle" },
  { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
];

interface FormBuilderProps {
  initialForm?: FormSchema;
  onSaved?: (form: FormSchema) => void;
}

export default function FormBuilder({ initialForm, onSaved }: FormBuilderProps) {
  const [formName, setFormName] = useState(initialForm?.name || "");
  const [formDescription, setFormDescription] = useState(initialForm?.description || "");
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const addField = useCallback((type: FieldType) => {
    const newField: FormField = {
      id: generateId(),
      label: `${FIELD_TYPES.find((f) => f.type === type)?.label || "Field"} ${fields.length + 1}`,
      type,
      placeholder: "",
      required: false,
      options: type === "select" ? ["Option 1", "Option 2"] : undefined,
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
    setShowTypeMenu(false);
  }, [fields.length]);

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })));
  };

  const addSelectOption = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, options: [...(f.options || []), `Option ${(f.options?.length || 0) + 1}`] }
          : f
      )
    );
  };

  const updateSelectOption = (fieldId: string, idx: number, value: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, options: f.options?.map((o, i) => (i === idx ? value : o)) }
          : f
      )
    );
  };

  const removeSelectOption = (fieldId: string, idx: number) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, options: f.options?.filter((_, i) => i !== idx) } : f
      )
    );
  };

  const saveForm = async () => {
    if (!formName.trim()) { showToast("error", "Form name is required"); return; }
    if (fields.length === 0) { showToast("error", "Add at least one field"); return; }

    setSaving(true);
    try {
      const payload: FormSchema = {
        name: formName.trim(),
        description: formDescription.trim(),
        fields,
      };

      const url = initialForm?._id ? `/api/forms/${initialForm._id}` : "/api/forms";
      const method = initialForm?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");

      showToast("success", `Form "${formName}" saved successfully!`);
      onSaved?.(json.data);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (type: FieldType) => {
    const found = FIELD_TYPES.find((f) => f.type === type);
    return found ? found.icon : Type;
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="toast toast-top toast-end z-50">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"} shadow-xl`}>
            {toast.type === "success"
              ? <CheckCircle2 size={16} />
              : <AlertCircle size={16} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Builder canvas */}
        <div className="xl:col-span-3 space-y-4">
          {/* Form info */}
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-5">
              <h3 className="font-semibold text-neutral-content/60 mb-4 font-mono text-xs tracking-wider uppercase">
                Form Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-neutral-content/80">
                    Form Name <span className="text-error">*</span>
                  </label>
                  <input
                    className="input input-bordered input-sm w-full bg-base-300"
                    placeholder="e.g. Customer Feedback Form"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-neutral-content/80">
                    Description
                  </label>
                  <input
                    className="input input-bordered input-sm w-full bg-base-300"
                    placeholder="What is this form for?"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {fields.length === 0 ? (
              <div className="rounded-xl p-12 text-center border-2 border-dashed border-base-300/20 bg-base-200/30">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-primary/10 border border-base-300">
                  <Plus size={20} className="text-primary" />
                </div>
                <p className="font-medium mb-1 text-neutral-content/80 font-display">
                  No fields yet
                </p>
                <p className="text-sm text-neutral-content/60">
                  Use the panel on the right to add fields
                </p>
              </div>
            ) : (
              fields.map((field, idx) => {
                const FieldIcon = getFieldIcon(field.type);
                return (
                  <div
                    key={field.id}
                    className={cn(
                      "card bg-base-200 border border-base-300 transition-all duration-200",
                      dragOver === field.id && "ring-2 ring-primary"
                    )}
                    draggable
                    onDragOver={(e) => { e.preventDefault(); setDragOver(field.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(null);
                      const draggedId = e.dataTransfer.getData("fieldId");
                      if (draggedId === field.id) return;
                      const fromIdx = fields.findIndex((f) => f.id === draggedId);
                      if (fromIdx < 0) return;
                      const newFields = [...fields];
                      const [moved] = newFields.splice(fromIdx, 1);
                      newFields.splice(idx, 0, moved);
                      setFields(newFields.map((f, i) => ({ ...f, order: i })));
                    }}
                    onDragStart={(e) => e.dataTransfer.setData("fieldId", field.id)}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing text-neutral-content/30">
                          <GripVertical size={16} />
                        </div>

                        {/* Field type badge */}
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-base-300">
                          <FieldIcon size={13} className="text-primary" />
                        </div>

                        <span className="text-xs font-semibold flex-shrink-0 text-neutral-content/60 font-mono">
                          #{idx + 1} {field.type.toUpperCase()}
                        </span>

                        <div className="flex-1" />

                        {/* Required toggle */}
                        <button
                          onClick={() => updateField(field.id, { required: !field.required })}
                          className={`text-xs px-2 py-1 rounded-md transition-all ${field.required ? 'bg-error/10 text-error border border-error/30' : 'bg-base-300 text-neutral-content/60 border border-base-300/20'}`}
                        >
                          {field.required ? "Required" : "Optional"}
                        </button>

                        <button
                          onClick={() => removeField(field.id)}
                          className="btn btn-ghost btn-xs btn-square text-error"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1 text-neutral-content/60">
                            Field Label
                          </label>
                          <input
                            className="input input-bordered input-xs w-full bg-base-300"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                          />
                        </div>
                        {field.type !== "checkbox" && field.type !== "select" && field.type !== "logo" && (
                          <div>
                            <label className="block text-xs mb-1 text-neutral-content/60">
                              Placeholder
                            </label>
                            <input
                              className="input input-bordered input-xs w-full bg-base-300"
                              value={field.placeholder || ""}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      {/* Select options */}
                      {field.type === "select" && (
                        <div className="mt-3">
                          <label className="block text-xs mb-2 text-neutral-content/60">
                            Options
                          </label>
                          <div className="space-y-2">
                            {field.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-xs w-4 text-neutral-content/60 font-mono">
                                  {optIdx + 1}.
                                </span>
                                <input
                                  className="input input-bordered input-xs flex-1 bg-base-300"
                                  value={opt}
                                  onChange={(e) => updateSelectOption(field.id, optIdx, e.target.value)}
                                />
                                <button onClick={() => removeSelectOption(field.id, optIdx)}
                                  className="btn btn-ghost btn-xs btn-square text-neutral-content/60">
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addSelectOption(field.id)}
                              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-primary bg-primary/10 border border-base-300 hover:bg-primary/20"
                            >
                              <Plus size={11} /> Add option
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Logo field info */}
                      {field.type === "logo" && (
                        <div className="mt-3 p-3 rounded-lg text-xs bg-secondary/10 border border-secondary/20 text-secondary">
                          Add a direct logo image URL (png/jpg/svg) or a website URL for favicon fallback
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Save button */}
          <button
            onClick={saveForm}
            disabled={saving}
            className="btn btn-primary w-full"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                Save Form Schema
              </>
            )}
          </button>
        </div>

        {/* Right: Field type panel */}
        <div className="xl:col-span-2">
          <div className="card bg-base-200 border border-base-300 sticky top-20">
            <div className="card-body p-4">
              <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest text-neutral-content/60 font-mono">
                Add Field
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {FIELD_TYPES.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 group hover:-translate-x-0.5 bg-base-300 border border-base-300 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/15">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-base-content">
                        {label}
                      </div>
                      <div className="text-xs text-neutral-content/60">
                        {description}
                      </div>
                    </div>
                    <Plus size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
              </div>

              {/* Stats */}
              {fields.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-base-300 border border-base-300">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-content/60">Total fields</span>
                    <span className="text-base-content font-mono">{fields.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-content/60">Required</span>
                    <span className="text-error font-mono">{fields.filter(f => f.required).length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

