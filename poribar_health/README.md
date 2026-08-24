# Poribar Health — FastAPI Backend (Starter Skeleton)

Laravel ডকুমেন্টের Phase 1 (Modules 1-10) স্পেক অনুযায়ী FastAPI + MySQL + Redis + Celery স্ট্যাক দিয়ে বানানো starter skeleton। এখানে **M1 (Auth/RBAC)** এবং **M2 (Geo hierarchy — public endpoints)** পুরোপুরি কাজ করা অবস্থায় আছে; বাকি মডিউল একই প্যাটার্ন অনুসরণ করে যোগ করবে।

## যা এখন কাজ করছে (Tested ✅)

- `POST /api/v1/auth/register` — সাধারণ ইউজার নিবন্ধন
- `POST /api/v1/auth/volunteer/register` — ভলান্টিয়ার নিবন্ধন (status=pending, Director approval দরকার)
- `POST /api/v1/auth/login` — JWT access + refresh token
- `GET /api/v1/auth/me` — current user
- `POST /api/v1/auth/refresh` — token refresh
- `GET /api/v1/geo/divisions` / `/geo/districts` / `/geo/upazilas` — public geo API
- RBAC: `require_role()`, `require_permission()` dependency (Spatie Policy-এর সমতুল্য)
- Celery worker + beat কনফিগার করা আছে (BadgeService-এর স্কেলিটন `app/jobs/badge_tasks.py`-তে)

## ১. প্রথমবার চালু করা

```bash
cp .env.example .env      # ইতিমধ্যে করা আছে, দরকার হলে SECRET_KEY বদলাও
docker compose up -d --build
```

সার্ভিস চালু হলে:
- API: http://localhost:8000
- Swagger UI (interactive API docs): http://localhost:8000/docs
- Adminer (DB browser): http://localhost:8080  (System: MySQL, Server: db, User: poribar, Pass: poribar_secret, DB: poribar_health)

## ২. মাইগ্রেশন রান করা (প্রথমবার + মডেল বদলানোর পর)

```bash
make migrate            # অথবা: docker compose exec api alembic upgrade head
```

নতুন মডেল যোগ করলে migration জেনারেট করবে:
```bash
make makemigration m="add help_requests table"
make migrate
```

## ৩. Seed ডেটা লোড করা (Rangpur বিভাগ, roles, super admin)

```bash
make seed
```
এটা তৈরি করবে:
- রংপুর বিভাগ + ৮টি জেলা
- ৪টি role (super_admin, director, volunteer, user) + permissions
- Super Admin: phone `01700000000` / password `ChangeMe123!` — **প্রথম লগইনের পরই পাসওয়ার্ড বদলাও**

## ৪. টেস্ট রান করা

```bash
make test
```
(sqlite দিয়ে isolated ভাবে চলে, dev MySQL DB touch করে না)

## ৫. পরের মডিউল যোগ করার প্যাটার্ন

প্রতিটা নতুন মডিউলের জন্য এই ধাপ অনুসরণ করো (M3, M4... একইভাবে):

1. `app/models/xxx.py` — SQLAlchemy model লিখো (ডকুমেন্টের DB Schema সেকশন দেখে)
2. `app/schemas/xxx.py` — Pydantic request/response schema
3. `app/api/v1/<role>/xxx.py` — router বানাও, প্রয়োজনে `Depends(require_role(...))` দিয়ে গার্ড করো
4. `app/api/v1/router.py`-তে নতুন router `include_router()` করো
5. `alembic revision --autogenerate` দিয়ে মাইগ্রেশন জেনারেট করো, রিভিউ করে `alembic upgrade head`
6. দরকার হলে `app/jobs/xxx_tasks.py`-তে Celery task লিখো (SMS, badge check, ইত্যাদির জন্য)

### উদাহরণ: Sprint 3 (Symptom Checker + Help Request) শুরু করতে

```bash
# 1. মডেল
touch app/models/help_request.py app/models/symptom.py
# app/models/__init__.py-তে import যোগ করো

# 2. স্কিমা + রাউট
touch app/schemas/help_request.py
mkdir -p app/api/v1/user  # already exists
touch app/api/v1/user/help_requests.py

# 3. router.py-তে include করো, migration জেনারেট করো
make makemigration m="add help_requests and symptoms tables"
make migrate
```

## ৬. Sprint Priority (ডকুমেন্ট অনুযায়ী)

| Sprint | কাজ | Status |
|---|---|---|
| 1 | DB + Auth + RBAC | ✅ এই স্কেলিটনে করা আছে |
| 2 | Geo API + Hospital/Doctor directory | Geo ✅ করা আছে, Hospital বাকি |
| 3 | Symptom Checker + Help Request | বাকি |
| 4 | Volunteer dashboard + workflow | বাকি |
| 5 | Ambulance + Blood donor | বাকি |
| 6 | Articles + Director approval | বাকি |
| 7 | Impact Profile + Badges + Certificate | বাকি (Celery task skeleton আছে) |
| 8 | Admin dashboard + Analytics + PDF export | বাকি |
| 9 | Notifications + SMS + PWA (frontend) | বাকি |
| 10 | QA + Security audit + Launch | বাকি |

## ৭. উপযুক্ত প্যাকেজ (দরকার হলে পরে যোগ করবে)

- PDF report (impact report, certificate): `weasyprint` অথবা `reportlab` — requirements.txt-এ আছে
- Excel export: `openpyxl` — আছে
- Image resize/webp (avatar, M14 PWA perf): `pillow` — আছে
- SMS gateway: Phase 1 M9 অনুযায়ী SSL Wireless-এর REST API `httpx` দিয়ে কল করবে, `app/services/sms_service.py` বানিয়ে

## Folder Structure

```
app/
├── main.py              # FastAPI entrypoint
├── config.py            # Settings (.env)
├── database.py          # SQLAlchemy engine/session
├── models/               # SQLAlchemy models
├── schemas/              # Pydantic schemas
├── core/
│   ├── security.py       # JWT + password hashing
│   └── permissions.py    # RBAC dependencies
├── api/v1/
│   ├── auth/
│   ├── public/
│   ├── user/
│   ├── volunteer/
│   ├── director/
│   └── admin/
├── services/             # Business logic (BadgeService প্যাটার্ন)
└── jobs/                 # Celery tasks
alembic/                  # migrations
scripts/seed.py           # DB seeder
tests/                    # pytest
```
