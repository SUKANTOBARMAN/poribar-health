import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GeoSelector, { type GeoLocation } from "@/components/forms/GeoSelector";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    division_id: undefined as number | undefined,
    district_id: undefined as number | undefined,
    upazila_id: undefined as number | undefined,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (payload: any) => authApi.register(payload),
    onSuccess: () => navigate("/login"),
    onError: (err: any) => setError(err?.response?.data?.detail || "নিবন্ধন ব্যর্থ হয়েছে"),
  });

  const handleLocationChange = (location: GeoLocation) => {
    setForm((prev) => ({
      ...prev,
      division_id: location.division_id,
      district_id: location.district_id,
      upazila_id: location.upazila_id,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      email: form.email.trim() ? form.email.trim() : undefined,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <h1 className="mb-6 text-xl font-bold text-brand-800">সাধারণ ইউজার অ্যাকাউন্ট তৈরি করুন</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="পূর্ণ নাম"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="ফোন নম্বর"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <Input
            label="ইমেইল (ঐচ্ছিক)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="পাসওয়ার্ড"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />

          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              আপনার এলাকা (ঐচ্ছিক)
            </label>
            <GeoSelector onChange={handleLocationChange} />
          </div>

          {error && <p className="text-sm text-rust-600 mt-2">{error}</p>}

          <Button type="submit" loading={mutation.isPending} className="w-full mt-4">
            নিবন্ধন করুন
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ভলান্টিয়ার হতে চান?{" "}
          <Link to="/register/volunteer" className="text-brand-600 hover:underline">
            এখানে নিবন্ধন করুন
          </Link>
          <br />
          অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="text-brand-600 hover:underline">
            লগইন করুন
          </Link>
        </p>
      </Card>
    </div>
  );
}