import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) { return clsx(inputs); }

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export const STATUS_LABELS_BN: Record<string, string> = {
  open: "খোলা", accepted: "গ্রহণ করা হয়েছে", inprogress: "চলমান", resolved: "সমাধান হয়েছে", closed: "বন্ধ",
  pending: "অপেক্ষমান", active: "সক্রিয়", suspended: "স্থগিত",
  draft: "খসড়া", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত",
  normal: "স্বাভাবিক", urgent: "জরুরি", emergency: "অতি জরুরি",
  info: "তথ্য", serial: "সিরিয়াল", accommodation: "থাকার ব্যবস্থা", ambulance: "অ্যাম্বুলেন্স", blood: "রক্ত",
  success_story: "সফলতার গল্প", health_info: "স্বাস্থ্য তথ্য", area_report: "এলাকার প্রতিবেদন",
};

export const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700", accepted: "bg-amber-100 text-amber-700",
  inprogress: "bg-amber-100 text-amber-700", resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600", pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700", suspended: "bg-rust-100 text-rust-700",
  draft: "bg-slate-100 text-slate-600", approved: "bg-green-100 text-green-700",
  rejected: "bg-rust-100 text-rust-700", normal: "bg-slate-100 text-slate-600",
  urgent: "bg-amber-100 text-amber-700", emergency: "bg-rust-100 text-rust-700",
};
