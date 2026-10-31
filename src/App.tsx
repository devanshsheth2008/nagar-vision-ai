import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { CommandCenter } from '@/pages/CommandCenter';
import { LiveMonitoring } from '@/pages/LiveMonitoring';
import { AIDetection } from '@/pages/AIDetection';
import { VehicleRecognition } from '@/pages/VehicleRecognition';
import { HotspotIntelligence } from '@/pages/HotspotIntelligence';
import { IncidentManagement } from '@/pages/IncidentManagement';
import { CleanupOperations } from '@/pages/CleanupOperations';
import { AnalyticsReports } from '@/pages/AnalyticsReports';
import { OfficerManagement } from '@/pages/OfficerManagement';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProblemOverview } from '@/pages/ProblemOverview';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#17365D] animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  const loadingEl = useMemo(() => <LoadingScreen />, []);
  const loginEl = useMemo(() => <LoginPage />, []);
  const dashboardEl = useMemo(() => <AppLayout />, []);

  if (loading) return loadingEl;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={loginEl} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={dashboardEl}>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/problem-overview" element={<ProblemOverview />} />
        <Route path="/monitoring" element={<LiveMonitoring />} />
        <Route path="/ai-detection" element={<AIDetection />} />
        <Route path="/vehicles" element={<VehicleRecognition />} />
        <Route path="/hotspots" element={<HotspotIntelligence />} />
        <Route path="/incidents" element={<IncidentManagement />} />
        <Route path="/cleanup" element={<CleanupOperations />} />
        <Route path="/analytics" element={<AnalyticsReports />} />
        <Route path="/officers" element={<OfficerManagement />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
