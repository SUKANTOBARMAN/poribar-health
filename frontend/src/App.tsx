import { Routes, Route } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import Placeholder from "@/pages/Placeholder";

import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import VolunteerRegister from "@/pages/public/VolunteerRegister";
import HospitalSearch from "@/pages/public/HospitalSearch";
import HospitalDetail from "@/pages/public/HospitalDetail";
import SymptomChecker from "@/pages/public/SymptomChecker";
import AmbulanceFinder from "@/pages/public/AmbulanceFinder";
import BloodSearch from "@/pages/public/BloodSearch";
import Articles from "@/pages/public/Articles";
import ArticleDetail from "@/pages/public/ArticleDetail";
import VolunteerProfile from "@/pages/public/VolunteerProfile";

import AppHome from "@/pages/user/AppHome";
import MyHelpRequests from "@/pages/user/MyHelpRequests";
import Notifications from "@/pages/user/Notifications";

import VolunteerDashboard from "@/pages/volunteer/Dashboard";
import VolunteerRequestList from "@/pages/volunteer/RequestList";
import VolunteerRequestDetail from "@/pages/volunteer/RequestDetail";
import AssistanceLog from "@/pages/volunteer/AssistanceLog";
import MyArticles from "@/pages/volunteer/MyArticles";
import MyProfile from "@/pages/volunteer/MyProfile";

import VolunteerApprovals from "@/pages/director/VolunteerApprovals";
import ArticleReview from "@/pages/director/ArticleReview";
import AreaAnalytics from "@/pages/director/AreaAnalytics";
import Awards from "@/pages/director/Awards";
import DirectorCertificates from "@/pages/director/Certificates";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminHospitals from "@/pages/admin/Hospitals";
import AdminVolunteers from "@/pages/admin/Volunteers";
import AdminReports from "@/pages/admin/Reports";
import Settings from "@/pages/user/Settings";
import BloodDonorSettings from "@/pages/user/BloodDonorSettings";

import HospitalManage from "@/pages/admin/HospitalManage";
import ForgotPassword from "@/pages/public/ForgotPassword";
import ArticleEdit from "@/pages/volunteer/ArticleEdit";


import CategoryIndex from "@/pages/admin/categories/CategoryIndex";
import CategoryCreate from "@/pages/admin/categories/CategoryCreate";
import CategoryEditPage from "@/pages/admin/categories/CategoryEditPage";


import ArticleIndex from "@/pages/volunteer/articles/Index";
import ArticleEditor from "@/pages/volunteer/articles/ArticleEditor";

import DirectorArticlePreview from "@/pages/director/ArticlePreview";
import LightboxProvider from "@/components/Lightbox";




export default function App() {
  return (
    <>
    <Routes>
      {/* ---------- পাবলিক রুট (লগইন ছাড়া) ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/volunteer" element={<VolunteerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/hospitals" element={<HospitalSearch />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/ambulances" element={<AmbulanceFinder />} />
        <Route path="/blood-donors" element={<BloodSearch />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/volunteers/:slug" element={<VolunteerProfile />} />
      </Route>

      {/* ---------- লগইন করা যেকোনো ইউজার (/app/*) ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/help-requests" element={<MyHelpRequests />} />
          <Route path="/app/notifications" element={<Notifications />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/blood-donor" element={<BloodDonorSettings />} />

          {/* --- volunteer role --- */}
          <Route element={<RoleRoute roles={["volunteer"]} />}>
            <Route path="/app/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/app/volunteer/requests" element={<VolunteerRequestList />} />
            <Route path="/app/volunteer/requests/:id" element={<VolunteerRequestDetail />} />
            <Route path="/app/volunteer/assistance-log" element={<AssistanceLog />} />
            <Route path="/app/volunteer/profile" element={<MyProfile />} />
            <Route path="/app/volunteer/articles" element={<ArticleIndex />} />
            <Route path="/app/volunteer/articles/new" element={<ArticleEditor />} />
            <Route path="/app/volunteer/articles/:id/edit" element={<ArticleEditor />} />
          </Route>

          {/* --- director / super_admin role --- */}
          <Route element={<RoleRoute roles={["director", "super_admin"]} />}>
            <Route path="/app/director/volunteers" element={<VolunteerApprovals />} />
            <Route path="/app/director/articles" element={<ArticleReview />} />
            <Route path="/app/director/analytics" element={<AreaAnalytics />} />
            <Route path="/app/director/articles/:id" element={<DirectorArticlePreview />} />
            <Route path="/app/director/awards" element={<Awards />} />
            <Route path="/app/director/certificates" element={<DirectorCertificates />} />
          </Route>

          {/* --- super_admin only --- */}
          <Route element={<RoleRoute roles={["super_admin"]} />}>
            <Route path="/app/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/app/admin/hospitals" element={<AdminHospitals />} />
            <Route path="/app/admin/hospitals/:id" element={<HospitalManage />} />
            <Route path="/app/admin/volunteers" element={<AdminVolunteers />} />
            <Route path="/app/admin/reports" element={<AdminReports />} />
            <Route path="/app/admin/categories" element={<CategoryIndex />} />
            <Route path="/app/admin/categories/create" element={<CategoryCreate />} />
            <Route path="/app/admin/categories/:id/edit" element={<CategoryEditPage />} />
                      
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="৪০৪ — পেজ পাওয়া যায়নি" />} />
    </Routes>
     <LightboxProvider />
    </>
  );
}