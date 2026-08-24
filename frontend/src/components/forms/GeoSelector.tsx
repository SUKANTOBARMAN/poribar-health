import { useState, useEffect } from "react";
import { geoApi } from "@/api/geo";
import Select from "@/components/ui/Select";
import type { Division, District, Upazila } from "@/types";

export interface GeoLocation {
  division_id?: number;
  district_id?: number;
  upazila_id?: number;
}

interface GeoSelectorProps {
  onChange?: (location: GeoLocation) => void;
  error?: string;
}

export default function GeoSelector({ onChange, error }: GeoSelectorProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);

  const [selectedDiv, setSelectedDiv] = useState<number | "">("");
  const [selectedDis, setSelectedDis] = useState<number | "">("");
  const [selectedUpa, setSelectedUpa] = useState<number | "">("");

  useEffect(() => {
    geoApi.divisions().then(setDivisions).catch(console.error);
  }, []);

  const handleDivisionChange = (divId: number) => {
    setSelectedDiv(divId);
    setSelectedDis("");
    setSelectedUpa("");
    setDistricts([]);
    setUpazilas([]);

    onChange?.({
      division_id: divId || undefined,
      district_id: undefined,
      upazila_id: undefined,
    });

    if (divId) {
      geoApi.districts(divId).then(setDistricts).catch(console.error);
    }
  };

  const handleDistrictChange = (disId: number) => {
    setSelectedDis(disId);
    setSelectedUpa("");
    setUpazilas([]);

    onChange?.({
      division_id: selectedDiv ? Number(selectedDiv) : undefined,
      district_id: disId || undefined,
      upazila_id: undefined,
    });

    if (disId) {
      geoApi.upazilas(disId).then(setUpazilas).catch(console.error);
    }
  };

  const handleUpazilaChange = (upaId: number) => {
    setSelectedUpa(upaId);

    onChange?.({
      division_id: selectedDiv ? Number(selectedDiv) : undefined,
      district_id: selectedDis ? Number(selectedDis) : undefined,
      upazila_id: upaId || undefined,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* বিভাগ */}
        <Select
          label="বিভাগ"
          value={selectedDiv}
          onChange={(e) => handleDivisionChange(Number(e.target.value))}
        >
          <option value="">বিভাগ নির্বাচন করুন</option>
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>
              {div.name_bn || div.name_en}
            </option>
          ))}
        </Select>

        {/* জেলা */}
        <Select
          label="জেলা"
          value={selectedDis}
          onChange={(e) => handleDistrictChange(Number(e.target.value))}
          disabled={!selectedDiv}
        >
          <option value="">জেলা নির্বাচন করুন</option>
          {districts.map((dis) => (
            <option key={dis.id} value={dis.id}>
              {dis.name_bn || dis.name_en}
            </option>
          ))}
        </Select>

        {/* উপজেলা */}
        <Select
          label="উপজেলা"
          value={selectedUpa}
          onChange={(e) => handleUpazilaChange(Number(e.target.value))}
          disabled={!selectedDis}
        >
          <option value="">উপজেলা নির্বাচন করুন</option>
          {upazilas.map((upa) => (
            <option key={upa.id} value={upa.id}>
              {upa.name_bn || upa.name_en}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-xs text-rust-600 mt-1">{error}</p>}
    </div>
  );
}