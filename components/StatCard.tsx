import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "accent" | "jade" | "amber" | "rose";
}

const colorMap = {
  accent: { bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.25)", icon: "#6C63FF", text: "#8B84FF" },
  jade: { bg: "rgba(0,217,126,0.1)", border: "rgba(0,217,126,0.25)", icon: "#00D97E", text: "#00D97E" },
  amber: { bg: "rgba(255,176,32,0.1)", border: "rgba(255,176,32,0.25)", icon: "#FFB020", text: "#FFB020" },
  rose: { bg: "rgba(255,77,106,0.1)", border: "rgba(255,77,106,0.25)", icon: "#FF4D6A", text: "#FF4D6A" },
};

export default function StatCard({ label, value, icon: Icon, trend, color = "accent" }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{ background: `radial-gradient(circle at top right, ${c.bg}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}
          >
            <Icon size={18} style={{ color: c.icon }} />
          </div>
          {trend && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                background: trend.value >= 0 ? "rgba(0,217,126,0.1)" : "rgba(255,77,106,0.1)",
                color: trend.value >= 0 ? "#00D97E" : "#FF4D6A",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </span>
          )}
        </div>

        <div
          className="text-3xl font-bold mb-1"
          style={{ color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}
        >
          {value}
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}
