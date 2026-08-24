import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: () => authApi.login(phone, password),
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token);
      const me = await authApi.me();
      setUser(me);
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    },
    onError: (err: any) => setError(err?.response?.data?.detail || "লগইন ব্যর্থ হয়েছে"),
  });

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Card>
        <h1 className="mb-6 text-xl font-bold text-brand-800">লগইন করুন</h1>
        <form onSubmit={(e) => { e.preventDefault(); setError(""); mutation.mutate(); }} className="space-y-4">
          <Input label="ফোন নম্বর" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01700000000" required />
          <Input label="পাসওয়ার্ড" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-rust-600">{error}</p>}
          <Button type="submit" loading={mutation.isPending} className="w-full">লগইন</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          একাউন্ট নেই? <Link to="/register" className="text-brand-600 hover:underline">নিবন্ধন করুন</Link>
        </p>
      </Card>
    </div>
  );
}
