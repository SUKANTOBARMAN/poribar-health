import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";

interface Props {
  value: number | null;
  onChange: (userId: number | null, name: string) => void;
}

// raw User ID টাইপ করার বদলে নাম লিখে সার্চ করে বেছে নেওয়া যায়
export default function VolunteerPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: volunteers } = useQuery({ queryKey: ["director-volunteers", "active"], queryFn: () => volunteersApi.directorList("active") });

  const filtered = useMemo(
    () => (volunteers || []).filter((v) => v.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [volunteers, query]
  );

  const selected = volunteers?.find((v) => v.user_id === value);

  return (
    <div className="relative">
      <input
        className="input"
        placeholder="ভলান্টিয়ারের নাম লিখে খুঁজো..."
        value={selected ? selected.name : query}
        onChange={(e) => { setQuery(e.target.value); onChange(null, ""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.map((v) => (
            <button
              key={v.user_id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-brand-50"
              onClick={() => { onChange(v.user_id, v.name); setQuery(""); setOpen(false); }}
            >
              {v.name} <span className="text-xs text-slate-400">({v.phone})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}