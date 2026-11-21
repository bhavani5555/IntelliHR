import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import CandidatePortal from './pages/candidate/CandidatePortal'
import CandidateRegister from './pages/candidate/CandidateRegister'
import CandidateLogin from './pages/candidate/CandidateLogin'
import CandidateDashboard from './pages/candidate/CandidateDashboard'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/careers" element={<CandidatePortal />} />
        <Route path="/careers/register" element={<CandidateRegister />} />
        <Route path="/careers/login" element={<CandidateLogin />} />
        <Route path="/careers/dashboard" element={<CandidateDashboard />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter