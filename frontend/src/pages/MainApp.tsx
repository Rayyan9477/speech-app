import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNavigation from '../components/navigation/BottomNavigation';
import Home from './main/Home';
import TTS from './main/TTS';
import VoiceChanger from './main/VoiceChanger';
import VoiceTranslate from './main/VoiceTranslate';
import VoiceLibrary from './main/VoiceLibrary';
import VoiceCustomizer from './main/VoiceCustomizer';
import VoiceCloning from './main/VoiceCloning';
import Projects from './main/Projects';
import ProjectCollaboration from './main/ProjectCollaboration';
import ProjectAnalytics from './main/ProjectAnalytics';
import Settings from './main/Settings';
import { useTheme } from '../lib/theme-provider';

const MainApp = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col mobile-safe ${
      theme === 'dark'
        ? 'bg-slate-950'
        : 'bg-slate-50'
    }`}>
      {/* Main Content */}
      <main className="flex-1 pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tts" element={<TTS />} />
            <Route path="/voice-changer" element={<VoiceChanger />} />
            <Route path="/voice-translate" element={<VoiceTranslate />} />
            <Route path="/voice-library" element={<VoiceLibrary />} />
            <Route path="/voice-customizer" element={<VoiceCustomizer />} />
            <Route path="/voice-cloning" element={<VoiceCloning />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/collaboration" element={<ProjectCollaboration />} />
            <Route path="/analytics" element={<ProjectAnalytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MainApp;
