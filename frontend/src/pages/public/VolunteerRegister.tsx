import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { institutionsApi } from "@/api/institutions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";

export default function VolunteerRegister() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    student_id_no: "",
    semester: "",
    nid: "",
  });

  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const [institutionId, setInstitutionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // উপজেলা সিলেক্ট করার সাথে সাথে ইনস্টিটিউশন ফেচ হবে
  const { data: institutions } = useQuery({
    queryKey: ["institutions", upazilaId],
    queryFn: () => institutionsApi.list(upazilaId!),
    enabled: !!upazilaId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      authApi.registerVolunteer({
        ...form,
        service_upazila_id: upazilaId!,
        institution_id: institutionId!,
      }),
    onSuccess: () => navigate("/login"),
    onError: (err: any) => setError(err?.response?.data?.detail || "নিবন্ধন ব্যর্থ হয়েছে"),
  });

  const canSubmit = upazilaId && institutionId && form.name && form.email && form.phone && form.password && form.nid;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <h1 className="mb-1 text-xl font-bold text-brand-800">ভলান্টিয়ার নিবন্ধন</h1>
        <p className="mb-6 text-sm text-slate-500">নিবন্ধনের পর Director-এর অনুমোদনের অপেক্ষা করতে হবে।</p>
        
        <form onSubmit={(e) => { e.preventDefault(); setError(""); mutation.mutate(); }} className="space-y-4">
          <Input 
            label="পূর্ণ নাম" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="ফোন নম্বর" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              required 
            />
            <Input 
              label="ইমেইল" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
            />
            <Input 
              label="পাসওয়ার্ড" 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
              minLength={8} 
            />
          </div>

          <div>
            <label className="label">সার্ভিস এলাকা</label>
            <GeoUpazilaPicker 
              value={upazilaId} 
              onChange={(id) => { 
                setUpazilaId(id); 
                setInstitutionId(null); 
              }} 
            />
          </div>

          <div>
            <label className="label">শিক্ষা প্রতিষ্ঠান</label>
            <Select 
              value={institutionId || ""} 
              onChange={(e) => setInstitutionId(Number(e.target.value) || null)} 
              disabled={!upazilaId}
            >
              <option value="">{upazilaId ? "প্রতিষ্ঠান বেছে নাও" : "আগে উপজেলা বেছে নাও"}</option>
              {institutions?.map((i) => <option key={i.id} value={i.id}>{i.name_bn}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="স্টুডেন্ট আইডি" 
              value={form.student_id_no} 
              onChange={(e) => setForm({ ...form, student_id_no: e.target.value })} 
              required 
            />
            <Input 
              label="সেমিস্টার" 
              value={form.semester} 
              onChange={(e) => setForm({ ...form, semester: e.target.value })} 
              required 
            />
          </div>
          
          <Input 
            label="NID নম্বর" 
            value={form.nid} 
            onChange={(e) => setForm({ ...form, nid: e.target.value })} 
            required 
            minLength={10} 
            maxLength={17} 
          />

          {error && <p className="text-sm text-rust-600">{error}</p>}
          
          <Button type="submit" loading={mutation.isPending} disabled={!canSubmit} className="w-full">
            নিবন্ধন করুন
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-slate-500">
          একাউন্ট আছে? <Link to="/login" className="text-brand-600 hover:underline">লগইন করুন</Link>
        </p>
      </Card>
    </div>
  );
}