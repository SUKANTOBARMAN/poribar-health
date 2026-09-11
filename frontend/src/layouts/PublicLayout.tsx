import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function PublicLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/hospitals", label: "হাসপাতাল" },
    { to: "/symptom-checker", label: "লক্ষণ পরীক্ষা" },
    { to: "/ambulances", label: "অ্যাম্বুলেন্স" },
    { to: "/blood-donors", label: "রক্তদাতা" },
    { to: "/articles", label: "ব্লগ" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-700">পরিবার হেলথ</Link>

          <nav className="hidden gap-5 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-brand-700">{l.label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <button onClick={() => navigate("/app")} className="btn btn-secondary text-xs">ড্যাশবোর্ড</button>
                <button onClick={() => { logout(); navigate("/"); }} className="btn btn-ghost text-xs">লগআউট</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost text-xs">লগইন</Link>
                <Link to="/register" className="btn btn-primary text-xs">নিবন্ধন</Link>
              </>
            )}
          </div>

          {/* মোবাইল hamburger বাটন */}
          <button onClick={() => setMenuOpen((o) => !o)} className="text-2xl text-brand-700 md:hidden">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* মোবাইল dropdown মেনু */}
        {menuOpen && (
          <div className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50">
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                {user ? (
                  <>
                    <button onClick={() => { navigate("/app"); setMenuOpen(false); }} className="btn btn-secondary flex-1 text-xs">ড্যাশবোর্ড</button>
                    <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} className="btn btn-ghost flex-1 text-xs">লগআউট</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-ghost flex-1 text-xs">লগইন</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary flex-1 text-xs">নিবন্ধন</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">Joutuk Birodhi Andolon | poribarhealth.org</footer>
    </div>
  );
}