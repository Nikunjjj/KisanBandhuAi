import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import BookmarkedSchemes from "./pages/BookmarkedSchemes";
import Chatbot from "./pages/Chatbot";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Recommendations from "./pages/Recommendations";
import ResetPassword from "./pages/ResetPassword";
import SchemeDetail from "./pages/SchemeDetail";
import SchemeForm from "./pages/SchemeForm";
import Schemes from "./pages/Schemes";
import VerifyEmail from "./pages/VerifyEmail";
import AgricultureHub from "./pages/agriculture/AgricultureHub";
import AgricultureNews from "./pages/agriculture/AgricultureNews";
import CropEncyclopedia from "./pages/agriculture/CropEncyclopedia";
import DiseaseAwareness from "./pages/agriculture/DiseaseAwareness";
import LivestockCare from "./pages/agriculture/LivestockCare";
import MarketDashboard from "./pages/agriculture/MarketDashboard";
import SeasonalAssistant from "./pages/agriculture/SeasonalAssistant";
import SmartAgriMap from "./pages/agriculture/SmartAgriMap";
import WeatherDashboard from "./pages/agriculture/WeatherDashboard";
import Documents from "./pages/Documents";
import DbtTracker from "./pages/DbtTracker";
import PlantDoctor from "./pages/PlantDoctor";
import LivestockDashboard from "./pages/livestock/LivestockDashboard";
import AnimalForm from "./pages/livestock/AnimalForm";
import AnimalProfile from "./pages/livestock/AnimalProfile";
import DiseaseAssistant from "./pages/livestock/DiseaseAssistant";
import FarmJobs from "./pages/FarmJobs";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import Marketplace from "./pages/Marketplace";
import CropDetail from "./pages/CropDetail";
import SellCrop from "./pages/SellCrop";
import MyListings from "./pages/MyListings";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminMap from "./pages/admin/AdminMap";
import AdminSchemes from "./pages/admin/AdminSchemes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/schemes/bookmarks" element={<BookmarkedSchemes />} />
          <Route path="/schemes/new" element={<SchemeForm />} />
          <Route path="/schemes/:id" element={<SchemeDetail />} />
          <Route path="/schemes/:id/edit" element={<SchemeForm />} />
          <Route path="/advisory" element={<AgricultureHub />} />
          <Route path="/agriculture" element={<AgricultureHub />} />
          <Route path="/agriculture/weather" element={<WeatherDashboard />} />
          <Route path="/agriculture/market" element={<MarketDashboard />} />
          <Route path="/agriculture/crops" element={<CropEncyclopedia />} />
          <Route path="/agriculture/diseases" element={<DiseaseAwareness />} />
          <Route path="/agriculture/livestock" element={<LivestockCare />} />
          <Route path="/agriculture/seasonal" element={<SeasonalAssistant />} />
          <Route path="/agriculture/news" element={<AgricultureNews />} />
          <Route path="/agri-map" element={<SmartAgriMap />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/dbt" element={<DbtTracker />} />
          <Route path="/plant-doctor" element={<PlantDoctor />} />
          <Route path="/livestock" element={<LivestockDashboard />} />
          <Route path="/livestock/new" element={<AnimalForm />} />
          <Route path="/livestock/assistant" element={<DiseaseAssistant />} />
          <Route path="/livestock/:id" element={<AnimalProfile />} />
          
          <Route path="/jobs" element={<FarmJobs />} />
          <Route path="/jobs/new" element={<PostJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/edit" element={<PostJob />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/new" element={<SellCrop />} />
          <Route path="/marketplace/:id" element={<CropDetail />} />
          <Route path="/marketplace/:id/edit" element={<SellCrop />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/marketplace" element={<AdminMarketplace />} />
          <Route path="/admin/community" element={<AdminCommunity />} />
          <Route path="/admin/map" element={<AdminMap />} />
          <Route path="/admin/schemes" element={<AdminSchemes />} />
        </Route>
      </Route>
    </Routes>
  );
}
