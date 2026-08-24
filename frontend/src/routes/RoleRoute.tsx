import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function RoleRoute({ roles }: { roles: string[] }) {
  const hasRole = useAuthStore((s) => s.hasRole);
  if (!hasRole(...roles)) return <Navigate to="/app" replace />;
  return <Outlet />;
}
