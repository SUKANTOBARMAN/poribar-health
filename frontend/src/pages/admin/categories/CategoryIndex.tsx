import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/api/content";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CategoryIndex() {
  const qc = useQueryClient();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories });
  const remove = useMutation({
    mutationFn: (id: number) => contentApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  function getName(id: number | null) {
    return categories?.find((c) => c.id === id)?.name_bn || "—";
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-800">ক্যাটাগরি ব্যবস্থাপনা</h1>
        <Link to="/app/admin/categories/create" className="btn btn-primary text-xs">+ নতুন ক্যাটাগরি</Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2">নাম (বাংলা)</th>
              <th className="px-4 py-2">Name (English)</th>
              <th className="px-4 py-2">প্যারেন্ট</th>
              <th className="px-4 py-2 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{c.name_bn}</td>
                <td className="px-4 py-2 text-slate-500">{c.name_en}</td>
                <td className="px-4 py-2 text-slate-500">{getName(c.parent_id)}</td>
                <td className="px-4 py-2 text-right">
                  <Link to={`/app/admin/categories/${c.id}/edit`} className="mr-3 text-xs text-brand-600 hover:underline">সম্পাদনা</Link>
                  <button onClick={() => remove.mutate(c.id)} className="text-xs text-rust-600 hover:underline">মুছো</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories?.length === 0 && <p className="p-4 text-sm text-slate-400">কোনো ক্যাটাগরি নেই</p>}
      </div>
    </div>
  );
}