import { api } from "./client";

export const documentsApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/volunteer/profile/document", form).then((r) => r.data);
    // এখানেও headers অংশটা বাদ দাও
  },
};