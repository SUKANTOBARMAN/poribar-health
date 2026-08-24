import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { symptomsApi } from "@/api/symptoms";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function SymptomChecker() {
  const [selected, setSelected] = useState<number[]>([]);
  const { data: symptoms, isLoading } = useQuery({ queryKey: ["symptoms"], queryFn: symptomsApi.list });

  const checkMutation = useMutation({ mutationFn: () => symptomsApi.check(selected) });

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">লক্ষণ পরীক্ষা</h1>
      <p className="mt-1 text-sm text-slate-500">তোমার লক্ষণগুলো সিলেক্ট করো, আমরা কোন বিশেষজ্ঞ বিভাগে যেতে হবে সেটা বলে দেব।</p>

      {isLoading && <Spinner />}
      <div className="mt-6 flex flex-wrap gap-2">
        {symptoms?.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selected.includes(s.id) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
            }`}
          >
            {s.name_bn}
          </button>
        ))}
      </div>

      <Button className="mt-6" disabled={selected.length === 0} loading={checkMutation.isPending} onClick={() => checkMutation.mutate()}>
        ফলাফল দেখাও
      </Button>

      {checkMutation.data && (
        <div className="mt-8 space-y-3">
          <h2 className="font-semibold text-brand-800">সাজেশন</h2>
          {checkMutation.data.suggestions.length === 0 && <p className="text-sm text-slate-500">এই লক্ষণগুলোর জন্য কোনো সাজেশন পাওয়া যায়নি।</p>}
          {checkMutation.data.suggestions.map((s, i) => (
            <Card key={s.specialty.id} className={i === 0 ? "border-brand-400 bg-brand-50" : ""}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-800">{s.specialty.name_bn}</p>
                  <p className="text-xs text-slate-500">{s.specialty.name_en}</p>
                </div>
                <span className="text-xs text-slate-400">স্কোর: {s.score}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}