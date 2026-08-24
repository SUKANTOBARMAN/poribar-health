import { STATUS_LABELS_BN, STATUS_COLORS, cn } from "@/lib/utils";
export default function StatusBadge({ status }: { status: string }) {
  return <span className={cn("badge", STATUS_COLORS[status] || "bg-slate-100 text-slate-600")}>{STATUS_LABELS_BN[status] || status}</span>;
}
