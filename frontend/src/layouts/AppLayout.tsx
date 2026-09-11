import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn("block rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-brand-50");

export default function AppLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarContent = (
    <nav className="space-y-1">
      <NavLink to="/app" end className={linkCls} onClick={() => setMenuOpen(false)}>আমার হোম</NavLink>
      <NavLink to="/app/help-requests" className={linkCls} onClick={() => setMenuOpen(false)}>আমার অনুরোধ</NavLink>
      <NavLink to="/app/settings" className={linkCls} onClick={() => setMenuOpen(false)}>সেটিংস</NavLink>
      <NavLink to="/app/blood-donor" className={linkCls} onClick={() => setMenuOpen(false)}>রক্তদাতা সেটিংস</NavLink>

      {hasRole("volunteer") && (
        <>
          <div className="mt-4 px-3 text-xs font-semibold uppercase text-slate-400">ভলান্টিয়ার</div>
          <NavLink to="/app/volunteer/dashboard" className={linkCls} onClick={() => setMenuOpen(false)}>ড্যাশবোর্ড</NavLink>
          <NavLink to="/app/volunteer/requests" className={linkCls} onClick={() => setMenuOpen(false)}>এলাকার অনুরোধ</NavLink>
          <NavLink to="/app/volunteer/articles" className={linkCls} onClick={() => setMenuOpen(false)}>আমার আর্টিকেল</NavLink>
          <NavLink to="/app/volunteer/assistance-log" className={linkCls} onClick={() => setMenuOpen(false)}>সহায়তার ইতিহাস</NavLink>
          <NavLink to="/app/volunteer/profile" className={linkCls} onClick={() => setMenuOpen(false)}>আমার প্রোফাইল</NavLink>
        </>
      )}

      {hasRole("director", "super_admin") && (
        <>
          <div className="mt-4 px-3 text-xs font-semibold uppercase text-slate-400">ডিরেক্টর</div>
          <NavLink to="/app/director/volunteers" className={linkCls} onClick={() => setMenuOpen(false)}>ভলান্টিয়ার অনুমোদন</NavLink>
          <NavLink to="/app/admin/categories" className={linkCls} onClick={() => setMenuOpen(false)}>ক্যাটাগরি</NavLink>
          <NavLink to="/app/director/articles" className={linkCls} onClick={() => setMenuOpen(false)}>আর্টিকেল রিভিউ</NavLink>
          <NavLink to="/app/director/analytics" className={linkCls} onClick={() => setMenuOpen(false)}>এলাকার অ্যানালিটিক্স</NavLink>
          <NavLink to="/app/director/awards" className={linkCls} onClick={() => setMenuOpen(false)}>পুরস্কার ও সনদ</NavLink>
          <NavLink to="/app/director/certificates" className={linkCls} onClick={() => setMenuOpen(false)}>সার্টিফিকেট ইস্যু</NavLink>
        </>
      )}

      {hasRole("super_admin") && (
        <>
          <div className="mt-4 px-3 text-xs font-semibold uppercase text-slate-400">অ্যাডমিন</div>
          <NavLink to="/app/admin/dashboard" className={linkCls} onClick={() => setMenuOpen(false)}>অর্গানাইজেশন ড্যাশবোর্ড</NavLink>
          <NavLink to="/app/admin/hospitals" className={linkCls} onClick={() => setMenuOpen(false)}>হাসপাতাল ব্যবস্থাপনা</NavLink>
          <NavLink to="/app/admin/volunteers" className={linkCls} onClick={() => setMenuOpen(false)}>সব ভলান্টিয়ার</NavLink>
          <NavLink to="/app/admin/reports" className={linkCls} onClick={() => setMenuOpen(false)}>রিপোর্ট</NavLink>
        </>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* ডেস্কটপ sidebar — সবসময় দেখা যায় */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-6 px-2 text-lg font-bold text-brand-700">পরিবার হেলথ</div>
        {sidebarContent}
      </aside>

      {/* মোবাইল drawer — hamburger দিয়ে টগল হয় */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="text-lg font-bold text-brand-700">পরিবার হেলথ</span>
              <button onClick={() => setMenuOpen(false)} className="text-xl text-slate-500">✕</button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="rounded-lg p-1.5 text-xl text-brand-700 md:hidden">☰</button>
            <div className="text-sm text-slate-500">স্বাগতম, <span className="font-semibold text-slate-800">{user?.name}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => { logout(); navigate("/"); }} className="btn btn-ghost text-xs">লগআউট</button>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}