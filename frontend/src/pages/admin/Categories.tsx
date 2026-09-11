import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/api/content";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CategoryTree from "@/components/CategoryTree";

export default function AdminCategories() {
  const qc = useQueryClient();
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });

  const create = useMutation({
    mutationFn: () => contentApi.createCategory(nameBn, nameEn, parentId || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setNameBn(""); setNameEn(""); setParentId(null); },
  });
  const remove = useMutation({
    mutationFn: (id: number) => contentApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-brand-800">ক্যাটাগরি ব্যবস্থাপনা</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-brand-800">নতুন ক্যাটাগরি/সাব-ক্যাটাগরি যোগ করো</h2>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input" placeholder="নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} required />
          <input className="input" placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          {categories && (
            <div>
              <label className="label">প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক — না দিলে top-level হবে)</label>
              <CategoryTree categories={categories} value={parentId} onChange={setParentId} />
            </div>
          )}
          <Button type="submit" loading={create.isPending}>যোগ করো</Button>
        </form>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-brand-800">সব ক্যাটাগরি</h2>
        <div className="space-y-2">
          {categories?.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <span className="text-sm">{c.parent_id ? "— " : ""}{c.name_bn} <span className="text-xs text-slate-400">({c.name_en})</span></span>
              <Button variant="danger" onClick={() => remove.mutate(c.id)}>মুছো</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}