import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { ArticleCreatePayload, ArticleType } from "@/types";
import Card from "@/components/ui/Card";

export default function NewArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ArticleCreatePayload>({
    title: "",
    body: "",
    type: "health_info",
    patient_consent: false,
    patient_name_hidden: true,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (payload: ArticleCreatePayload) => api.post("/volunteer/articles", payload),
    onSuccess: () => {
      navigate("/volunteer/articles");
    },
  });

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-800">নতুন আর্টিকেল লিখুন</h1>
        <p className="text-sm text-slate-500">স্বাস্থ্য সচেতনতা বা সফলতার গল্প রিভিউর জন্য জমা দিন</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700">শিরোনাম (Title):</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="আর্টিকেলের শিরোনাম লিখুন..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block font-medium text-slate-700">ধরন (Type):</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ArticleType })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
              >
                <option value="health_info">স্বাস্থ্য সচেতনতা (Health Info)</option>
                <option value="success_story">সফলতার গল্প (Success Story)</option>
                <option value="area_report">এলাকা ভিত্তিক রিপোর্ট (Area Report)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700">ট্যাগ (Tags):</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="যেমন: রক্তদান"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] text-brand-700"
                >
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-rose-500 font-bold">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700">মূল বক্তব্য (Body):</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={8}
              placeholder="বিস্তারিত বিবরণ লিখুন..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={formData.patient_consent}
                onChange={(e) => setFormData({ ...formData, patient_consent: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              রোগীর থেকে গল্প শেয়ার করার অনুমতি নেওয়া হয়েছে
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={formData.patient_name_hidden}
                onChange={(e) => setFormData({ ...formData, patient_name_hidden: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              রোগীর নাম ও পরিচয় গোপনে রাখা হবে
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
            >
              {createMutation.isPending ? "জমা হচ্ছে..." : "রিভিউর জন্য জমা দিন"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}