import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ForgotPassword() {
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendOtp = useMutation({
    mutationFn: () => authApi.forgotPassword(phone),
    onSuccess: () => setStep("reset"),
  });

  const reset = useMutation({
    mutationFn: () => authApi.resetPassword(phone, otp, newPassword),
    onSuccess: () => navigate("/login"),
    onError: (err: any) => setError(err?.response?.data?.detail || "ব্যর্থ হয়েছে"),
  });

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Card>
        <h1 className="mb-6 text-xl font-bold text-brand-800">পাসওয়ার্ড ভুলে গেছো?</h1>

        {step === "phone" && (
          <form onSubmit={(e) => { e.preventDefault(); sendOtp.mutate(); }} className="space-y-4">
            <Input label="ফোন নম্বর" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Button type="submit" loading={sendOtp.isPending} className="w-full">OTP পাঠাও</Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={(e) => { e.preventDefault(); setError(""); reset.mutate(); }} className="space-y-4">
            <p className="text-sm text-slate-500">{phone} নম্বরে OTP পাঠানো হয়েছে (SMS gateway সেটআপ না থাকলে server log-এ দেখো)।</p>
            <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
            <Input label="নতুন পাসওয়ার্ড" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            {error && <p className="text-sm text-rust-600">{error}</p>}
            <Button type="submit" loading={reset.isPending} className="w-full">পাসওয়ার্ড রিসেট করো</Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-500"><Link to="/login" className="text-brand-600 hover:underline">লগইনে ফিরে যাও</Link></p>
      </Card>
    </div>
  );
}