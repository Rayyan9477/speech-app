'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Home,
  VolumeUp,
  Mic,
  Translate,
  LibraryMusic,
  Settings,
} from '@mui/icons-material';

const BottomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Home',
      path: '/app',
      icon: <Home />,
    },
    {
      label: 'TTS',
      path: '/app/tts',
      icon: <VolumeUp />,
    },
    {
      label: 'Voice Changer',
      path: '/app/voice-changer',
      icon: <Mic />,
    },
    {
      label: 'Translate',
      path: '/app/voice-translate',
      icon: <Translate />,
    },
    {
      label: 'Library',
      path: '/app/voice-library',
      icon: <LibraryMusic />,
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: <Settings />,
    },
  ];

  const getActiveValue = () => {
    const activeItem = navigationItems.find(item =>
      pathname === item.path || (item.path !== '/app' && pathname.startsWith(item.path))
    );
    return activeItem ? navigationItems.indexOf(activeItem) : 0;
  };

  const handleNavigationChange = (_event: React.SyntheticEvent, newValue: number) => {
    router.push(navigationItems[newValue].path);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        backgroundColor: 'background.paper',
        backdropFilter: 'blur(10px)',
        borderTop: 1,
        borderColor: 'divider',
      }}
      elevation={8}
    >
      <Box sx={{ pb: 'env(safe-area-inset-bottom)' }}>
        <MuiBottomNavigation
          value={getActiveValue()}
          onChange={handleNavigationChange}
          sx={{
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
              minWidth: 'auto',
              padding: '6px 8px',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              '&.Mui-selected': {
                fontSize: '0.75rem',
              },
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {item.icon}
                </motion.div>
              }
              sx={{
                position: 'relative',
                '&.Mui-selected::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                },
              }}
            />
          ))}
        </MuiBottomNavigation>
      </Box>
    </Paper>
  );
};

export default BottomNavigation;
