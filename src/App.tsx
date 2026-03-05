import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import VerticalLanding from "./pages/VerticalLanding";
import Dashboard from "./pages/Dashboard";
import LeadDetail from "./pages/LeadDetail";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-body">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/agences-web" element={<VerticalLanding slug="agences-web" />} />
        <Route path="/comptables" element={<VerticalLanding slug="comptables" />} />
        <Route path="/assureurs" element={<VerticalLanding slug="assureurs" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lead/:id" element={<LeadDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
