import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-800">আপনার স্বাস্থ্য তথ্য, আমাদের দায়িত্ব</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">রংপুর বিভাগের গ্রামীণ স্বাস্থ্যসেবা প্ল্যাটফর্ম — Joutuk Birodhi Andolon</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link to="/symptom-checker" className="card p-6 text-center hover:shadow-md"><div className="text-3xl">🩺</div><div className="mt-2 font-medium">লক্ষণ দিন</div></Link>
        <Link to="/hospitals" className="card p-6 text-center hover:shadow-md"><div className="text-3xl">🏥</div><div className="mt-2 font-medium">হাসপাতাল খুঁজুন</div></Link>
        <Link to="/ambulances" className="card p-6 text-center hover:shadow-md"><div className="text-3xl">🚑</div><div className="mt-2 font-medium">অ্যাম্বুলেন্স</div></Link>
        <Link to="/blood-donors" className="card p-6 text-center hover:shadow-md"><div className="text-3xl">🩸</div><div className="mt-2 font-medium">রক্ত দরকার</div></Link>
      </div>
      <div className="mt-12 text-center">
        <Link to="/register/volunteer" className="btn btn-primary">ভলান্টিয়ার হিসেবে যোগ দিন</Link>
      </div>
    </div>
  );
}
