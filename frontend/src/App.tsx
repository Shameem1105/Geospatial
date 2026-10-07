import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Processing } from './pages/Processing';
import { FileAnalysis } from './pages/FileAnalysis';
import { FeatureExplorer } from './pages/FeatureExplorer';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Projects } from './pages/Projects';
import { SurveyFiles } from './pages/SurveyFiles';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
          {mobileMenuOpen && (
            <div
              className="mobile-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <main>
            <Navbar onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/analysis" element={<FileAnalysis />} />
              <Route path="/explorer" element={<FeatureExplorer />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/files" element={<SurveyFiles />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
