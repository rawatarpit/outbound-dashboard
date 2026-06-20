import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ChatPage from '@/pages/ChatPage'
import PipelinePage from '@/pages/PipelinePage'
import LeadsPage from '@/pages/LeadsPage'
import CampaignsPage from '@/pages/CampaignsPage'
import MessagesPage from '@/pages/MessagesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsLayout from '@/pages/SettingsLayout'
import SettingsPage from '@/pages/SettingsPage'
import TeamPage from '@/pages/TeamPage'
import WebhooksPage from '@/pages/WebhooksPage'
import ApiKeysPage from '@/pages/ApiKeysPage'
import ReputationPage from '@/pages/ReputationPage'
import SystemFlagsPage from '@/pages/SystemFlagsPage'
import OutreachQueuePage from '@/pages/OutreachQueuePage'
import BrandsPage from '@/pages/BrandsPage'
import BrandDetailPage from '@/pages/BrandDetailPage'
import LeadDetailPage from '@/pages/LeadDetailPage'
import DiscoveredCompaniesPage from '@/pages/DiscoveredCompaniesPage'
import DiscoveryPage from '@/pages/DiscoveryPage'
import DashboardPage from '@/pages/DashboardPage'

function LandingOrDashboard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return <LandingPage />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingOrDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Primary tabs */}
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/leads/:id" element={<LeadDetailPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />

                  {/* Settings section with sub-pages */}
                  <Route path="/settings" element={<SettingsLayout />}>
                    <Route index element={<SettingsPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="webhooks" element={<WebhooksPage />} />
                    <Route path="api-keys" element={<ApiKeysPage />} />
                    <Route path="reputation" element={<ReputationPage />} />
                    <Route path="system-flags" element={<SystemFlagsPage />} />
                  </Route>

                  {/* Legacy routes kept for backward compat */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/brands" element={<BrandsPage />} />
                  <Route path="/brands/:id" element={<BrandDetailPage />} />
                  <Route path="/discovered-companies" element={<DiscoveredCompaniesPage />} />
                  <Route path="/discovery" element={<DiscoveryPage />} />
                  <Route path="/outreach" element={<OutreachQueuePage />} />
                  <Route path="/team" element={<Navigate to="/settings/team" replace />} />
                  <Route path="/webhooks" element={<Navigate to="/settings/webhooks" replace />} />
                  <Route path="/api-keys" element={<Navigate to="/settings/api-keys" replace />} />
                  <Route path="/reputation" element={<Navigate to="/settings/reputation" replace />} />
                  <Route path="/system-flags" element={<Navigate to="/settings/system-flags" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
