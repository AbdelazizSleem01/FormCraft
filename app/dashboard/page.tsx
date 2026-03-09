import { Layers, Database, Clock, TrendingUp, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import connectDB from "@/lib/mongodb";
import { FormSchemaModel, FormSubmissionModel } from "@/lib/models";
import { SessionUser } from "@/types";
import { requireServerAuth } from "@/lib/server-auth";

async function getStats(user: SessionUser) {
  try {
    const filter = user.role === "super_admin" ? {} : { ownerId: user.userId };
    await connectDB();
    const [totalForms, totalSubmissions, recentSubmissions] = await Promise.all([
      FormSchemaModel.countDocuments(filter),
      FormSubmissionModel.countDocuments(filter),
      FormSubmissionModel.find(filter).sort({ submittedAt: -1 }).limit(5).lean(),
    ]);

    // Submissions in the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = await FormSubmissionModel.countDocuments({
      ...filter,
      submittedAt: { $gte: weekAgo },
    });

    return { totalForms, totalSubmissions, recentSubmissions, weeklyCount };
  } catch {
    return { totalForms: 0, totalSubmissions: 0, recentSubmissions: [], weeklyCount: 0 };
  }
}

export default async function DashboardPage() {
  const user = requireServerAuth();
  const { totalForms, totalSubmissions, recentSubmissions, weeklyCount } = await getStats(user);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome */}
      <div>
        <h2
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          Welcome back 👋
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Here&apos;s what&apos;s happening with your forms
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Forms"
          value={totalForms}
          icon={Layers}
          color="accent"
        />
        <StatCard
          label="Total Submissions"
          value={totalSubmissions}
          icon={Database}
          color="jade"
        />
        <StatCard
          label="This Week"
          value={weeklyCount}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          label="Avg / Form"
          value={totalForms > 0 ? Math.round(totalSubmissions / totalForms) : 0}
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/form-builder"
          className="group p-6 rounded-xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(108,99,255,0.04) 100%)",
            border: "1px solid rgba(108,99,255,0.25)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.35)" }}
          >
            <Plus size={20} style={{ color: "var(--accent-soft)" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
              Create New Form
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Build a dynamic form with custom fields
            </p>
          </div>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }} />
        </Link>

        <Link
          href="/dashboard/submissions"
          className="group p-6 rounded-xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, rgba(0,217,126,0.1) 0%, rgba(0,217,126,0.03) 100%)",
            border: "1px solid rgba(0,217,126,0.2)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: "rgba(0,217,126,0.15)", border: "1px solid rgba(0,217,126,0.3)" }}
          >
            <Database size={20} style={{ color: "#00D97E" }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>
              View Submissions
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Browse and export collected data
            </p>
          </div>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: "#00D97E" }} />
        </Link>
      </div>

      {/* Recent submissions preview */}
      {recentSubmissions.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}
            >
              Recent Submissions
            </h3>
            <Link
              href="/dashboard/submissions"
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: "var(--accent-soft)" }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(46,46,66,0.5)" }}>
            {recentSubmissions.map((sub: { _id: unknown; formName: string; submittedAt?: string; data: Record<string, unknown> }, i) => (
              <div key={String(sub._id)} className="px-4 py-3 flex items-center gap-3 hover:bg-white/2 transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: "rgba(108,99,255,0.1)",
                    border: "1px solid rgba(108,99,255,0.2)",
                    color: "var(--accent-soft)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {sub.formName}
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {Object.entries(sub.data).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </div>
                </div>
                <div
                  className="text-xs flex-shrink-0"
                  style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}
                >
                  {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
