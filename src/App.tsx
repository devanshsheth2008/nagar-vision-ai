import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PortalSelection } from '@/pages/PortalSelection';
import { LoginPage } from '@/pages/LoginPage';

// Admin pages
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
import { AdminComplaints } from '@/pages/admin/AdminComplaints';

// Citizen pages
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { ReportGarbage } from '@/pages/citizen/ReportGarbage';
import { TrackComplaints } from '@/pages/citizen/TrackComplaints';
import { ComplaintHistory } from '@/pages/citizen/ComplaintHistory';
import { ProfilePage } from '@/pages/shared/ProfilePage';

// Crew pages
import { CrewDashboard } from '@/pages/crew/CrewDashboard';
import { CrewTasks } from '@/pages/crew/CrewTasks';
import { CompletedTasks } from '@/pages/crew/CompletedTasks';
import { TaskHistory } from '@/pages/crew/TaskHistory';

import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { UserRole } from '@/types';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#17365D] animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const { user, profile, role, loading } = useAuth();

  const loadingEl = useMemo(() => <LoadingScreen />, []);

  if (loading) return loadingEl;

  if (!user || !profile || !role) {
    return (
      <Routes>
        <Route path="/" element={<PortalSelection />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const portalHome = `/${role}` as const;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={portalHome} replace />} />
      <Route path="/login" element={<Navigate to={portalHome} replace />} />

      {role === 'admin' && (
        <Route element={<AppLayout role="admin" />}>
          <Route path="/admin" element={<CommandCenter />} />
          <Route path="/admin/problem-overview" element={<ProblemOverview />} />
          <Route path="/admin/monitoring" element={<LiveMonitoring />} />
          <Route path="/admin/ai-detection" element={<AIDetection />} />
          <Route path="/admin/vehicles" element={<VehicleRecognition />} />
          <Route path="/admin/hotspots" element={<HotspotIntelligence />} />
          <Route path="/admin/incidents" element={<IncidentManagement />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/cleanup" element={<CleanupOperations />} />
          <Route path="/admin/analytics" element={<AnalyticsReports />} />
          <Route path="/admin/officers" element={<OfficerManagement />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      )}

      {role === 'citizen' && (
        <Route element={<AppLayout role="citizen" />}>
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/report" element={<ReportGarbage />} />
          <Route path="/citizen/track" element={<TrackComplaints />} />
          <Route path="/citizen/history" element={<ComplaintHistory />} />
          <Route path="/citizen/profile" element={<ProfilePage />} />
        </Route>
      )}

      {role === 'crew' && (
        <Route element={<AppLayout role="crew" />}>
          <Route path="/crew" element={<CrewDashboard />} />
          <Route path="/crew/tasks" element={<CrewTasks />} />
          <Route path="/crew/completed" element={<CompletedTasks />} />
          <Route path="/crew/history" element={<TaskHistory />} />
          <Route path="/crew/profile" element={<ProfilePage />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to={portalHome} replace />} />
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
