import { api } from "./client";

export interface CategoryOut {
  id: number;
  name_bn: string;
  name_en: string;
  parent_id: number | null;
}

export interface AlbumImageOut {
  id: number;
  media_id: number;
  order_index: number;
  caption: string | null;
  is_cover: boolean;
}

export interface AlbumItemLocal {
  media_id: number;
  url: string;
  caption: string;
  is_cover?: boolean;
}

export const contentApi = {
  categories: () => api.get<CategoryOut[]>("/categories").then((r) => r.data),
  getCategory: (id: number) => api.get<CategoryOut>(`/admin/categories/${id}`).then((r) => r.data),
  createCategory: (name_bn: string, name_en: string, parent_id?: number) =>
    api.post<CategoryOut>("/admin/categories", { name_bn, name_en, parent_id }).then((r) => r.data),
  updateCategory: (id: number, payload: { name_bn?: string; name_en?: string; parent_id?: number | null }) =>
    api.patch<CategoryOut>(`/admin/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`),

  myMedia: () => api.get<{ id: number; content_type: string }[]>("/volunteer/media").then((r) => r.data),
  uploadMedia: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ id: number; url: string }>("/volunteer/media/upload", form).then((r) => r.data);
    // headers অংশটা সম্পূর্ণ বাদ — axios FormData দেখলে নিজে থেকেই boundary-সহ সঠিক Content-Type বসিয়ে দেয়
  },

  getAlbum: (articleId: number) => api.get<AlbumImageOut[]>(`/volunteer/articles/${articleId}/album`).then((r) => r.data),
  addToAlbum: (articleId: number, mediaId: number, caption?: string) =>
    api.post<AlbumImageOut>(`/volunteer/articles/${articleId}/album`, { media_id: mediaId, caption }).then((r) => r.data),
  updateAlbumImage: (albumImageId: number, payload: { caption?: string; order_index?: number; is_cover?: boolean }) =>
    api.patch<AlbumImageOut>(`/volunteer/album/${albumImageId}`, payload).then((r) => r.data),
  removeFromAlbum: (albumImageId: number) => api.delete(`/volunteer/album/${albumImageId}`),
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
export function mediaUrl(id: number) {
  return `${API_BASE}/media/${id}`;
}