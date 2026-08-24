import { api } from "./client";
import type { ArticlePublicOut, ArticleOut, ArticleCreatePayload, ArticleUpdatePayload, ArticleStatus, ArticleType } from "@/types";

export const articlesApi = {
  list: (params?: { type?: ArticleType; page?: number; page_size?: number }) => api.get<ArticlePublicOut[]>("/articles", { params }).then((r) => r.data),
  detail: (id: number) => api.get<ArticlePublicOut>(`/articles/${id}`).then((r) => r.data),
  create: (payload: ArticleCreatePayload) => api.post<ArticleOut>("/volunteer/articles", payload).then((r) => r.data),
  mine: () => api.get<ArticleOut[]>("/volunteer/articles").then((r) => r.data),
  update: (id: number, payload: ArticleUpdatePayload) => api.patch<ArticleOut>(`/volunteer/articles/${id}`, payload).then((r) => r.data),
  forReview: (status?: ArticleStatus) => api.get<ArticleOut[]>("/director/articles", { params: status ? { status } : {} }).then((r) => r.data),
  approve: (id: number) => api.patch<ArticleOut>(`/director/articles/${id}/approve`).then((r) => r.data),
  reject: (id: number, review_note: string) => api.patch<ArticleOut>(`/director/articles/${id}/reject`, { review_note }).then((r) => r.data),
};
