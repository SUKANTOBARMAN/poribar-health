import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function PublicLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-700">পরিবার হেলথ</Link>
          <nav className="hidden gap-5 text-sm font-medium text-slate-600 md:flex">
            <Link to="/hospitals" className="hover:text-brand-700">হাসপাতাল</Link>
            <Link to="/symptom-checker" className="hover:text-brand-700">লক্ষণ পরীক্ষা</Link>
            <Link to="/ambulances" className="hover:text-brand-700">অ্যাম্বুলেন্স</Link>
            <Link to="/blood-donors" className="hover:text-brand-700">রক্তদাতা</Link>
            <Link to="/articles" className="hover:text-brand-700">ব্লগ</Link>
          </nav>
          <div className="flex items-center gap-3">
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
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">Joutuk Birodhi Andolon | poribarhealth.org</footer>
    </div>
  );
}
