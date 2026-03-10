"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Trash2,
  RefreshCw,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Search,
  Pencil,
  X,
  Save,
} from "lucide-react";
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
    (lower.includes("logo") ||
      lower.includes("website") ||
      lower.includes("url") ||
      lower.includes("domain")) &&
    isUrl(value)
  );
}

export default function SubmissionsTable({
  formId,
  forms,
  refreshTrigger,
}: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState(formId || "all");
  const [sortCol, setSortCol] = useState<string>("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [editingSubmission, setEditingSubmission] =
    useState<FormSubmission | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedForm && selectedForm !== "all"
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

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions, refreshTrigger]);

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
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
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
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp
        size={8}
        className={
          sortCol === col && sortDir === "asc"
            ? "text-accent"
            : "opacity-30"
        }
      />
      <ChevronDown
        size={8}
        className={
          sortCol === col && sortDir === "desc"
            ? "text-accent"
            : "opacity-30"
        }
      />
    </span>
  );

  return (
    <div className="card bg-base-200 border border-base-300 overflow-hidden">
      {/* Toolbar */}
      <div className=" p-4 flex  items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-content/60"
          />
          <input
            className="input input-bordered input-sm w-full pl-3 bg-base-300"
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Form filter */}
        {forms && forms.length > 0 && (
          <div className="relative">
            <Filter
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-content/60"
            />
            <select
              className="select select-bordered select-sm pl-8 bg-base-300 min-w-[160px]"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="all">All forms</option>
              {forms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Count badge */}
        <span className="badge bg-primary/10 text-primary border-base-300 font-mono">
          {sorted.length} entries
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={fetchSubmissions}
            className="btn btn-ghost btn-sm btn-square"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportCSV}
            disabled={sorted.length === 0}
            className="btn btn-sm bg-secondary/10 border border-secondary p-2 text-secondary hover:bg-secondary/20"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <p className="text-sm mt-3 text-neutral-content/60">
              Loading submissions...
            </p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-base-300 border border-base-300">
              <Filter size={20} className="text-neutral-content/60" />
            </div>
            <p className="font-medium text-neutral-content/80 font-display">
              No submissions yet
            </p>
            <p className="text-sm mt-1 text-neutral-content/60">
              Submit a form to see data here
            </p>
          </div>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr className="bg-base-300/60 whitespace-nowrap ">
                <th
                  className="cursor-pointer select-none text-left px-4 py-3"
                  onClick={() => toggleSort("formName")}
                >
                  Form <SortIcon col="formName" />
                </th>
                {allColumns.map((col) => (
                  <th
                    key={col}
                    className="cursor-pointer select-none text-left px-4 py-3"
                    onClick={() => toggleSort(col)}
                  >
                    {col} <SortIcon col={col} />
                  </th>
                ))}
                <th
                  className="cursor-pointer select-none text-left px-4 py-3"
                  onClick={() => toggleSort("submittedAt")}
                >
                  Submitted <SortIcon col="submittedAt" />
                </th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((submission, rowIdx) => (
                <tr
                  key={submission._id || rowIdx}
                  className="animate-fade-in hover:bg-base-300/50"
                  style={{ animationDelay: `${rowIdx * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <span className="badge bg-primary/10 text-primary whitespace-nowrap border-base-300 font-mono text-xs">
                      {submission.formName}
                    </span>
                  </td>
                  {allColumns.map((col) => {
                    const val = submission.data[col];
                    const strVal =
                      val !== undefined && val !== null ? String(val) : "";
                    const isLogo = isLikelyLogoField(col, val);

                    return (
                      <td key={col} className="px-4 py-3">
                        {isLogo ? (
                          <LogoDisplay
                            url={strVal}
                            size="sm"
                            showDomain
                            showName
                          />
                        ) : typeof val === "boolean" ? (
                          <span
                            className={`badge ${
                              val
                                ? "bg-secondary/10 text-secondary border-secondary/25"
                                : "bg-error/10 text-error border-error/25"
                            } border text-xs`}
                          >
                            {val ? "✓ Yes" : "✗ No"}
                          </span>
                        ) : strVal.startsWith("http") || strVal.startsWith("www.") ? (
                          <Link
                            href={
                              strVal.startsWith("http")
                                ? strVal
                                : `https://${strVal}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate block max-w-xs text-primary"
                          >
                            {strVal}
                          </Link>
                        ) : strVal ? (
                          <span className="truncate block max-w-[200px]">
                            {strVal}
                          </span>
                        ) : (
                          <span className="text-neutral-content/20">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap text-neutral-content/60 font-mono text-xs px-4 py-3">
                    {formatDate(submission.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(submission)}
                        className="btn btn-ghost btn-xs btn-square"
                        title="Edit submission"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id!)}
                        disabled={deleting === submission._id}
                        className="btn btn-ghost btn-xs btn-square text-error"
                        title="Delete submission"
                      >
                        {deleting === submission._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {mounted &&
        editingSubmission &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) cancelEdit();
            }}
          >
            <div className="card bg-base-200 border border-base-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="card-body p-6 border-b border-base-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base-content font-display">
                      Edit Submission
                    </h3>
                    <p className="text-xs mt-0.5 text-neutral-content/60">
                      {editingSubmission.formName}
                    </p>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="btn btn-ghost btn-sm btn-square"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {Object.entries(editData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1.5 text-neutral-content/80">
                      {key}
                    </label>
                    {typeof value === "boolean" ? (
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm"
                          checked={value}
                          onChange={(e) => updateEditField(key, e.target.checked)}
                        />
                        {value ? "Yes" : "No"}
                      </label>
                    ) : typeof value === "number" ? (
                      <input
                        type="number"
                        className="input input-bordered input-sm w-full bg-base-300"
                        value={value}
                        onChange={(e) =>
                          updateEditField(
                            key,
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        className="input input-bordered input-sm w-full bg-base-300"
                        value={
                          value === null || value === undefined ? "" : String(value)
                        }
                        onChange={(e) => updateEditField(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="btn btn-primary w-full"
                >
                  {savingEdit ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
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