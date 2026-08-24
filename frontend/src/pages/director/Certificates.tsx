import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { volunteersApi } from "@/api/volunteers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import VolunteerPicker from "@/components/VolunteerPicker";

export default function DirectorCertificates() {
  const [volunteerId, setVolunteerId] = useState<number | null>(null);
  const [volunteerName, setVolunteerName] = useState("");
  const [type, setType] = useState("appreciation");

  const issue = useMutation({
    mutationFn: () => volunteersApi.issueCertificate(volunteerId!, type),
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-brand-800">সার্টিফিকেট ইস্যু করো</h1>

      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); issue.mutate(); }} className="space-y-3">
          <VolunteerPicker value={volunteerId} onChange={(id, name) => { setVolunteerId(id); setVolunteerName(name); }} />
          <Select label="ধরন" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="appreciation">স্বীকৃতি সনদ</option>
            <option value="annual_service">বার্ষিক সেবা সনদ</option>
          </Select>
          <Button type="submit" loading={issue.isPending} disabled={!volunteerId}>ইস্যু করো</Button>
        </form>
      </Card>

      {issue.data && (
        <Card className="mt-4 border-brand-300 bg-brand-50">
          <p className="text-sm font-medium text-brand-800">✓ {volunteerName}-এর জন্য ইস্যু হয়েছে</p>
          <p className="mt-2 text-xs text-slate-600">এই token শেয়ার করো:</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-white p-2 text-xs">{issue.data.token}</code>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(issue.data!.token)}>কপি</Button>
          </div>
        </Card>
      )}
    </div>
  );
}