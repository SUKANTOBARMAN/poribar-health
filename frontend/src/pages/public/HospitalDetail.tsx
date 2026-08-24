import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hospitalsApi } from "@/api/hospitals";
import Spinner from "@/components/ui/Spinner";

export default function HospitalDetail() {
  const { id } = useParams();
  const { data: hospital, isLoading } = useQuery({ queryKey: ["hospital", id], queryFn: () => hospitalsApi.detail(Number(id)) });

  if (isLoading) return <Spinner />;
  if (!hospital) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">{hospital.name_bn}</h1>
      <p className="text-slate-500">{hospital.name_en}</p>
      <div className="card mt-4 p-5 space-y-1 text-sm">
        <p>ধরন: {hospital.type}</p>
        {hospital.bed_count && <p>বেড সংখ্যা: {hospital.bed_count}</p>}
        {hospital.contact_phone && <p>ফোন: {hospital.contact_phone}</p>}
        {hospital.address && <p>ঠিকানা: {hospital.address}</p>}
        <p>জরুরি সেবা: {hospital.emergency_available ? "আছে ✅" : "নেই"}</p>
      </div>
      <h2 className="mt-8 text-lg font-semibold text-brand-800">বিভাগসমূহ</h2>
      <div className="mt-3 space-y-3">
        {hospital.departments.map((d) => (
          <div key={d.id} className="card p-4">
            <h3 className="font-medium">{d.name_bn} ({d.name_en})</h3>
            {d.opd_days && <p className="text-xs text-slate-500">OPD: {d.opd_days} {d.opd_time_start}–{d.opd_time_end}</p>}
            <ul className="mt-2 space-y-1 text-sm">
              {d.doctors.map((doc) => (
                <li key={doc.id}>👨‍⚕️ {doc.name} {doc.designation && `— ${doc.designation}`}</li>
              ))}
            </ul>
          </div>
        ))}
        {hospital.departments.length === 0 && <p className="text-sm text-slate-400">কোনো বিভাগের তথ্য নেই</p>}
      </div>
    </div>
  );
}
