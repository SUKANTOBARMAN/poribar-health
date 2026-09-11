import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { emergencyApi } from "@/api/emergency";
import type { BloodGroup } from "@/types";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";

const GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodSearch() {
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [upazilaId, setUpazilaId] = useState<number | null>(null);

  const { data: donors, isLoading } = useQuery({
    queryKey: ["blood-donors", bloodGroup, upazilaId],
    queryFn: () => emergencyApi.bloodDonors({
      ...(bloodGroup ? { blood_group: bloodGroup } : {}),
      ...(upazilaId ? { upazila_id: upazilaId } : {}),
    }),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">রক্তদাতা খুঁজুন</h1>

      <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="max-w-xs">
          <Select label="রক্তের গ্রুপ" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
            <option value="">সব</option>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
        </div>
        <div>
          <label className="label">এলাকা অনুযায়ী খুঁজো</label>
          <GeoUpazilaPicker value={upazilaId} onChange={setUpazilaId} />
        </div>
        {(bloodGroup || upazilaId) && (
          <button onClick={() => { setBloodGroup(""); setUpazilaId(null); }} className="text-xs text-brand-600 hover:underline">ফিল্টার মুছে দাও</button>
        )}
      </div>

      {isLoading && <Spinner />}
      {donors?.length === 0 && <EmptyState message="এই শর্তে কোনো রক্তদাতা পাওয়া যায়নি" />}
      <div className="mt-6 space-y-3">
        {donors?.map((d) => (
          <Card key={d.id} className="flex items-center justify-between">
            <div>
              <p className="font-bold text-rust-600">{d.blood_group}</p>
              {d.last_donated_at && <p className="text-xs text-slate-500">শেষ দান: {d.last_donated_at}</p>}
            </div>
            {d.contact_phone ? (
              <a href={`tel:${d.contact_phone}`} className="btn btn-primary text-xs">📞 {d.contact_phone}</a>
            ) : (
              <p className="text-xs text-slate-400">যোগাযোগের জন্য লগইন করো (volunteer)</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}