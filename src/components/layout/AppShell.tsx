import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Sun,
  Moon,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/archetypes', label: 'Archetypes', icon: FileText },
  { to: '/references', label: 'References', icon: Users },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('light');
  };

  // On opportunity pages, hide bottom nav since it has its own floating button
  const isOpportunityPage = location.pathname.startsWith('/opportunity/');

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-surface-dark text-text-primary-dark' : 'bg-surface text-text-primary'}`}>
      {/* Desktop Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 border-r transition-transform duration-200 hidden lg:block ${
        darkMode ? 'bg-navy-950 border-border-dark' : 'bg-white border-border-light'
      }`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-inherit">
          <Link to="/" className="text-lg font-semibold tracking-tight no-underline text-inherit">
            RecruitMe
          </Link>
        </div>
        <nav className="px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] no-underline transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent font-medium'
                    : darkMode
                    ? 'text-text-secondary-dark hover:bg-white/5'
                    : 'text-text-secondary hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-inherit">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] w-full transition-colors cursor-pointer ${
              darkMode ? 'text-text-secondary-dark hover:bg-white/5' : 'text-text-secondary hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 lg:hidden flex items-center justify-between px-4 h-14 border-b ${
        darkMode ? 'bg-navy-950 border-border-dark' : 'bg-white border-border-light'
      }`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <Link to="/" className="text-lg font-semibold tracking-tight no-underline text-inherit">
          RecruitMe
        </Link>
        <button onClick={toggleTheme} className="p-2.5 rounded-lg text-inherit cursor-pointer">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className={`max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8 ${isOpportunityPage ? 'pb-8' : 'pb-24'}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      {!isOpportunityPage && (
        <nav
          className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t flex items-center justify-around ${
            darkMode ? 'bg-navy-950 border-border-dark' : 'bg-white border-border-light'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2.5 px-4 min-w-[72px] no-underline transition-colors ${
                  active
                    ? 'text-accent'
                    : darkMode
                    ? 'text-text-secondary-dark'
                    : 'text-text-secondary'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
