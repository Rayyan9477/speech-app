import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  FolderIcon,
  Cog6ToothIcon,
  SparklesIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MicrophoneIcon as MicrophoneIconSolid,
  SpeakerWaveIcon as SpeakerWaveIconSolid,
  LanguageIcon as LanguageIconSolid,
  FolderIcon as FolderIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';
import { useTheme } from '../../lib/theme-provider';

const BottomNavigation = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const navigationItems = [
    {
      name: 'Home',
      path: '/app/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'TTS',
      path: '/app/tts',
      icon: SpeakerWaveIcon,
      activeIcon: SpeakerWaveIconSolid,
    },
    {
      name: 'Voice Changer',
      path: '/app/voice-changer',
      icon: MicrophoneIcon,
      activeIcon: MicrophoneIconSolid,
    },
    {
      name: 'Translate',
      path: '/app/voice-translate',
      icon: LanguageIcon,
      activeIcon: LanguageIconSolid,
    },
    {
      name: 'Library',
      path: '/app/voice-library',
      icon: FolderIcon,
      activeIcon: FolderIconSolid,
    },
    {
      name: 'Settings',
      path: '/app/settings',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/app/') {
      return location.pathname === '/app/' || location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${
      theme === 'dark'
        ? 'bg-slate-900/95 backdrop-blur-lg border-t border-slate-700'
        : 'bg-white/95 backdrop-blur-lg border-t border-slate-200'
    }`}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = active ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <IconComponent
                  className={`w-6 h-6 mb-1 transition-colors ${
                    active
                      ? 'text-primary'
                      : theme === 'dark'
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                />

                {/* Active indicator */}
                {active && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                )}
              </motion.div>

              <span
                className={`text-xs font-medium transition-colors ${
                  active
                    ? 'text-primary'
                    : theme === 'dark'
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default BottomNavigation;
