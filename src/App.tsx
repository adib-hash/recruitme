import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import ArchetypesPage from './pages/ArchetypesPage';
import ArchetypeEditor from './pages/ArchetypeEditor';
import OpportunityPage from './pages/OpportunityPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/archetypes" element={<ArchetypesPage />} />
          <Route path="/archetypes/:id" element={<ArchetypeEditor />} />
          <Route path="/opportunity/:id" element={<OpportunityPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
