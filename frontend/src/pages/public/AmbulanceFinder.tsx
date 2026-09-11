import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { emergencyApi } from "@/api/emergency";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import GeoUpazilaPicker from "@/components/GeoUpazilaPicker";

export default function AmbulanceFinder() {
  const [upazilaId, setUpazilaId] = useState<number | null>(null);
  const { data: ambulances, isLoading } = useQuery({
    queryKey: ["ambulances", upazilaId],
    queryFn: () => emergencyApi.ambulances(upazilaId ? { upazila_id: upazilaId } : {}),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">অ্যাম্বুলেন্স খুঁজুন</h1>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="label">এলাকা অনুযায়ী খুঁজো</label>
        <GeoUpazilaPicker value={upazilaId} onChange={setUpazilaId} />
        {upazilaId && <button onClick={() => setUpazilaId(null)} className="mt-2 text-xs text-brand-600 hover:underline">ফিল্টার মুছে দাও</button>}
      </div>

      {isLoading && <Spinner />}
      {ambulances?.length === 0 && <EmptyState message="এই এলাকায় কোনো অ্যাম্বুলেন্স পাওয়া যায়নি" />}
      <div className="mt-6 space-y-3">
        {ambulances?.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{a.driver_name}</p>
              <p className="text-xs text-slate-500">{a.type === "govt" ? "সরকারি" : a.type === "private" ? "বেসরকারি" : "এনজিও"} {a.ac_available && "· এসি আছে"}</p>
              {a.fare_per_km && <p className="text-xs text-slate-500">প্রতি কিমি ভাড়া: ৳{a.fare_per_km}</p>}
            </div>
            <div className="text-right">
              <a href={`tel:${a.contact_phone}`} className="btn btn-primary text-xs">📞 {a.contact_phone}</a>
              <p className={`mt-1 text-xs ${a.availability_status ? "text-green-600" : "text-slate-400"}`}>
                {a.availability_status ? "উপলব্ধ" : "উপলব্ধ নয়"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}