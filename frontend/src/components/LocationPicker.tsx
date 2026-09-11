import { useState } from "react";
import Button from "@/components/ui/Button";

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("তোমার ব্রাউজার লোকেশন সাপোর্ট করে না");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      () => {
        setError("লোকেশন পাওয়া যায়নি — ম্যানুয়ালি বসাও অথবা ব্রাউজারে location permission দাও");
        setLoading(false);
      }
    );
  }

  return (
    <div>
      <label className="label">লোকেশন (ঐচ্ছিক)</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input"
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null, lng)}
        />
        <input
          className="input"
          type="number"
          step="any"
          placeholder="Longitude"
          value={lng ?? ""}
          onChange={(e) => onChange(lat, e.target.value ? Number(e.target.value) : null)}
        />
      </div>
      <Button type="button" variant="secondary" className="mt-2 text-xs" loading={loading} onClick={useCurrentLocation}>
        📍 বর্তমান লোকেশন ব্যবহার করো
      </Button>
      {error && <p className="mt-1 text-xs text-rust-600">{error}</p>}
      {lat && lng && (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-brand-600 hover:underline"
        >
          Google Maps-এ দেখো →
        </a>
      )}
    </div>
  );
}