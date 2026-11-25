import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AccountProvider } from './context/AccountContext.tsx'
import { AppointmentProvider } from './context/AppointmentContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { DemoCatalogProvider } from './context/DemoCatalogContext.tsx'
import { ServiceLocationProvider } from './context/LocationContext.tsx'
import { InsuranceWorkspaceProvider } from './context/InsuranceWorkspaceContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceLocationProvider>
      <DemoCatalogProvider>
        <AuthProvider>
          <AccountProvider>
            <InsuranceWorkspaceProvider>
              <AppointmentProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </AppointmentProvider>
            </InsuranceWorkspaceProvider>
          </AccountProvider>
        </AuthProvider>
      </DemoCatalogProvider>
    </ServiceLocationProvider>
  </StrictMode>,
)
