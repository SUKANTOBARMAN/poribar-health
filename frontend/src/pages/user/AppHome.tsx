import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";

export default function AppHome() {
  const { user, hasRole } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-800">স্বাগতম, {user?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">তোমার একাউন্ট: {user?.roles.join(", ")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/app/help-requests">
          <Card className="hover:shadow-md">
            <p className="text-2xl">📋</p>
            <p className="mt-2 font-medium">আমার সাহায্যের অনুরোধ</p>
            <p className="mt-1 text-xs text-slate-500">নতুন অনুরোধ পাঠাও বা আগেরগুলো দেখো</p>
          </Card>
        </Link>

        {hasRole("volunteer") && (
          <>
            <Link to="/app/volunteer/dashboard">
              <Card className="hover:shadow-md">
                <p className="text-2xl">📊</p>
                <p className="mt-2 font-medium">ভলান্টিয়ার ড্যাশবোর্ড</p>
                <p className="mt-1 text-xs text-slate-500">ব্যাজ, র‍্যাংক, মোট সহায়তা দেখো</p>
              </Card>
            </Link>
            <Link to="/app/volunteer/requests">
              <Card className="hover:shadow-md">
                <p className="text-2xl">🤝</p>
                <p className="mt-2 font-medium">এলাকার অনুরোধ</p>
                <p className="mt-1 text-xs text-slate-500">নতুন কাউকে সাহায্য করো</p>
              </Card>
            </Link>
          </>
        )}

        {hasRole("director", "super_admin") && (
          <Link to="/app/director/volunteers">
            <Card className="hover:shadow-md">
              <p className="text-2xl">✅</p>
              <p className="mt-2 font-medium">ভলান্টিয়ার অনুমোদন</p>
              <p className="mt-1 text-xs text-slate-500">অপেক্ষমান আবেদন রিভিউ করো</p>
            </Card>
          </Link>
        )}

        {hasRole("super_admin") && (
          <Link to="/app/admin/dashboard">
            <Card className="hover:shadow-md">
              <p className="text-2xl">🏢</p>
              <p className="mt-2 font-medium">Organization Dashboard</p>
              <p className="mt-1 text-xs text-slate-500">পুরো প্ল্যাটফর্মের সার্বিক চিত্র</p>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}