import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { articlesApi } from "@/api/articles";
import type { ArticleType } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";

export default function ArticleCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ArticleType>("success_story");

  const create = useMutation({
    mutationFn: () => articlesApi.create({ title, body: "<p></p>", type }),
    onSuccess: (article) => navigate(`/app/volunteer/articles/${article.id}/edit`),
  });

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold text-brand-800">নতুন আর্টিকেল</h1>
      <Card className="mt-4">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input" placeholder="শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} />
          <Select value={type} onChange={(e) => setType(e.target.value as ArticleType)}>
            <option value="success_story">সফলতার গল্প</option>
            <option value="health_info">স্বাস্থ্য তথ্য</option>
            <option value="area_report">এলাকার প্রতিবেদন</option>
          </Select>
          <Button type="submit" loading={create.isPending}>শুরু করো →</Button>
        </form>
      </Card>
    </div>
  );
}