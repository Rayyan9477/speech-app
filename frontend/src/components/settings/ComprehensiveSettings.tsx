import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { useSettings } from '../../contexts/SettingsContext';
import UpgradeDialog from './UpgradeDialog';
import LogoutConfirmation from './LogoutConfirmation';
import {
  UsersIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  LinkIcon,
  PaintBrushIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  SparklesIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const ComprehensiveSettings: React.FC = () => {
  const {
    state,
    setCurrentSection,
    updateNotificationSettings,
    updateAppearanceSettings,
    dispatch
  } = useSettings();

  const settingsMenuItems = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage team members and permissions',
      icon: UsersIcon,
      section: 'user-management'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email, push, and SMS preferences',
      icon: BellIcon,
      section: 'notifications'
    },
    {
      id: 'security',
      title: 'Account & Security',
      description: 'Password, 2FA, and security settings',
      icon: ShieldCheckIcon,
      section: 'security'
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Plans, billing history, and invoices',
      icon: CreditCardIcon,
      section: 'billing'
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      description: 'Credit cards and payment options',
      icon: BanknotesIcon,
      section: 'payment-methods'
    },
    {
      id: 'linked-accounts',
      title: 'Linked Accounts',
      description: 'Connected social and external accounts',
      icon: LinkIcon,
      section: 'linked-accounts'
    },
    {
      id: 'appearance',
      title: 'App Appearance',
      description: 'Theme, language, and display preferences',
      icon: PaintBrushIcon,
      section: 'appearance'
    },
    {
      id: 'analytics',
      title: 'Data & Analytics',
      description: 'Usage statistics and data preferences',
      icon: ChartBarIcon,
      section: 'analytics'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'FAQ, contact support, and documentation',
      icon: QuestionMarkCircleIcon,
      section: 'help'
    }
  ];

  const renderAccountOverview = () => (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={state.user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg font-semibold">
                {state.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{state.user.name}</h2>
              <p className="text-muted-foreground">{state.user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  state.user.plan === 'pro' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : state.user.plan === 'team'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {state.user.plan.charAt(0).toUpperCase() + state.user.plan.slice(1)} Plan
                </span>
              </div>
            </div>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Upgrade to Pro Banner */}
      {state.user.plan === 'free' && (
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-semibold"
                  >
                    👤
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-1">Upgrade to Pro! 🚀</h3>
                <p className="text-sm opacity-90">Enjoy all benefits without any restrictions</p>
              </div>
            </div>
            <Button 
              onClick={() => dispatch({ type: 'SHOW_UPGRADE_DIALOG' })}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              Upgrade
            </Button>
          </div>
        </Card>
      )}

      {/* Settings Menu */}
      <div className="space-y-2">
        {settingsMenuItems.map((item) => (
          <Card 
            key={item.id}
            className="p-4 cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => setCurrentSection(item.section)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        ))}

        {/* Logout */}
        <Card 
          className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-red-200 dark:border-red-800"
          onClick={() => dispatch({ type: 'SHOW_LOGOUT_CONFIRMATION' })}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-600">Logout</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-red-600" />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">Manage your notification preferences</p>
        </div>
        <Button variant="ghost" onClick={() => setCurrentSection('account')}>
          Back
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={state.notifications.emailNotifications}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ emailNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch
              checked={state.notifications.pushNotifications}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ pushNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">SMS Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive text messages</p>
            </div>
            <Switch
              checked={state.notifications.smsNotifications}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ smsNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Marketing Emails</h3>
              <p className="text-sm text-muted-foreground">Receive promotional content</p>
            </div>
            <Switch
              checked={state.notifications.marketingEmails}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ marketingEmails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Product Updates</h3>
              <p className="text-sm text-muted-foreground">Get notified about new features</p>
            </div>
            <Switch
              checked={state.notifications.productUpdates}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ productUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Security Alerts</h3>
              <p className="text-sm text-muted-foreground">Important security notifications</p>
            </div>
            <Switch
              checked={state.notifications.securityAlerts}
              onCheckedChange={(checked) => 
                updateNotificationSettings({ securityAlerts: checked })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">App Appearance</h2>
          <p className="text-muted-foreground">Customize your app experience</p>
        </div>
        <Button variant="ghost" onClick={() => setCurrentSection('account')}>
          Back
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-3">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {['system', 'light', 'dark'].map((theme) => (
                <Button
                  key={theme}
                  variant={state.appearance.theme === theme ? 'default' : 'outline'}
                  onClick={() => updateAppearanceSettings({ theme: theme as any })}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className={`w-8 h-8 rounded-lg ${
                    theme === 'system' ? 'bg-gradient-to-br from-blue-400 to-purple-400' :
                    theme === 'light' ? 'bg-yellow-400' :
                    'bg-gray-800'
                  }`} />
                  <span className="text-sm capitalize">{theme}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Language</h3>
            <select
              value={state.appearance.language}
              onChange={(e) => updateAppearanceSettings({ language: e.target.value })}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Font Size</h3>
            <div className="grid grid-cols-3 gap-3">
              {['small', 'medium', 'large'].map((size) => (
                <Button
                  key={size}
                  variant={state.appearance.fontSize === size ? 'default' : 'outline'}
                  onClick={() => updateAppearanceSettings({ fontSize: size as any })}
                  className="capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Animations</h3>
              <p className="text-sm text-muted-foreground">Enable interface animations</p>
            </div>
            <Switch
              checked={state.appearance.animations}
              onCheckedChange={(animations) => updateAppearanceSettings({ animations })}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCurrentSection = () => {
    switch (state.currentSection) {
      case 'notifications':
        return renderNotificationsSection();
      case 'appearance':
        return renderAppearanceSection();
      // Add more sections as needed
      default:
        return renderAccountOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
          {state.currentSection !== 'account' && (
            <p className="text-muted-foreground">
              {settingsMenuItems.find(item => item.section === state.currentSection)?.title}
            </p>
          )}
        </div>
        {state.currentSection === 'account' && (
          <Button variant="outline" size="sm">
            <CogIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderCurrentSection()}
        </motion.div>
      </AnimatePresence>

      {/* Dialogs */}
      <UpgradeDialog />
      <LogoutConfirmation />
    </div>
  );
};

export default ComprehensiveSettings;