'use client';

import { Box } from '@mui/material';
import BottomNavigation from '../../src/components/navigation/BottomNavigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: 8, // Space for bottom navigation
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </Box>
  );
}
