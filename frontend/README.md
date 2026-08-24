# Poribar Health — React Frontend (Starting Scaffold)

FastAPI ব্যাকএন্ডের জন্য React frontend-এর স্টার্টিং পয়েন্ট। **Core infrastructure সম্পূর্ণ ও টেস্ট করা** (`npm run build` সফল হয়েছে), বাকি ফিচার-পেজ module ধরে ধরে বানানো হবে।

## Tech Stack
- **Vite + React + TypeScript** — build tool + framework
- **React Router v6** — routing, role-based guard সহ
- **TanStack Query (React Query)** — server state (API caching, loading/error handling)
- **Zustand** — client state (auth: token, user, persist করা localStorage-এ)
- **Axios** — HTTP client, auto token attach + auto refresh-on-401
- **Tailwind CSS** — স্টাইলিং, brand color (green) preconfigured

## যা সম্পূর্ণ ও কাজ করছে ✅

| অংশ | ফাইল | অবস্থা |
|---|---|---|
| Type definitions | `src/types/index.ts` | ব্যাকএন্ডের সব schema (৪৭+ endpoint) অনুযায়ী সম্পূর্ণ |
| API client (axios + interceptor) | `src/api/client.ts` | token attach, 401-এ auto-refresh, PDF download helper |
| API modules (সব ১০ মডিউল) | `src/api/*.ts` | auth, geo, hospitals, symptoms, helpRequests, emergency, articles, volunteers, admin, notifications, recognition — প্রতিটা backend endpoint-এর জন্য typed ফাংশন রেডি |
| Auth state | `src/store/authStore.ts` | login/logout/hasRole, localStorage-এ persist |
| Route guards | `src/routes/*.tsx` | ProtectedRoute (লগইন লাগবে), RoleRoute (নির্দিষ্ট role লাগবে) |
| Layouts | `src/layouts/*.tsx` | PublicLayout (nav+footer), AppLayout (sidebar, role-aware menu) |
| UI kit | `src/components/ui/*.tsx` | Button, Card, Input, Select, Badge, Spinner, EmptyState |
| Notification bell | `src/components/NotificationBell.tsx` | কাজ করা অবস্থায় — unread count, mark as read |
| পূর্ণাঙ্গ পেজ (প্যাটার্ন হিসেবে) | Home, Login, Register, VolunteerRegister, HospitalSearch, HospitalDetail, MyHelpRequests | সরাসরি ব্যবহারযোগ্য, বাকি পেজের জন্য টেমপ্লেট |
| Routing | `src/App.tsx` | সব ৪৭+ endpoint-এর জন্য route বসানো আছে (বাকিগুলো `Placeholder` কম্পোনেন্ট দিয়ে) |

## যা এখনো বাকি (module ধরে ধরে বানানোর জন্য)

`src/App.tsx`-এ যেসব route-এ `<Placeholder title="..." />` বসানো আছে, সেগুলোই বাকি — routing/layout/guard আগে থেকেই ঠিক আছে, শুধু আসল পেজ কম্পোনেন্ট লেখা বাকি:

- Symptom Checker, Ambulance list, Blood donor search, Articles list/detail, Volunteer public profile
- Volunteer: Dashboard, Request list/detail (accept/update/resolve), Assistance log, Article editor
- Director: Volunteer approval, Article review, Analytics, Awards/Reference letters
- Admin: Dashboard, Hospital management, Volunteer list, Reports

**প্যাটার্ন অনুসরণ করবে** — `src/pages/user/MyHelpRequests.tsx` দেখো, এটাই সম্পূর্ণ reference (create + list, `useQuery`/`useMutation`, `@/api/*` থেকে ডেটা)। প্রতিটা নতুন পেজে এই একই কাঠামো:
1. `useQuery` দিয়ে `@/api/<module>.ts`-এর ফাংশন কল করে ডেটা আনা
2. দরকার হলে `useMutation` দিয়ে create/update/action
3. `@/components/ui/*` দিয়ে UI সাজানো

## চালু করার নিয়ম

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL ঠিক আছে কিনা চেক করো (ডিফল্ট: http://localhost:8000/api/v1)
npm run dev                # http://localhost:5173
```

ব্যাকএন্ড (Docker) চালু থাকতে হবে একই সময়ে — `docker compose up -d` তোমার FastAPI প্রজেক্টে।

## Production build

```bash
npm run build       # dist/ ফোল্ডারে output, TypeScript check + Vite build দুটোই চলে
npm run preview      # build করা ভার্সন লোকালি দেখতে
```

## ফোল্ডার স্ট্রাকচার

```
src/
├── api/            প্রতিটা backend module-এর জন্য একটা ফাইল (typed axios calls)
├── types/          সব TypeScript interface (backend schema-র সাথে মেলানো)
├── store/          Zustand — শুধু auth state
├── routes/         ProtectedRoute, RoleRoute (guard)
├── layouts/        PublicLayout, AppLayout (sidebar)
├── components/ui/  Reusable UI kit
├── pages/
│   ├── public/      লগইন ছাড়া দেখা যায়
│   ├── user/         যেকোনো লগইন করা ইউজার
│   ├── volunteer/    role: volunteer
│   ├── director/     role: director/super_admin
│   └── admin/        role: super_admin
├── lib/utils.ts     helper (cn, formatDate, status label/color map)
└── App.tsx          সব route এখানে wire করা
```

## নতুন পেজ যোগ করার ৩ ধাপ

১. `src/pages/<role>/<Name>.tsx` বানাও (MyHelpRequests.tsx প্যাটার্ন অনুসরণ করে)
২. `src/App.tsx`-এ সেই route-এর `<Placeholder .../>` বদলে নতুন কম্পোনেন্ট বসাও
৩. দরকার হলে `src/layouts/AppLayout.tsx`-এ sidebar-এ লিংক যোগ করো

এই কাঠামোটাই "scalable" রাখার মূল কারণ — প্রতিটা নতুন ফিচার এই একই ৩ ধাপে যোগ হবে, পুরো প্রজেক্ট জুড়ে একই প্যাটার্ন।
