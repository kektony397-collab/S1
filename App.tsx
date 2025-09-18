
import React, { useState, useMemo, useCallback } from 'react';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import Footer from './components/Footer';

enum Page {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
}

const AppContent: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.DASHBOARD);
  const { theme, toggleTheme } = useTheme();

  const renderPage = useCallback(() => {
    switch (page) {
      case Page.HISTORY:
        return <History />;
      case Page.SETTINGS:
        return <Settings />;
      case Page.DASHBOARD:
      default:
        return <Dashboard />;
    }
  }, [page]);

  const navItemClasses = (activePage: Page) =>
    `flex-1 text-center p-4 cursor-pointer transition-colors duration-300 ${
      page === activePage
        ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent'
        : 'text-gray-500 hover:text-light-text dark:hover:text-dark-text'
    }`;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg`}>
      <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-light-accent dark:text-dark-accent">BikeComp</h1>
          <nav className="flex-1 flex justify-center">
            <a onClick={() => setPage(Page.DASHBOARD)} className={navItemClasses(Page.DASHBOARD)}>
              <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
            </a>
            <a onClick={() => setPage(Page.HISTORY)} className={navItemClasses(Page.HISTORY)}>
              <i className="fas fa-history mr-2"></i>History
            </a>
            <a onClick={() => setPage(Page.SETTINGS)} className={navItemClasses(Page.SETTINGS)}>
              <i className="fas fa-cog mr-2"></i>Settings
            </a>
          </nav>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'dark' ? <i className="fas fa-sun text-yellow-400"></i> : <i className="fas fa-moon text-gray-700"></i>}
          </button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
