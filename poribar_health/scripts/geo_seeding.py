from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.geo import Division, District, Upazila

# Complete Embedded Geo Data
BD_GEO_DATA = [
    {
        "id": 1, "name_en": "Chattagram", "name_bn": "চট্টগ্রাম",
        "districts": [
            {"id": 101, "name_en": "Comilla", "name_bn": "কুমিল্লা", "upazilas": ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chouddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Comilla Sadar", "Meghna", "Monohargonj", "Sadar Dakshin", "Titas"]},
            {"id": 102, "name_en": "Feni", "name_bn": "ফেনী", "upazilas": ["Feni Sadar", "Daganbhuiyan", "Chhagalnaiya", "Sonsgazi", "Pashuram", "Fulgazi"]},
            {"id": 103, "name_en": "Brahmanbaria", "name_bn": "ব্রাহ্মণবাড়িয়া", "upazilas": ["Brahmanbaria Sadar", "Kasba", "Nasirnagar", "Nabinagar", "Ashuganj", "Akhaura", "Bancharampur", "Bijoynagar", "Sarail"]},
            {"id": 104, "name_en": "Rangamati", "name_bn": "রাঙ্গামাটি", "upazilas": ["Rangamati Sadar", "Kaptai", "Kawkhali", "Baghaichhari", "Barkal", "Langadu", "Rajasthali", "Belaichhari", "Juraichhari", "Naniarchar"]},
            {"id": 105, "name_en": "Noakhali", "name_bn": "নোয়াখালী", "upazilas": ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companyganj", "Hatiya", "Senbagh", "Subarnachar", "Sonaimuri", "Kabirhat"]},
            {"id": 106, "name_en": "Chandpur", "name_bn": "চাঁদপুর", "upazilas": ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"]},
            {"id": 107, "name_en": "Laxmipur", "name_bn": "লক্ষ্মীপুর", "upazilas": ["Laxmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"]},
            {"id": 108, "name_en": "Chittagong", "name_bn": "চট্টগ্রাম", "upazilas": ["Rangunia", "Sitakunda", "Mirsarai", "Patiya", "Sandeep", "Banshkhali", "Boalkhali", "Anwara", "Chandanaish", "Satkania", "Lohagara", "Hathazari", "Fatikchhari", "Raozan", "Karnafuli"]},
            {"id": 109, "name_en": "Coxsbazar", "name_bn": "কক্সবাজার", "upazilas": ["Coxsbazar Sadar", "Chakaria", "Kutubdia", "Ukhiya", "Moheshkhali", "Pekua", "Ramu", "Teknaf", "Eidgaon"]},
            {"id": 110, "name_en": "Khagrachhari", "name_bn": "খাগড়াছড়ি", "upazilas": ["Khagrachhari Sadar", "Dighinala", "Panchhari", "Laxmichhari", "Mohalchhari", "Manikchhari", "Ramgarh", "Matiranga", "Guimara"]},
            {"id": 111, "name_en": "Bandarban", "name_bn": "বান্দরবান", "upazilas": ["Bandarban Sadar", "Thanchi", "Lama", "Rowangchhari", "Ali Kadam", "Ruma", "Naikhongchhari"]}
        ]
    },
    {
        "id": 2, "name_en": "Rajshahi", "name_bn": "রাজশাহী",
        "districts": [
            {"id": 201, "name_en": "Sirajganj", "name_bn": "সিরাজগঞ্জ", "upazilas": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Rayganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"]},
            {"id": 202, "name_en": "Pabna", "name_bn": "পাবনা", "upazilas": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"]},
            {"id": 203, "name_en": "Bogra", "name_bn": "বগুড়া", "upazilas": ["Adamdighi", "Bogra Sadar", "Dhunat", "Dhupchanchia", "Gabtali", "Khabar", "Nandigram", "Sariakandi", "Sherpur", "Shibganj", "Sonatala"]},
            {"id": 204, "name_en": "Rajshahi", "name_bn": "রাজশাহী", "upazilas": ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"]},
            {"id": 205, "name_en": "Natore", "name_bn": "নাটোর", "upazilas": ["Natore Sadar", "Baraigram", "Bagatipara", "Lalpur", "Singra", "Gurudaspur", "Naldanga"]},
            {"id": 206, "name_en": "Joypurhat", "name_bn": "জয়পুরহাট", "upazilas": ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"]},
            {"id": 207, "name_en": "Chapainawabganj", "name_bn": "চাঁপাইনবাবগঞ্জ", "upazilas": ["Chapainawabganj Sadar", "Gomastapur", "Jhalokati", "Nachole", "Shibganj"]},
            {"id": 208, "name_en": "Naogaon", "name_bn": "নওগাঁ", "upazilas": ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Niamatpur", "Patnitala", "Raninagar", "Sapahar", "Mohadevpur", "Porsha"]}
        ]
    },
    {
        "id": 3, "name_en": "Khulna", "name_bn": "খুলনা",
        "districts": [
            {"id": 301, "name_en": "Jessore", "name_bn": "যশোর", "upazilas": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jessore Sadar", "Manirampur", "Sharsha"]},
            {"id": 302, "name_en": "Satkhira", "name_bn": "সাতক্ষীরা", "upazilas": ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"]},
            {"id": 303, "name_en": "Meherpur", "name_bn": "মেহেরপুর", "upazilas": ["Meherpur Sadar", "Gangni", "Mujibnagar"]},
            {"id": 304, "name_en": "Narail", "name_bn": "নড়াইল", "upazilas": ["Narail Sadar", "Lohagara", "Kalia"]},
            {"id": 305, "name_en": "Chuadanga", "name_bn": "চুয়াডাঙ্গা", "upazilas": ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"]},
            {"id": 306, "name_en": "Kushtia", "name_bn": "কুষ্টিয়া", "upazilas": ["Kushtia Sadar", "Kumarkhali", "Daulatpur", "Mirpur", "Bheramara", "Khoksa"]},
            {"id": 307, "name_en": "Magura", "name_bn": "মাগুরা", "upazilas": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"]},
            {"id": 308, "name_en": "Khulna", "name_bn": "খুলনা", "upazilas": ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"]},
            {"id": 309, "name_en": "Bagerhat", "name_bn": "বাগেরহাট", "upazilas": ["Bagerhat Sadar", "Mongla", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Rampal", "Sarankhola", "Morrelganj"]},
            {"id": 310, "name_en": "Jhenaidah", "name_bn": "ঝিনাইদহ", "upazilas": ["Jhenaidah Sadar", "Maheshpur", "Kaliganj", "Kotchandpur", "Shailkupa", "Harinakunda"]}
        ]
    },
    {
        "id": 4, "name_en": "Barisal", "name_bn": "বরিশাল",
        "districts": [
            {"id": 401, "name_en": "Jhalokati", "name_bn": "ঝালকাঠি", "upazilas": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"]},
            {"id": 402, "name_en": "Patuakhali", "name_bn": "পটুয়াখালী", "upazilas": ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"]},
            {"id": 403, "name_en": "Pirojpur", "name_bn": "পিরোজপুর", "upazilas": ["Pirojpur Sadar", "Bhandaria", "Mathbaria", "Nazirpur", "Nesarabad", "Kawkhali", "Zianagar"]},
            {"id": 404, "name_en": "Barisal", "name_bn": "বরিশাল", "upazilas": ["Barisal Sadar", "Bakerganj", "Babuganj", "Wazirpur", "Banaripara", "Gournadi", "Agailjhara", "Mehendiganj", "Muladi", "Hizla"]},
            {"id": 405, "name_en": "Bhola", "name_bn": "ভোলা", "upazilas": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"]},
            {"id": 406, "name_en": "Barguna", "name_bn": "বরগুনা", "upazilas": ["Barguna Sadar", "Amtali", "Bamotna", "Betagi", "Patharghata", "Taltali"]}
        ]
    },
    {
        "id": 5, "name_en": "Sylhet", "name_bn": "সিলেট",
        "districts": [
            {"id": 501, "name_en": "Sylhet", "name_bn": "সিলেট", "upazilas": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj", "South Surma", "Osmaninagar"]},
            {"id": 502, "name_en": "Moulvibazar", "name_bn": "মৌলভীবাজার", "upazilas": ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"]},
            {"id": 503, "name_en": "Habiganj", "name_bn": "হবিগঞ্জ", "upazilas": ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachang", "Chunarughat", "Nabiganj", "Madhabpur", "Lakhai", "Shayestaganj"]},
            {"id": 504, "name_en": "Sunamganj", "name_bn": "সুনামগঞ্জ", "upazilas": ["Sunamganj Sadar", "Bishwamambharpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur", "Shantiganj"]}
        ]
    },
    {
        "id": 6, "name_en": "Dhaka", "name_bn": "ঢাকা",
        "districts": [
            {"id": 601, "name_en": "Narsingdi", "name_bn": "নরসিংদী", "upazilas": ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"]},
            {"id": 602, "name_en": "Gazipur", "name_bn": "গাজীপুর", "upazilas": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"]},
            {"id": 603, "name_en": "Shariatpur", "name_bn": "শরীয়তপুর", "upazilas": ["Shariatpur Sadar", "Naria", "Zajira", "Gosairhat", "Bhedarganj", "Damudya"]},
            {"id": 604, "name_en": "Narayanganj", "name_bn": "নারায়াণগঞ্জ", "upazilas": ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"]},
            {"id": 605, "name_en": "Tangail", "name_bn": "টাঙ্গাইল", "upazilas": ["Tangail Sadar", "Sakhipur", "Basail", "Madhupur", "Ghatail", "Kalihati", "Nagarpur", "Mirzapur", "Gopalpur", "Delduar", "Bhuapur", "Dhanbari"]},
            {"id": 606, "name_en": "Kishoreganj", "name_bn": "কিশোরগঞ্জ", "upazilas": ["Kishoreganj Sadar", "Itna", "Katiadi", "Bhairab", "Tarail", "Hossainpur", "Pakundia", "Kuliarchar", "Kishoreganj", "Nikli", "Austagram", "Mithamain", "Karimganj"]},
            {"id": 607, "name_en": "Manikganj", "name_bn": "মানিকগঞ্জ", "upazilas": ["Manikganj Sadar", "Singair", "Shivalaya", "Saturia", "Harirampur", "Gheor", "Daulatpur"]},
            {"id": 608, "name_en": "Dhaka", "name_bn": "ঢাকা", "upazilas": ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"]},
            {"id": 609, "name_en": "Munshiganj", "name_bn": "মুন্সিগঞ্জ", "upazilas": ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajang", "Garia", "Tongibari"]},
            {"id": 610, "name_en": "Rajbari", "name_bn": "রাজবাড়ী", "upazilas": ["Rajbari Sadar", "Pangsha", "Kalukhali", "Baliakandi", "Goalanda"]},
            {"id": 611, "name_en": "Madaripur", "name_bn": "মাদারীপুর", "upazilas": ["Madaripur Sadar", "Shibchar", "Kalkini", "Rajoir"]},
            {"id": 612, "name_en": "Gopalganj", "name_bn": "গোপালগঞ্জ", "upazilas": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]},
            {"id": 613, "name_en": "Faridpur", "name_bn": "ফরিদপুর", "upazilas": ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Modhukhali", "Nagarkanda", "Sadarpur", "Saltha"]}
        ]
    },
    {
        "id": 7, "name_en": "Rangpur", "name_bn": "রংপুর",
        "districts": [
            {"id": 701, "name_en": "Panchagarh", "name_bn": "পঞ্চগড়", "upazilas": ["Panchagarh Sadar", "Debiganj", "Boda", "Atwari", "Tetulia"]},
            {"id": 702, "name_en": "Dinajpur", "name_bn": "দিনাজপুর", "upazilas": ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"]},
            {"id": 703, "name_en": "Lalmonirhat", "name_bn": "লালমনিরহাট", "upazilas": ["Lalmonirhat Sadar", "Aditmari", "Kaliganj", "Hatibandha", "Patgram"]},
            {"id": 704, "name_en": "Nilphamari", "name_bn": "নীলফামারী", "upazilas": ["Nilphamari Sadar", "Saidpur", "Jaldhaka", "Kishoreganj", "Domar", "Dimla"]},
            {"id": 705, "name_en": "Gaibandha", "name_bn": "গাইবান্ধা", "upazilas": ["Gaibandha Sadar", "Sadullapur", "Gobindaganj", "Sundarganj", "Saghata", "Palashbari", "Phulchhari"]},
            {"id": 706, "name_en": "Thakurgaon", "name_bn": "ঠাকুরগাঁও", "upazilas": ["Thakurgaon Sadar", "Pirganj", "Ranisankail", "Haripur", "Baliadangi"]},
            {"id": 707, "name_en": "Rangpur", "name_bn": "রংপুর", "upazilas": ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"]},
            {"id": 708, "name_en": "Kurigram", "name_bn": "কুড়িগ্রাম", "upazilas": ["Kurigram Sadar", "Nageshwari", "Bhurungamari", "Phulbari", "Rajarhat", "Ulipur", "Chilmari", "Rowmari", "Char Rajibpur"]}
        ]
    },
    {
        "id": 8, "name_en": "Mymensingh", "name_bn": "ময়মনসিংহ",
        "districts": [
            {"id": 801, "name_en": "Sherpur", "name_bn": "শেরপুর", "upazilas": ["Sherpur Sadar", "Nalitabari", "Sreebardi", "Nakla", "Jhenaigati"]},
            {"id": 802, "name_en": "Mymensingh", "name_bn": "ময়মনসিংহ", "upazilas": ["Mymensingh Sadar", "Bhaluka", "Trishal", "Haluaghat", "Muktagachha", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Ishwarganj", "Nandail", "Phulpur", "TaraKanda"]},
            {"id": 803, "name_en": "Jamalpur", "name_bn": "জামালপুর", "upazilas": ["Jamalpur Sadar", "Melandahn", "Islampur", "Dewanganj", "Sarishabari", "Madarganj", "Baksiganj"]},
            {"id": 804, "name_en": "Netrokona", "name_bn": "নেত্রকোণা", "upazilas": ["Netrokona Sadar", "Barhatta", "Durgapur", "Kendua", "Atpara", "Madan", "Khaliajuri", "Kalmakanda", "Mohanganj", "Purbadhala"]}
        ]
    }
]

def seed_geo_data():
    db: Session = SessionLocal()
    try:
        print("Seeding BD Geo Data (Divisions, Districts, Upazilas)...")
        
        for div in BD_GEO_DATA:
            div_id = div["id"]
            div_name_en = div["name_en"]
            div_name_bn = div["name_bn"]

            # Division Insert
            db_div = db.query(Division).filter_by(id=div_id).first()
            if not db_div:
                db_div = Division(id=div_id, name_bn=div_name_bn, name_en=div_name_en)
                db.add(db_div)
                db.commit()
                print(f"[Division] Added: {div_name_en}")

            # District Loop
            for dis in div.get("districts", []):
                dis_id = dis["id"]
                dis_name_en = dis["name_en"]
                dis_name_bn = dis["name_bn"]

                # District Insert
                db_dis = db.query(District).filter_by(id=dis_id).first()
                if not db_dis:
                    db_dis = District(id=dis_id, division_id=div_id, name_bn=dis_name_bn, name_en=dis_name_en)
                    db.add(db_dis)
                    db.commit()

                # Upazilas Loop
                for upa_idx, upa_name in enumerate(dis.get("upazilas", []), start=1):
                    upa_id = int(f"{dis_id}{upa_idx:02d}")

                    if not db.query(Upazila).filter_by(id=upa_id).first():
                        db.add(Upazila(id=upa_id, district_id=dis_id, name_bn=upa_name, name_en=upa_name))
                
                db.commit()

        print("\nSUCCESS: All Geo Data Seeded Perfectly!")

    except Exception as e:
        db.rollback()
        print(f"\nCRITICAL ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_geo_data()