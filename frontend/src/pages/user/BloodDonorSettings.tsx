import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emergencyApi } from "@/api/emergency";
import type { BloodGroup } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";
import Spinner from "@/components/ui/Spinner";

const GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodDonorSettings() {
  const qc = useQueryClient();
  const { data: donor, isLoading, isError } = useQuery({
    queryKey: ["my-donor-profile"],
    queryFn: emergencyApi.myDonorProfile,
    retry: false,
  });

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const [visibility, setVisibility] = useState("volunteers_only");
  const [lastDonated, setLastDonated] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => emergencyApi.registerAsDonor({ blood_group: bloodGroup, upazila_id: upazilaId!, contact_visibility: visibility as any }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-donor-profile"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { is_available?: boolean; last_donated_at?: string; contact_visibility?: string }) =>
      emergencyApi.updateMyDonorProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-donor-profile"] }),
  });

  useEffect(() => {
    if (donor) setLastDonated(donor.last_donated_at || "");
  }, [donor]);

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-brand-800">রক্তদাতা সেটিংস</h1>

      {isError && (
        <Card className="mt-4">
          <p className="mb-3 text-sm text-slate-600">তুমি এখনো রক্তদাতা হিসেবে নিবন্ধিত না। নিবন্ধন করলে জরুরি প্রয়োজনে অন্যদের সাহায্য করতে পারবে।</p>
          <div className="space-y-3">
            <Select label="রক্তের গ্রুপ" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}>
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
            <div>
              <label className="label">এলাকা</label>
              <GeoUpazilaPicker value={upazilaId} onChange={setUpazilaId} />
            </div>
            <Select label="যোগাযোগ দৃশ্যমানতা" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="volunteers_only">শুধু ভলান্টিয়াররা দেখবে</option>
              <option value="public">সবাই দেখবে</option>
            </Select>
            <Button loading={registerMutation.isPending} disabled={!upazilaId} onClick={() => registerMutation.mutate()}>নিবন্ধন করো</Button>
          </div>
        </Card>
      )}

      {donor && (
        <Card className="mt-4">
          <p className="text-sm"><span className="text-slate-500">রক্তের গ্রুপ:</span> <span className="font-bold text-rust-600">{donor.blood_group}</span></p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">দান করার জন্য উপলব্ধ</span>
            <button
              onClick={() => updateMutation.mutate({ is_available: !donor.is_available })}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${donor.is_available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
            >
              {donor.is_available ? "✓ উপলব্ধ" : "উপলব্ধ নয়"}
            </button>
          </div>

          <div className="mt-4">
            <label className="label">শেষ রক্তদানের তারিখ</label>
            <div className="flex gap-2">
              <input type="date" className="input" value={lastDonated} onChange={(e) => setLastDonated(e.target.value)} />
              <Button variant="secondary" loading={updateMutation.isPending} onClick={() => updateMutation.mutate({ last_donated_at: lastDonated })}>সেভ</Button>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">যোগাযোগ দৃশ্যমানতা</label>
            <Select value={donor.contact_visibility} onChange={(e) => updateMutation.mutate({ contact_visibility: e.target.value })}>
              <option value="volunteers_only">শুধু ভলান্টিয়াররা দেখবে</option>
              <option value="public">সবাই দেখবে</option>
            </Select>
          </div>
        </Card>
      )}
    </div>
  );
}