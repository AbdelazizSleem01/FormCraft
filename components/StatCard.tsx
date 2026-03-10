import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "accent" | "jade" | "amber" | "rose";
}

const colorMap = {
  accent: { bg: "bg-primary/10", border: "border-primary/25", icon: "#6C63FF", text: "text-primary" },
  jade: { bg: "bg-secondary/10", border: "border-secondary/25", icon: "#00D97E", text: "text-secondary" },
  amber: { bg: "bg-accent/10", border: "border-accent/25", icon: "#FFB020", text: "text-accent" },
  rose: { bg: "bg-error/10", border: "border-error/25", icon: "#FF4D6A", text: "text-error" },
};

export default function StatCard({ label, value, icon: Icon, trend, color = "accent" }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card bg-base-200 border border-base-300 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/20">
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-box bg-gradient-to-tr from-primary/5 to-transparent" />

      <div className="card-body p-5 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.bg} ${c.border} border`}>
            <Icon size={18} className={c.text} />
          </div>
          {trend && (
            <div className={`badge ${trend.value >= 0 ? 'bg-secondary/10 text-secondary border-secondary/25' : 'bg-error/10 text-error border-error/25'} border font-mono text-xs`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </div>
          )}
        </div>

        <div className="text-3xl font-bold font-display text-base-content">
          {value}
        </div>
        <div className="text-sm text-neutral-content/60">
          {label}
        </div>
      </div>
    </div>
  );
}

