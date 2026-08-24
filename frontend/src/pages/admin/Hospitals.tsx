import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalsApi } from "@/api/hospitals";
import type { HospitalType } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";

export default function AdminHospitals() {
  const qc = useQueryClient();
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const [form, setForm] = useState({ name_bn: "", name_en: "", type: "govt" as HospitalType, bed_count: "", contact_phone: "" });

  const { data: hospitals, isLoading } = useQuery({ queryKey: ["hospitals"], queryFn: () => hospitalsApi.list() });

  const create = useMutation({
    mutationFn: () =>
      hospitalsApi.create({
        upazila_id: upazilaId!,
        name_bn: form.name_bn,
        name_en: form.name_en,
        type: form.type,
        bed_count: form.bed_count ? Number(form.bed_count) : undefined,
        contact_phone: form.contact_phone || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hospitals"] });
      setForm({ name_bn: "", name_en: "", type: "govt", bed_count: "", contact_phone: "" });
      setUpazilaId(null);
    },
  });

  const toggleEmergency = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) => hospitalsApi.update(id, { emergency_available: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hospitals"] }),
  });

  const canSubmit = upazilaId && form.name_bn && form.name_en;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-800">হাসপাতাল ব্যবস্থাপনা</h1>

      <Card>
        <h2 className="mb-4 font-semibold text-brand-800">নতুন হাসপাতাল যোগ করো</h2>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <div>
            <label className="label">এলাকা</label>
            <GeoUpazilaPicker value={upazilaId} onChange={setUpazilaId} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="নাম (বাংলা)" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} required />
            <input className="input" placeholder="Name (English)" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as HospitalType })}>
              <option value="govt">সরকারি</option>
              <option value="private">বেসরকারি</option>
              <option value="ngo">এনজিও</option>
            </Select>
            <input className="input" placeholder="বেড সংখ্যা" value={form.bed_count} onChange={(e) => setForm({ ...form, bed_count: e.target.value })} />
            <input className="input" placeholder="ফোন নম্বর" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <Button type="submit" loading={create.isPending} disabled={!canSubmit}>যোগ করো</Button>
        </form>
      </Card>

      {isLoading && <Spinner />}
      <div className="space-y-3">
        {hospitals?.map((h) => (
          <Card key={h.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{h.name_bn}</p>
              <p className="text-xs text-slate-500">{h.name_en} · {h.type} {h.bed_count && `· ${h.bed_count} বেড`}</p>
            </div>
            <Button
              variant={h.emergency_available ? "danger" : "secondary"}
              onClick={() => toggleEmergency.mutate({ id: h.id, value: !h.emergency_available })}
            >
              জরুরি সেবা: {h.emergency_available ? "চালু" : "বন্ধ"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}