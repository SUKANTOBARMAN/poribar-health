import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { contentApi } from "@/api/content";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CategoryTree from "@/components/CategoryTree";

export default function CategoryCreate() {
  const navigate = useNavigate();
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });

  const create = useMutation({
    mutationFn: () => contentApi.createCategory(nameBn, nameEn, parentId || undefined),
    onSuccess: () => navigate("/app/admin/categories"),
  });

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-brand-800">নতুন ক্যাটাগরি</h1>
      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input" placeholder="নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} required />
          <input className="input" placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          {categories && (
            <div>
              <label className="label">প্যারেন্ট (ঐচ্ছিক)</label>
              <CategoryTree categories={categories} value={parentId} onChange={setParentId} />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={create.isPending}>তৈরি করো</Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/app/admin/categories")}>বাতিল</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}