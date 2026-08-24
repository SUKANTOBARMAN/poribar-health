import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { geoApi } from "@/api/geo";
import Select from "@/components/ui/Select";

interface Props {
  value: number | null;
  onChange: (upazilaId: number | null) => void;
}

// Division → District → Upazila — ক্রমান্বয়ে dropdown, raw ID টাইপ করতে হয় না
export default function GeoUpazilaPicker({ value, onChange }: Props) {
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const { data: divisions } = useQuery({ queryKey: ["divisions"], queryFn: geoApi.divisions });
  const { data: districts } = useQuery({
    queryKey: ["districts", divisionId],
    queryFn: () => geoApi.districts(divisionId!),
    enabled: !!divisionId,
  });
  const { data: upazilas } = useQuery({
    queryKey: ["upazilas", districtId],
    queryFn: () => geoApi.upazilas(districtId!),
    enabled: !!districtId,
  });

  useEffect(() => {
    if (!value) { setDivisionId(null); setDistrictId(null); }
  }, [value]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={divisionId || ""} onChange={(e) => { setDivisionId(Number(e.target.value) || null); setDistrictId(null); onChange(null); }}>
        <option value="">বিভাগ</option>
        {divisions?.map((d) => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
      </Select>
      <Select value={districtId || ""} onChange={(e) => { setDistrictId(Number(e.target.value) || null); onChange(null); }} disabled={!divisionId}>
        <option value="">জেলা</option>
        {districts?.map((d) => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
      </Select>
      <Select value={value || ""} onChange={(e) => onChange(Number(e.target.value) || null)} disabled={!districtId}>
        <option value="">উপজেলা</option>
        {upazilas?.map((u) => <option key={u.id} value={u.id}>{u.name_bn}</option>)}
      </Select>
    </div>
  );
}