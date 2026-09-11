import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { contentApi } from "@/api/content";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CategoryTree from "@/components/CategoryTree";

export default function CategoryEditPage() {
  const { id } = useParams();
  const categoryId = Number(id);
  const navigate = useNavigate();

  const { data: category, isLoading } = useQuery({ queryKey: ["category", categoryId], queryFn: () => contentApi.getCategory(categoryId) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });

  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (category) {
      setNameBn(category.name_bn);
      setNameEn(category.name_en);
      setParentId(category.parent_id);
    }
  }, [category]);

  const update = useMutation({
    mutationFn: () => contentApi.updateCategory(categoryId, { name_bn: nameBn, name_en: nameEn, parent_id: parentId }),
    onSuccess: () => navigate("/app/admin/categories"),
  });

  if (isLoading) return null;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-brand-800">ক্যাটাগরি সম্পাদনা</h1>
      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input className="input" value={nameBn} onChange={(e) => setNameBn(e.target.value)} required />
          <input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          {categories && (
            <div>
              <label className="label">প্যারেন্ট</label>
              <CategoryTree categories={categories.filter((c) => c.id !== categoryId)} value={parentId} onChange={setParentId} />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={update.isPending}>সেভ করো</Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/app/admin/categories")}>বাতিল</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}