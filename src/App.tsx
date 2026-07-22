import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Maintenance } from './pages/Maintenance';
import { AiAnalysis } from './pages/AiAnalysis';
import { Settings } from './pages/Settings';
import { UsageLogs } from './pages/UsageLogs';
import { Expenses } from './pages/Expenses';
import { FuelLogs } from './pages/FuelLogs';
import { Reminders } from './pages/Reminders';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="ai-analysis" element={<AiAnalysis />} />
                  <Route path="usage" element={<UsageLogs />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="fuel" element={<FuelLogs />} />
                  <Route path="reminders" element={<Reminders />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}


