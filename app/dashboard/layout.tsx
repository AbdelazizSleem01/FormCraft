import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SidebarProvider } from "@/components/SidebarContext";
import { requireServerAuth } from "@/lib/server-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = requireServerAuth();

  return (
    <div className="min-h-screen bg-base-100">
      <SidebarProvider>
        <Sidebar user={user} />
        <TopBar user={user} />
        <main className="min-h-screen pt-[65px] md:ml-[240px]">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
