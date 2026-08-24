"""
Initial seeder — Laravel `php artisan migrate --seed` এর সমতুল্য।
রান করার নিয়ম (docker চলা অবস্থায়):
    docker compose exec api python scripts/seed.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.geo import District, Division, Upazila
from app.models.badge import Badge
from app.models.emergency import Ambulance, VehicleOwnerType
from app.models.hospital import Hospital, HospitalType
from app.models.rbac import Permission, Role
from app.models.symptom import Specialty, Symptom, SymptomSpecialty
from app.models.user import User, UserStatus

# রংপুর বিভাগের ৮ জেলা (ডকুমেন্টের Seeder Data অনুযায়ী)
RANGPUR_DISTRICTS_BN = [
    "রংপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট",
    "নীলফামারী", "ঠাকুরগাঁও", "দিনাজপুর", "পঞ্চগড়",
]
RANGPUR_DISTRICTS_EN = [
    "Rangpur", "Gaibandha", "Kurigram", "Lalmonirhat",
    "Nilphamari", "Thakurgaon", "Dinajpur", "Panchagarh",
]

ROLES = ["super_admin", "director", "volunteer", "user"]

PERMISSIONS = [
    "help_request.create", "help_request.accept", "help_request.resolve",
    "article.create", "article.approve", "article.reject",
    "volunteer.approve", "volunteer.reject",
    "hospital.manage", "analytics.view", "certificate.issue",
]

ROLE_PERMISSIONS = {
    "super_admin": PERMISSIONS,  # সব permission
    "director": [
        "volunteer.approve", "volunteer.reject", "article.approve",
        "article.reject", "analytics.view", "certificate.issue",
    ],
    "volunteer": ["help_request.accept", "help_request.resolve", "article.create"],
    "user": ["help_request.create"],
}


def seed():
    db = SessionLocal()
    try:
        # 1. Geo: Division + Districts
        division = db.scalar(select(Division).where(Division.name_en == "Rangpur"))
        if not division:
            division = Division(name_bn="রংপুর", name_en="Rangpur")
            db.add(division)
            db.flush()
            print(f"✓ Division created: {division.name_en}")

        for bn, en in zip(RANGPUR_DISTRICTS_BN, RANGPUR_DISTRICTS_EN):
            exists = db.scalar(select(District).where(District.name_en == en))
            if not exists:
                db.add(District(division_id=division.id, name_bn=bn, name_en=en))
        db.flush()
        print(f"✓ {len(RANGPUR_DISTRICTS_EN)} districts ensured under Rangpur division")

        # 1b. একটা নমুনা উপজেলা + হাসপাতাল (Hospital module টেস্ট করার জন্য)
        rangpur_district = db.scalar(select(District).where(District.name_en == "Rangpur"))
        sadar = db.scalar(select(Upazila).where(Upazila.name_en == "Rangpur Sadar"))
        if not sadar:
            sadar = Upazila(district_id=rangpur_district.id, name_bn="রংপুর সদর", name_en="Rangpur Sadar")
            db.add(sadar)
            db.flush()
            print("✓ Sample upazila created: Rangpur Sadar")

        sample_hospital = db.scalar(select(Hospital).where(Hospital.name_en == "Rangpur Medical College Hospital"))
        if not sample_hospital:
            db.add(
                Hospital(
                    upazila_id=sadar.id,
                    name_bn="রংপুর মেডিকেল কলেজ হাসপাতাল",
                    name_en="Rangpur Medical College Hospital",
                    type=HospitalType.govt,
                    bed_count=1000,
                    emergency_available=True,
                    contact_phone="0521-63020",
                    address="Rangpur Sadar, Rangpur",
                )
            )
            db.flush()
            print("✓ Sample hospital created: Rangpur Medical College Hospital")

        # 1c. নমুনা Specialty + Symptom + mapping (M3 Symptom Checker টেস্ট করার জন্য)
        specialty_names = [
            ("কার্ডিওলজি", "Cardiology"),
            ("মেডিসিন", "Medicine"),
            ("গাইনি", "Gynecology"),
            ("শিশু রোগ", "Pediatrics"),
        ]
        specialty_objs = {}
        for bn, en in specialty_names:
            sp = db.scalar(select(Specialty).where(Specialty.name_en == en))
            if not sp:
                sp = Specialty(name_bn=bn, name_en=en)
                db.add(sp)
                db.flush()
            specialty_objs[en] = sp

        symptom_specialty_weights = {
            ("বুকে ব্যথা", "Chest pain"): {"Cardiology": 5, "Medicine": 1},
            ("জ্বর", "Fever"): {"Medicine": 3, "Pediatrics": 2},
            ("পেটে ব্যথা (গর্ভাবস্থায়)", "Abdominal pain (pregnancy)"): {"Gynecology": 5},
            ("শ্বাসকষ্ট", "Shortness of breath"): {"Cardiology": 4, "Medicine": 2},
        }
        created_symptom_count = 0
        for (bn, en), specialty_weights in symptom_specialty_weights.items():
            symptom = db.scalar(select(Symptom).where(Symptom.name_en == en))
            if not symptom:
                symptom = Symptom(name_bn=bn, name_en=en, common_name_bn=bn)
                db.add(symptom)
                db.flush()
                created_symptom_count += 1
                for specialty_en, weight in specialty_weights.items():
                    db.add(
                        SymptomSpecialty(
                            symptom_id=symptom.id,
                            specialty_id=specialty_objs[specialty_en].id,
                            weight=weight,
                        )
                    )
        if created_symptom_count:
            db.flush()
            print(f"✓ {len(specialty_names)} specialties + {created_symptom_count} sample symptoms created")

        # 1d. নমুনা Ambulance (M5 টেস্ট করার জন্য)
        sample_ambulances = [
            ("করিম উদ্দিন", "01711000001", VehicleOwnerType.govt, 10.0, False),
            ("রহিম মিয়া", "01711000002", VehicleOwnerType.private, 18.0, True),
        ]
        created_ambulance_count = 0
        for driver_name, phone, vtype, fare, ac in sample_ambulances:
            exists = db.scalar(select(Ambulance).where(Ambulance.contact_phone == phone))
            if not exists:
                db.add(
                    Ambulance(
                        upazila_id=sadar.id,
                        driver_name=driver_name,
                        contact_phone=phone,
                        type=vtype,
                        availability_status=True,
                        fare_per_km=fare,
                        ac_available=ac,
                    )
                )
                created_ambulance_count += 1
        if created_ambulance_count:
            db.flush()
            print(f"✓ {created_ambulance_count} sample ambulances created")

        # 1e. Badge tier definitions (M7 — BadgeService.checkAndAward()-এর থ্রেশহোল্ড অনুযায়ী)
        badge_tiers = [
            ("New Companion", "নতুন সাথী", 5, "প্রথম ৫টি সহায়তা সম্পন্ন করার জন্য"),
            ("Silver Helper", "সিলভার হেল্পার", 25, "২৫টি সহায়তা সম্পন্ন করার জন্য"),
            ("Golden Volunteer", "গোল্ডেন ভলান্টিয়ার", 100, "১০০টি সহায়তা সম্পন্ন করার জন্য"),
            ("Health Hero", "হেলথ হিরো", 500, "৫০০টি সহায়তা সম্পন্ন করার জন্য"),
        ]
        created_badge_count = 0
        for name, name_bn, threshold, description in badge_tiers:
            exists = db.scalar(select(Badge).where(Badge.name == name))
            if not exists:
                db.add(
                    Badge(
                        name=name,
                        name_bn=name_bn,
                        criteria_type="assistance_count",
                        criteria_value=threshold,
                        description=description,
                    )
                )
                created_badge_count += 1
        if created_badge_count:
            db.flush()
            print(f"✓ {created_badge_count} badge tiers created")

        # 2. Permissions
        perm_objs = {}
        for name in PERMISSIONS:
            perm = db.scalar(select(Permission).where(Permission.name == name))
            if not perm:
                perm = Permission(name=name)
                db.add(perm)
                db.flush()
            perm_objs[name] = perm
        print(f"✓ {len(PERMISSIONS)} permissions ensured")

        # 3. Roles + attach permissions
        role_objs = {}
        for name in ROLES:
            role = db.scalar(select(Role).where(Role.name == name))
            if not role:
                role = Role(name=name)
                db.add(role)
                db.flush()
            role.permissions = [perm_objs[p] for p in ROLE_PERMISSIONS.get(name, [])]
            role_objs[name] = role
        db.flush()
        print(f"✓ {len(ROLES)} roles ensured (super_admin, director, volunteer, user)")

        # 4. Super Admin account
        admin = db.scalar(select(User).where(User.phone == "01700000000"))
        if not admin:
            admin = User(
                name="Super Admin",
                phone="01700000000",
                email="admin@poribarhealth.org",
                password_hash=hash_password("ChangeMe123!"),
                status=UserStatus.active,
            )
            admin.roles.append(role_objs["super_admin"])
            db.add(admin)
            print("✓ Super Admin created — phone: 01700000000 / password: ChangeMe123!  (এখনই পাসওয়ার্ড বদলাও)")

       # 5. নমুনা Director account (M6 director approval workflow, M8 director analytics টেস্ট করার জন্য)
        director = db.scalar(select(User).where(User.phone == "01700000001"))
        if not director:
            director = User(
                name="Sample Director",
                phone="01700000001",
                email="director@poribarhealth.org",
                password_hash=hash_password("ChangeMe123!"),
                status=UserStatus.active,
                upazila_id=sadar.id,  # director/analytics endpoint এই upazila_id দিয়ে scope করে
            )
            director.roles.append(role_objs["director"])
            db.add(director)
            print("✓ Sample Director created — phone: 01700000001 / password: ChangeMe123!")

        db.commit()
        print("\n✅ Seeding complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()