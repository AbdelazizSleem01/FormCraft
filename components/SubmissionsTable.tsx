"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trash2, RefreshCw, Download, Filter, ChevronUp, ChevronDown, Search, Pencil, X, Save } from "lucide-react";
import { FormSubmission, FormSchema } from "@/types";
import LogoDisplay from "./LogoDisplay";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface SubmissionsTableProps {
  formId?: string;
  forms?: FormSchema[];
  refreshTrigger?: number;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^www\./i.test(value);
}

function isLikelyLogoField(key: string, value: unknown): boolean {
  if (typeof value !== "string" || !value) return false;
  const lower = key.toLowerCase();
  return (
    (lower.includes("logo") || lower.includes("website") || lower.includes("url") || lower.includes("domain")) &&
    isUrl(value)
  );
}

export default function SubmissionsTable({ formId, forms, refreshTrigger }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState(formId || "all");
  const [sortCol, setSortCol] = useState<string>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedForm && selectedForm !== "all"
        ? `/api/submissions?formId=${selectedForm}`
        : "/api/submissions";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setSubmissions(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedForm]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (submission: FormSubmission) => {
    setEditingSubmission(submission);
    setEditData({ ...submission.data });
  };

  const cancelEdit = () => {
    setEditingSubmission(null);
    setEditData({});
    setSavingEdit(false);
  };

  const updateEditField = (key: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const saveEdit = async () => {
    if (!editingSubmission?._id) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/submissions/${editingSubmission._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: editData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update submission");

      setSubmissions((prev) =>
        prev.map((s) => (s._id === editingSubmission._id ? json.data : s))
      );
      cancelEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update submission");
      setSavingEdit(false);
    }
  };

  const allColumns = Array.from(
    new Set(submissions.flatMap((s) => Object.keys(s.data)))
  );

  const filtered = submissions.filter((s) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      s.formName.toLowerCase().includes(searchLower) ||
      Object.values(s.data).some((v) => String(v).toLowerCase().includes(searchLower))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal: unknown, bVal: unknown;
    if (sortCol === "submittedAt") {
      aVal = a.submittedAt || "";
      bVal = b.submittedAt || "";
    } else if (sortCol === "formName") {
      aVal = a.formName;
      bVal = b.formName;
    } else {
      aVal = a.data[sortCol] ?? "";
      bVal = b.data[sortCol] ?? "";
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const cols = ["Form Name", "Submitted At", ...allColumns];
    const rows = sorted.map((s) => [
      s.formName,
      formatDate(s.submittedAt),
      ...allColumns.map((col) => JSON.stringify(s.data[col] ?? "")),
    ]);
    const csv = [cols.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "submissions.csv";
    a.click();
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex flex-col" style={{ opacity: sortCol === col ? 1 : 0.3 }}>
      <ChevronUp size={8} style={{ color: sortCol === col && sortDir === "asc" ? "var(--accent)" : "inherit" }} />
      <ChevronDown size={8} style={{ color: sortCol === col && sortDir === "desc" ? "var(--accent)" : "inherit" }} />
    </span>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Toolbar */}
      <div className="p-4 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            className="form-input text-xs"
            style={{ paddingLeft: "2.2rem", paddingTop: "0.45rem", paddingBottom: "0.45rem" }}
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Form filter */}
        {forms && forms.length > 0 && (
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <select
              className="form-input text-xs pl-8"
              style={{ paddingTop: "0.45rem", paddingBottom: "0.45rem", minWidth: "160px" }}
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="all">All forms</option>
              {forms.map((f) => (
                <option key={f._id} value={f._id!} style={{ background: "var(--surface-overlay)" }}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Count badge */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", color: "var(--accent-soft)", fontFamily: "'DM Mono', monospace" }}
        >
          {sorted.length} entries
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={fetchSubmissions}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportCSV}
            disabled={sorted.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.25)", color: "#00D97E" }}
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading submissions...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}>
              <Filter size={20} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-medium" style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}>
              No submissions yet
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Submit a form to see data here
            </p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr style={{ background: "rgba(28,28,38,0.6)" }}>
                <th
                  className="cursor-pointer select-none text-left"
                  onClick={() => toggleSort("formName")}
                >
                  Form <SortIcon col="formName" />
                </th>
                {allColumns.map((col) => (
                  <th key={col} className="cursor-pointer select-none text-left" onClick={() => toggleSort(col)}>
                    {col} <SortIcon col={col} />
                  </th>
                ))}
                <th className="cursor-pointer select-none text-left" onClick={() => toggleSort("submittedAt")}>
                  Submitted <SortIcon col="submittedAt" />
                </th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((submission, rowIdx) => (
                <tr key={submission._id || rowIdx} className="animate-fade-in" style={{ animationDelay: `${rowIdx * 30}ms` }}>
                  <td>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        background: "rgba(108,99,255,0.08)",
                        border: "1px solid rgba(108,99,255,0.18)",
                        color: "var(--accent-soft)",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      {submission.formName}
                    </span>
                  </td>
                  {allColumns.map((col) => {
                    const val = submission.data[col];
                    const strVal = val !== undefined && val !== null ? String(val) : "";
                    const isLogo = isLikelyLogoField(col, val);

                    return (
                      <td key={col}>
                        {isLogo ? (
                          <LogoDisplay url={strVal} size="sm" showDomain showName />
                        ) : typeof val === "boolean" ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: val ? "rgba(0,217,126,0.1)" : "rgba(255,77,106,0.1)",
                              color: val ? "#00D97E" : "#FF4D6A",
                            }}
                          >
                            {val ? "✓ Yes" : "✗ No"}
                          </span>
                        ) : strVal.startsWith("http") || strVal.startsWith("www.") ? (
                          <Link
                            href={strVal.startsWith("http") ? strVal : `https://${strVal}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate block max-w-xs"
                            style={{ color: "var(--accent-soft)", maxWidth: "200px" }}
                          >
                            {strVal}
                          </Link>
                        ) : strVal ? (
                          <span className="truncate block" style={{ maxWidth: "200px" }} title={strVal}>
                            {strVal}
                          </span>
                        ) : (
                          <span style={{ color: "var(--border)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
                    {formatDate(submission.submittedAt)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(submission)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                        style={{ color: "var(--text-muted)", border: "1px solid transparent" }}
                        title="Edit submission"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id!)}
                        disabled={deleting === submission._id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-rose-500/10 disabled:opacity-40"
                        style={{ color: "var(--text-muted)", border: "1px solid transparent" }}
                        title="Delete submission"
                      >
                        {deleting === submission._id
                          ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mounted && editingSubmission && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 className="font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
                  Edit Submission
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {editingSubmission.formName}
                </p>
              </div>
              <button
                onClick={cancelEdit}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {Object.entries(editData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    {key}
                  </label>
                  {typeof value === "boolean" ? (
                    <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateEditField(key, e.target.checked)}
                      />
                      {value ? "Yes" : "No"}
                    </label>
                  ) : typeof value === "number" ? (
                    <input
                      type="number"
                      className="form-input"
                      value={value}
                      onChange={(e) => updateEditField(key, e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={value === null || value === undefined ? "" : String(value)}
                      onChange={(e) => updateEditField(key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-muted))",
                  color: "white",
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
                }}
              >
                {savingEdit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
