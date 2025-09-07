import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useTheme } from '../../lib/theme-provider';
import {
  ArrowLeftIcon,
  CogIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  LockClosedIcon,
  StarIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface NotificationItem {
  id: string;
  type: 'security' | 'system' | 'feature' | 'event' | 'success';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Notifications = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'security',
      title: 'Account Security Alert 🔒',
      description: "We've noticed some unusual activity on your account. Please review your recent logins and update your password if necessary.",
      timestamp: '09:41 AM',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'system',
      title: 'System Update Available 💫',
      description: 'A new system update is ready for installation. It includes performance improvements and bug fixes.',
      timestamp: '08:46 AM',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'success',
      title: 'Password Reset Successful ✅',
      description: "Your password has been successfully reset. If you didn't request this change, please contact support immediately.",
      timestamp: 'Yesterday',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'feature',
      title: 'Exciting New Feature 🆕',
      description: "We've just launched a new feature that will enhance your user experience. Check it out now!",
      timestamp: 'Yesterday',
      isRead: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'event',
      title: 'Event Reminder 📅',
      description: "Don't forget about the team-building event tomorrow at 3 PM. We can't wait to see you there!",
      timestamp: 'Yesterday',
      isRead: true,
      priority: 'medium'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <ShieldCheckIcon className="w-6 h-6 text-red-500" />;
      case 'system':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      case 'success':
        return <LockClosedIcon className="w-6 h-6 text-green-500" />;
      case 'feature':
        return <StarIcon className="w-6 h-6 text-purple-500" />;
      case 'event':
        return <CalendarIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'system':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'feature':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'event':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const todayNotifications = notifications.filter(n => 
    n.timestamp.includes('AM') || n.timestamp.includes('PM')
  );
  const yesterdayNotifications = notifications.filter(n => 
    n.timestamp.includes('Yesterday')
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Notification</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <CogIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
        </motion.div>

        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Today</h2>
            <div className="space-y-3">
              {todayNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-2"></div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Yesterday Section */}
        {yesterdayNotifications.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Yesterday</h2>
            <div className="space-y-3">
              {yesterdayNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 opacity-75"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">We&apos;ll let you know when something arrives!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;