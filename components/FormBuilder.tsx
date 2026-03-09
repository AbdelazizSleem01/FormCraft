"use client";

import { useState, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, ChevronDown, Save, Eye, Type,
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
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-up"
          style={{
            background: toast.type === "success" ? "rgba(0,217,126,0.15)" : "rgba(255,77,106,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(0,217,126,0.4)" : "rgba(255,77,106,0.4)"}`,
            backdropFilter: "blur(12px)",
          }}
        >
          {toast.type === "success"
            ? <CheckCircle2 size={16} style={{ color: "#00D97E" }} />
            : <AlertCircle size={16} style={{ color: "#FF4D6A" }} />}
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {toast.message}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Builder canvas */}
        <div className="xl:col-span-3 space-y-4">
          {/* Form info */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Form Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Form Name <span style={{ color: "var(--rose)" }}>*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Customer Feedback Form"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <input
                  className="form-input"
                  placeholder="What is this form for?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {fields.length === 0 ? (
              <div
                className="rounded-xl p-12 text-center border-dashed"
                style={{ border: "2px dashed var(--border)", background: "rgba(28,28,38,0.3)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}
                >
                  <Plus size={20} style={{ color: "var(--accent)" }} />
                </div>
                <p className="font-medium mb-1" style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}>
                  No fields yet
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
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
                      "rounded-xl p-4 transition-all duration-200",
                      dragOver === field.id && "ring-2 ring-accent"
                    )}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
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
                    <div className="flex items-center gap-3 mb-3">
                      {/* Drag handle */}
                      <div className="cursor-grab active:cursor-grabbing" style={{ color: "var(--border)" }}>
                        <GripVertical size={16} />
                      </div>

                      {/* Field type badge */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}
                      >
                        <FieldIcon size={13} style={{ color: "var(--accent)" }} />
                      </div>

                      <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
                      >
                        #{idx + 1} {field.type.toUpperCase()}
                      </span>

                      <div className="flex-1" />

                      {/* Required toggle */}
                      <button
                        onClick={() => updateField(field.id, { required: !field.required })}
                        className="text-xs px-2 py-1 rounded-md transition-all"
                        style={{
                          background: field.required ? "rgba(255,77,106,0.1)" : "var(--surface-overlay)",
                          border: `1px solid ${field.required ? "rgba(255,77,106,0.3)" : "var(--border)"}`,
                          color: field.required ? "#FF4D6A" : "var(--text-muted)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "0.65rem",
                        }}
                      >
                        {field.required ? "Required" : "Optional"}
                      </button>

                      <button
                        onClick={() => removeField(field.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-rose-500/10"
                        style={{ color: "var(--text-muted)", border: "1px solid transparent" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                          Field Label
                        </label>
                        <input
                          className="form-input text-xs"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          style={{ padding: "0.4rem 0.65rem" }}
                        />
                      </div>
                      {field.type !== "checkbox" && field.type !== "select" && field.type !== "logo" && (
                        <div>
                          <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                            Placeholder
                          </label>
                          <input
                            className="form-input text-xs"
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            style={{ padding: "0.4rem 0.65rem" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Select options */}
                    {field.type === "select" && (
                      <div className="mt-3">
                        <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                          Options
                        </label>
                        <div className="space-y-2">
                          {field.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-xs w-4" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                                {optIdx + 1}.
                              </span>
                              <input
                                className="form-input text-xs flex-1"
                                value={opt}
                                onChange={(e) => updateSelectOption(field.id, optIdx, e.target.value)}
                                style={{ padding: "0.35rem 0.6rem" }}
                              />
                              <button onClick={() => removeSelectOption(field.id, optIdx)}
                                className="w-6 h-6 flex items-center justify-center rounded"
                                style={{ color: "var(--text-muted)" }}>
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addSelectOption(field.id)}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              color: "var(--accent-soft)",
                              background: "rgba(108,99,255,0.08)",
                              border: "1px dashed rgba(108,99,255,0.3)",
                            }}
                          >
                            <Plus size={11} /> Add option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Logo field info */}
                    {field.type === "logo" && (
                      <div
                        className="mt-3 p-3 rounded-lg text-xs"
                        style={{ background: "rgba(0,217,126,0.06)", border: "1px solid rgba(0,217,126,0.15)", color: "#00D97E" }}
                      >
                        Add a direct logo image URL (png/jpg/svg) or a website URL for favicon fallback
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Save button */}
          <button
            onClick={saveForm}
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
              color: "white",
              fontFamily: "'Syne', sans-serif",
              boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
            }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div
            className="rounded-xl p-4 sticky top-20"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3
              className="text-xs font-semibold mb-4 uppercase tracking-widest"
              style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
            >
              Add Field
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {FIELD_TYPES.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 group hover:-translate-x-0.5"
                  style={{
                    background: "var(--surface-overlay)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,99,255,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(108,99,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-overlay)";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.15)" }}
                  >
                    <Icon size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {label}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {description}
                    </div>
                  </div>
                  <Plus size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }} />
                </button>
              ))}
            </div>

            {/* Stats */}
            {fields.length > 0 && (
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-muted)" }}>Total fields</span>
                  <span style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>{fields.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-muted)" }}>Required</span>
                  <span style={{ color: "#FF4D6A", fontFamily: "'DM Mono', monospace" }}>{fields.filter(f => f.required).length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
