import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { hospitalsApi } from "@/api/hospitals";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function HospitalSearch() {
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ["hospitals", emergencyOnly],
    queryFn: () => hospitalsApi.list(emergencyOnly ? { emergency_available: true } : {}),
  });

  const paged = hospitals?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">হাসপাতাল খুঁজুন</h1>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={emergencyOnly} onChange={(e) => { setEmergencyOnly(e.target.checked); setPage(1); }} />
        শুধু জরুরি সেবা আছে এমন হাসপাতাল দেখাও
      </label>
      {isLoading && <Spinner />}
      {hospitals?.length === 0 && <EmptyState message="কোনো হাসপাতাল পাওয়া যায়নি" />}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {paged.map((h) => (
          <Link key={h.id} to={`/hospitals/${h.id}`} className="card p-5 hover:shadow-md">
            <h3 className="font-semibold text-brand-800">{h.name_bn}</h3>
            <p className="text-sm text-slate-500">{h.name_en} — {h.type}</p>
            <div className="mt-2 flex gap-3 text-xs text-slate-500">
              {h.bed_count && <span>🛏️ {h.bed_count} বেড</span>}
              {h.emergency_available && <span className="text-rust-600">🚨 জরুরি সেবা</span>}
            </div>
            {h.contact_phone && <p className="mt-2 text-sm text-brand-700">📞 {h.contact_phone}</p>}
          </Link>
        ))}
      </div>
      {hospitals && hospitals.length > PAGE_SIZE && (
        <Pagination page={page} hasMore={page * PAGE_SIZE < hospitals.length} onPageChange={setPage} />
      )}
    </div>
  );
}