import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { HospitalDetailOut } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function HospitalManagement() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // নতুন হাসপাতালের ফর্ম স্টেট
  const [formData, setFormData] = useState({
    upazila_id: 1,
    name_bn: "",
    name_en: "",
    type: "govt",
    bed_count: 100,
    emergency_available: true,
    contact_phone: "",
    address: "",
  });

  const { data: hospitals, isLoading } = useQuery<HospitalDetailOut[]>({
    queryKey: ["admin-hospitals"],
    queryFn: () => api.get("/hospitals").then((r) => r.data),
  });

  // নতুন হাসপাতাল যোগ মিউটেশন
  const createMutation = useMutation({
    mutationFn: (payload: typeof formData) => api.post("/admin/hospitals", payload),
    onSuccess: () => {
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
    },
  });

  // ইমার্জেন্সি স্ট্যাটাস টগল/আপডেট মিউটেশন
  const toggleEmergencyMutation = useMutation({
    mutationFn: ({ id, emergency_available }: { id: number; emergency_available: boolean }) =>
      api.patch(`/admin/hospitals/${id}`, { emergency_available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hospitals"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">হাসপাতাল ব্যবস্থাপনা</h1>
          <p className="text-sm text-slate-500">নতুন হাসপাতাল যোগ করুন এবং এমার্জেন্সি স্ট্যাটাস আপডেট করুন</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary text-xs"
        >
          {showAddForm ? "✕ বন্ধ করুন" : "+ নতুন হাসপাতাল"}
        </button>
      </div>

      {showAddForm && (
        <Card className="mb-6 p-5">
          <h3 className="mb-4 font-semibold text-slate-800">নতুন হাসপাতাল যোগ করুন</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
            <div>
              <label className="block font-medium text-slate-600">উপজেলা আইডি:</label>
              <input
                type="number"
                value={formData.upazila_id}
                onChange={(e) => setFormData({ ...formData, upazila_id: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">ধরন (Type):</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
              >
                <option value="govt">সরকারি (Govt)</option>
                <option value="private">বেসরকারি (Private)</option>
                <option value="ngo">এনজিও (NGO)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600">নাম (বাংলা):</label>
              <input
                type="text"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">Name (English):</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">বেড সংখ্যা:</label>
              <input
                type="number"
                value={formData.bed_count}
                onChange={(e) => setFormData({ ...formData, bed_count: Number(e.target.value) })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600">যোগাযোগ নম্বর:</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary text-xs"
              >
                {createMutation.isPending ? "সেভ হচ্ছে..." : "হাসপাতাল যোগ করুন"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <Spinner />}

      <div className="space-y-3">
        {hospitals?.map((h) => (
          <Card key={h.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{h.name_bn}</h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 uppercase">
                  {h.type}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">📞 {h.contact_phone} · 🛏️ {h.bed_count} টি বেড</p>
            </div>

            <button
              onClick={() =>
                toggleEmergencyMutation.mutate({
                  id: h.id,
                  emergency_available: !h.emergency_available,
                })
              }
              className={`btn text-xs ${
                h.emergency_available ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              ইমার্জেন্সি: {h.emergency_available ? "চালু" : "বন্ধ"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}