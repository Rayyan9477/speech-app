'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  UserIcon,
  BellIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    id: 'profile',
    name: 'Profile Settings',
    description: 'Update your personal information and preferences',
    icon: UserIcon,
    route: '/dashboard/settings/account',
    color: 'text-blue-600'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Manage your notification preferences',
    icon: BellIcon,
    route: '/dashboard/settings/notifications',
    color: 'text-green-600'
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    description: 'Manage your subscription and billing information',
    icon: CreditCardIcon,
    route: '/dashboard/settings/billing',
    color: 'text-purple-600'
  },
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    icon: Cog6ToothIcon,
    route: '/dashboard/settings/appearance',
    color: 'text-orange-600'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Manage your account security and privacy',
    icon: ShieldCheckIcon,
    route: '/dashboard/settings/security',
    color: 'text-red-600'
  }
];

const recentActivity = [
  {
    id: 1,
    action: 'Created project',
    target: 'Product Demo Video',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    action: 'Exported audio',
    target: 'Tutorial Narration.mp3',
    timestamp: '1 day ago'
  },
  {
    id: 3,
    action: 'Cloned voice',
    target: 'Custom Voice Model',
    timestamp: '3 days ago'
  }
];

export default function AccountPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();

  const handleMenuClick = (route: string) => {
    router.push(route);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-2xl">
                    J
                  </div>
                )}
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                <PhotoIcon className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile picture"
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
              <p className="text-gray-600">john.doe@example.com</p>
              <p className="text-sm text-gray-500 mt-1">Premium Plan • Active since Jan 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-6">
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleMenuClick(item.route)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${item.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">
                    <span className="font-medium">{activity.action}</span>
                    {' '}
                    <span className="text-gray-600">{activity.target}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Stats */}
      <div className="px-6 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Projects Created</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-600">Minutes Generated</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="text-sm text-gray-600">Voice Models</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-6 py-6">
        <Button
          variant="outline"
          fullWidth
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => router.push('/login')}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
