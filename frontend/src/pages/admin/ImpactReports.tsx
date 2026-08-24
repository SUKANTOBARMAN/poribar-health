import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function ImpactReports() {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number | undefined>(7);

  const { data: report, isLoading } = useQuery({
    queryKey: ["impact-report", year, month],
    queryFn: () => adminApi.impactReport(year, month),
  });

  const handleExport = () => {
    adminApi.exportReportPdf(year, month);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">ইমপ্যাক্ট রিপোর্ট</h1>
          <p className="text-sm text-slate-500">নির্দিষ্ট সময়ের সার্বিক কার্যক্রম ও অগ্রগতি পর্যালোচনা</p>
        </div>
        <button onClick={handleExport} className="btn btn-primary text-xs flex items-center gap-2">
          📄 PDF এক্সপোর্ট করুন
        </button>
      </div>

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <label>বছর:</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-2 py-1 outline-none"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label>মাস:</label>
            <select
              value={month || ""}
              onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-md border border-slate-300 px-2 py-1 outline-none"
            >
              <option value="">সব মাস (বার্ষিক)</option>
              <option value={1}>জানুয়ারি</option>
              <option value={2}>ফেব্রুয়ারি</option>
              <option value={3}>মার্চ</option>
              <option value={4}>এপ্রিল</option>
              <option value={5}>মে</option>
              <option value={6}>জুন</option>
              <option value={7}>জুলাই</option>
              <option value={8}>আগস্ট</option>
              <option value={9}>সেপ্টেম্বর</option>
              <option value={10}>অক্টোবর</option>
              <option value={11}>নভেম্বর</option>
              <option value={12}>ডিসেম্বর</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading && <Spinner />}

      {!isLoading && report && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500">মোট অনুরোধ</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{report.total_help_requests}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">সমাধানকৃত</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{report.total_resolved}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">প্রকাশিত আর্টিকেল</p>
              <p className="mt-1 text-2xl font-bold text-brand-700">{report.total_articles_published}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">নতুন ভলান্টিয়ার</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{report.total_new_volunteers}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-800">অনুরোধের ক্যাটাগরি বিশ্লেষণ</h3>
              <div className="mt-4 space-y-2 text-xs">
                {Object.entries(report.requests_by_type || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="capitalize text-slate-600">{type}</span>
                    <span className="font-semibold text-slate-800">{count as number}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-800">শীর্ষ পারফরমিং ভলান্টিয়ার</h3>
              <div className="mt-4 space-y-3">
                {report.top_volunteers?.map((vol, index) => (
                  <div key={vol.user_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700">{vol.name}</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                      {vol.resolved_count} টি সমাধান
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}