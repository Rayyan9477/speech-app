'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Volume2,
  Mic,
  Languages,
  Music,
  Settings,
} from 'lucide-react';

const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Home',
      path: '/app',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'TTS',
      path: '/app/tts',
      icon: <Volume2 className="w-5 h-5" />,
    },
    {
      label: 'Voice Changer',
      path: '/app/voice-changer',
      icon: <Mic className="w-5 h-5" />,
    },
    {
      label: 'Translate',
      path: '/app/voice-translate',
      icon: <Languages className="w-5 h-5" />,
    },
    {
      label: 'Library',
      path: '/app/voice-library',
      icon: <Music className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const getActiveValue = () => {
    const activeItem = navigationItems.find(item =>
      pathname === item.path || (item.path !== '/app' && pathname.startsWith(item.path))
    );
    return activeItem ? navigationItems.indexOf(activeItem) : 0;
  };

  const handleNavigationClick = (path: string) => {
    router.push(path);
  };

  const activeIndex = getActiveValue();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border shadow-lg mobile-safe">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => handleNavigationClick(item.path)}
            className={`flex flex-col items-center justify-center min-w-0 py-1 px-2 transition-colors touch-target ${
              activeIndex === index
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={item.label}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="mb-1"
            >
              {item.icon}
            </motion.div>
            <span className="text-xs font-medium leading-none">
              {item.label}
            </span>
            {activeIndex === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
