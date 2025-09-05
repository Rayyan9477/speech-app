'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const navigationTabs = [
  {
    name: 'Home',
    path: '/dashboard/home',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    )
  },
  {
    name: 'Voices',
    path: '/dashboard/voices',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
    )
  },
  {
    name: 'Projects',
    path: '/dashboard/projects',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
    )
  },
  {
    name: 'Account',
    path: '/dashboard/account',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    )
  }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationTabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path);
          
          return (
            <motion.button
              key={tab.name}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center py-2 px-3 min-h-[64px] relative"
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary-500 rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              
              {/* Icon */}
              <div className="mb-1">
                {tab.icon(isActive)}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`}>
                {tab.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}