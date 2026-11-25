import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { AccountPage } from './pages/AccountPage'
import { AboutPage } from './pages/AboutPage'
import { AdminActivityPage } from './pages/admin/AdminActivityPage'
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage'
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage'
import { AdminHospitalsPage } from './pages/admin/AdminHospitalsPage'
import { AdminInsurancePage } from './pages/admin/AdminInsurancePage'
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage'
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { AssistantPage } from './pages/AssistantPage'
import { BookingPage } from './pages/BookingPage'
import { CashlessGuidancePage } from './pages/CashlessGuidancePage'
import { CoverageCheckerPage } from './pages/CoverageCheckerPage'
import { EmergencyPage } from './pages/EmergencyPage'
import { FamilyProfilesPage } from './pages/FamilyProfilesPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { HomePage } from './pages/HomePage'
import { HospitalDetailPage } from './pages/HospitalDetailPage'
import { HospitalsPage } from './pages/HospitalsPage'
import { InsurancePoliciesPage } from './pages/InsurancePoliciesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ReimbursementClaimsPage } from './pages/ReimbursementClaimsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SpecialistProfilePage } from './pages/SpecialistProfilePage'
import { SpecialistsPage } from './pages/SpecialistsPage'
import { TriagePage } from './pages/TriagePage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hospitals" element={<HospitalsPage />} />
        <Route path="hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="triage" element={<TriagePage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="specialists" element={<SpecialistsPage />} />
        <Route path="specialists/:id" element={<SpecialistProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route path="specialists/:id/book" element={<BookingPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="family" element={<FamilyProfilesPage />} />
          <Route path="insurance" element={<InsurancePoliciesPage />} />
          <Route path="coverage-checker" element={<CoverageCheckerPage />} />
          <Route path="cashless-guidance" element={<CashlessGuidancePage />} />
          <Route path="reimbursement-claims" element={<ReimbursementClaimsPage />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="hospitals" element={<AdminHospitalsPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="insurance" element={<AdminInsurancePage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="about" element={<AboutPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
