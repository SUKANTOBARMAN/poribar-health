import Card from "@/components/ui/Card";

// এই কম্পোনেন্টটা শুধু routing কাঠামো সম্পূর্ণ রাখার জন্য।
// আসল ফিচার (API call + UI) module-ভিত্তিক কাজের সময় এখানে বসবে —
// ঠিক HospitalSearch.tsx বা Login.tsx-এর প্যাটার্ন অনুসরণ করে
// (useQuery/useMutation দিয়ে @/api/* থেকে ডেটা আনা, তারপর JSX-এ দেখানো)।
export default function Placeholder({ title }: { title: string }) {
  return (
    <Card className="mx-auto max-w-2xl mt-6">
      <h1 className="text-lg font-bold text-brand-800">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        এই পেজটা এখনো বানানো হয়নি — কাঠামো (route, layout, API layer) রেডি আছে,
        শুধু এই কম্পোনেন্টের ভেতরে useQuery/useMutation দিয়ে বাস্তবায়ন বাকি।
      </p>
    </Card>
  );
}
