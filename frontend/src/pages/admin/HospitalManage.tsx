import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalsApi } from "@/api/hospitals";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function HospitalManage() {
  const { id } = useParams();
  const hospitalId = Number(id);
  const qc = useQueryClient();

  const { data: hospital, isLoading } = useQuery({ queryKey: ["hospital", hospitalId], queryFn: () => hospitalsApi.detail(hospitalId) });

  const [deptForm, setDeptForm] = useState({ name_bn: "", name_en: "", opd_days: "" });
  const [doctorForms, setDoctorForms] = useState<Record<number, { name: string; designation: string }>>({});

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hospital", hospitalId] });

  const addDept = useMutation({
    mutationFn: () => hospitalsApi.createDepartment(hospitalId, deptForm),
    onSuccess: () => { invalidate(); setDeptForm({ name_bn: "", name_en: "", opd_days: "" }); },
  });
  const deleteDept = useMutation({ mutationFn: (deptId: number) => hospitalsApi.deleteDepartment(deptId), onSuccess: invalidate });
  const addDoctor = useMutation({
    mutationFn: ({ deptId, payload }: { deptId: number; payload: { name: string; designation: string } }) =>
      hospitalsApi.createDoctor(deptId, payload),
    onSuccess: invalidate,
  });
  const deleteDoctor = useMutation({ mutationFn: (doctorId: number) => hospitalsApi.deleteDoctor(doctorId), onSuccess: invalidate });

  if (isLoading) return <Spinner />;
  if (!hospital) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/app/admin/hospitals" className="text-sm text-brand-600 hover:underline">← হাসপাতাল তালিকায় ফিরে যাও</Link>
      <h1 className="text-xl font-bold text-brand-800">{hospital.name_bn}</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-brand-800">নতুন বিভাগ যোগ করো</h2>
        <form onSubmit={(e) => { e.preventDefault(); addDept.mutate(); }} className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="বিভাগের নাম (বাংলা)" value={deptForm.name_bn} onChange={(e) => setDeptForm({ ...deptForm, name_bn: e.target.value })} required />
          <input className="input" placeholder="Department name (English)" value={deptForm.name_en} onChange={(e) => setDeptForm({ ...deptForm, name_en: e.target.value })} required />
          <input className="input col-span-2" placeholder="OPD দিন (যেমন: Sat-Thu)" value={deptForm.opd_days} onChange={(e) => setDeptForm({ ...deptForm, opd_days: e.target.value })} />
          <Button type="submit" loading={addDept.isPending} className="col-span-2">বিভাগ যোগ করো</Button>
        </form>
      </Card>

      {hospital.departments.map((dept) => (
        <Card key={dept.id}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-800">{dept.name_bn} ({dept.name_en})</h3>
            <Button variant="danger" onClick={() => deleteDept.mutate(dept.id)}>বিভাগ মুছো</Button>
          </div>
          {dept.opd_days && <p className="mt-1 text-xs text-slate-500">OPD: {dept.opd_days}</p>}

          <div className="mt-3 space-y-2">
            {dept.doctors.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm">👨‍⚕️ {doc.name} {doc.designation && `— ${doc.designation}`}</span>
                <button onClick={() => deleteDoctor.mutate(doc.id)} className="text-xs text-rust-600 hover:underline">মুছো</button>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = doctorForms[dept.id] || { name: "", designation: "" };
              addDoctor.mutate({ deptId: dept.id, payload: form });
              setDoctorForms({ ...doctorForms, [dept.id]: { name: "", designation: "" } });
            }}
            className="mt-3 flex gap-2"
          >
            <input
              className="input"
              placeholder="ডাক্তারের নাম"
              value={doctorForms[dept.id]?.name || ""}
              onChange={(e) => setDoctorForms({ ...doctorForms, [dept.id]: { ...doctorForms[dept.id], name: e.target.value, designation: doctorForms[dept.id]?.designation || "" } })}
              required
            />
            <input
              className="input"
              placeholder="পদবি"
              value={doctorForms[dept.id]?.designation || ""}
              onChange={(e) => setDoctorForms({ ...doctorForms, [dept.id]: { ...doctorForms[dept.id], designation: e.target.value, name: doctorForms[dept.id]?.name || "" } })}
            />
            <Button type="submit" loading={addDoctor.isPending}>যোগ করো</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}