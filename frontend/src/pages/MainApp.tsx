import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNavigation from '../components/navigation/BottomNavigation';
import Home from './main/Home';
import TTS from './main/TTS';
import VoiceChanger from './main/VoiceChanger';
import VoiceTranslate from './main/VoiceTranslate';
import VoiceLibrary from './main/VoiceLibrary';
import Projects from './main/Projects';
import Settings from './main/Settings';
import { useTheme } from '../lib/theme-provider';

const MainApp = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark'
        ? 'bg-slate-950'
        : 'bg-slate-50'
    }`}>
      {/* Main Content */}
      <main className="flex-1 pb-20">
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
            <Route path="/projects" element={<Projects />} />
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
