import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EnhancedHome from './pages/EnhancedHome';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  // Use enhanced version if feature flag is enabled, fallback to original
  const useEnhancedUI = import.meta.env.VITE_USE_ENHANCED_UI !== 'false';

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={useEnhancedUI ? <EnhancedHome /> : <Home />} />
              <Route path="/enhanced" element={<EnhancedHome />} />
              <Route path="/classic" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
