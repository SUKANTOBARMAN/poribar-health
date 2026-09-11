import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const updateProfile = useMutation({
    mutationFn: () => authApi.updateProfile({ name, email: email || undefined }),
    onSuccess: (data) => setUser(data),
  });

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => { setCurrentPassword(""); setNewPassword(""); setPasswordError(""); },
    onError: (err: any) => setPasswordError(err?.response?.data?.detail || "পাসওয়ার্ড বদলানো যায়নি"),
  });

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-bold text-brand-800">সেটিংস</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-brand-800">প্রোফাইল তথ্য</h2>
        <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-3">
          <Input label="নাম" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="ইমেইল" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={updateProfile.isPending}>সেভ করো</Button>
          {updateProfile.isSuccess && <p className="text-xs text-green-700">✓ আপডেট হয়েছে</p>}
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-brand-800">পাসওয়ার্ড বদলাও</h2>
        <form onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }} className="space-y-3">
          <Input label="বর্তমান পাসওয়ার্ড" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="নতুন পাসওয়ার্ড" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          {passwordError && <p className="text-xs text-rust-600">{passwordError}</p>}
          <Button type="submit" loading={changePassword.isPending}>পাসওয়ার্ড বদলাও</Button>
          {changePassword.isSuccess && <p className="text-xs text-green-700">✓ পাসওয়ার্ড বদলানো হয়েছে</p>}
        </form>
      </Card>
    </div>
  );
}