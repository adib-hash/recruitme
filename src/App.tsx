import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import ArchetypesPage from './pages/ArchetypesPage';
import ArchetypeEditor from './pages/ArchetypeEditor';
import OpportunityPage from './pages/OpportunityPage';
import ReferencesPage from './pages/ReferencesPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/archetypes" element={<ArchetypesPage />} />
        <Route path="/archetypes/:id" element={<ArchetypeEditor />} />
        <Route path="/references" element={<ReferencesPage />} />
        <Route path="/opportunity/:id" element={<OpportunityPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </BrowserRouter>
  );
}
