import BottomNav from "@/components/ui/BottomNav";
import SideRail from "@/components/ui/SideRail";
import SignOutButton from "@/components/ui/SignOutButton";
import Tutorial from "@/components/ui/Tutorial";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grid flex flex-col md:flex-row">
      <SideRail />
      <main className="flex-1 px-4 pt-6 pb-24 md:px-10 md:pt-10 md:pb-10 max-w-3xl mx-auto w-full">
        <div className="flex justify-end items-center gap-5 mb-4">
          <Tutorial />
          <SignOutButton />
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
