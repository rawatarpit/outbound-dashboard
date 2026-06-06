import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import BrandsPage from '@/pages/BrandsPage'
import BrandDetailPage from '@/pages/BrandDetailPage'
import LeadsPage from '@/pages/LeadsPage'
import LeadDetailPage from '@/pages/LeadDetailPage'
import DiscoveredCompaniesPage from '@/pages/DiscoveredCompaniesPage'
import PipelinePage from '@/pages/PipelinePage'
import DiscoveryPage from '@/pages/DiscoveryPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import TeamPage from '@/pages/TeamPage'
import WebhooksPage from '@/pages/WebhooksPage'
import ApiKeysPage from '@/pages/ApiKeysPage'
import OutreachQueuePage from '@/pages/OutreachQueuePage'
import CampaignsPage from '@/pages/CampaignsPage'
import SystemFlagsPage from '@/pages/SystemFlagsPage'
import ReputationPage from '@/pages/ReputationPage'

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
    return <Navigate to="/dashboard" replace />
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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/brands/:id" element={<BrandDetailPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/leads/:id" element={<LeadDetailPage />} />
                <Route path="/discovered-companies" element={<DiscoveredCompaniesPage />} />
                <Route path="/pipeline" element={<PipelinePage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/webhooks" element={<WebhooksPage />} />
                <Route path="/api-keys" element={<ApiKeysPage />} />
                <Route path="/outreach" element={<OutreachQueuePage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/system-flags" element={<SystemFlagsPage />} />
                <Route path="/reputation" element={<ReputationPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </AuthProvider>
  )
}
