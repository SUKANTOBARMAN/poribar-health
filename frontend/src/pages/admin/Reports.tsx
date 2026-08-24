import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { STATUS_LABELS_BN } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export default function AdminReports() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState<string>("");

  const { data: report, isLoading } = useQuery({
    queryKey: ["impact-report", year, month],
    queryFn: () => adminApi.impactReport(year, month ? Number(month) : undefined),
  });

  const exportPdf = useMutation({
    mutationFn: () => adminApi.exportReportPdf(year, month ? Number(month) : undefined),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-brand-800">Impact Report</h1>

      <div className="flex gap-3">
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">পুরো বছর</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m} মাস</option>)}
        </Select>
        <Button variant="secondary" loading={exportPdf.isPending} onClick={() => exportPdf.mutate()}>
          📄 PDF ডাউনলোড
        </Button>
      </div>

      {isLoading && <Spinner />}
      {report && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card><p className="text-2xl font-bold text-brand-700">{report.total_help_requests}</p><p className="text-xs text-slate-500">মোট অনুরোধ</p></Card>
            <Card><p className="text-2xl font-bold text-green-700">{report.total_resolved}</p><p className="text-xs text-slate-500">সমাধান হয়েছে</p></Card>
            <Card><p className="text-2xl font-bold text-brand-700">{report.total_articles_published}</p><p className="text-xs text-slate-500">প্রকাশিত আর্টিকেল</p></Card>
            <Card><p className="text-2xl font-bold text-brand-700">{report.total_new_volunteers}</p><p className="text-xs text-slate-500">নতুন ভলান্টিয়ার</p></Card>
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-brand-800">ধরন অনুযায়ী অনুরোধ</h2>
            <Card>
              {Object.entries(report.requests_by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                  <span className="text-sm">{STATUS_LABELS_BN[type] || type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-brand-800">শীর্ষ ভলান্টিয়ার</h2>
            <Card>
              {report.top_volunteers.map((v, i) => (
                <div key={v.user_id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                  <span className="text-sm">#{i + 1} {v.name}</span>
                  <span className="font-medium text-brand-700">{v.resolved_count} সহায়তা</span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}