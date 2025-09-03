import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useTheme } from '../../lib/theme-provider';
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CloudIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentTextIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    projectUpdates: true,
    marketing: false,
    security: true,
    system: false
  });
  const [audioQuality, setAudioQuality] = useState('high');
  const [autoSave, setAutoSave] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const settingsSections = [
    {
      title: 'Account',
      icon: UserIcon,
      items: [
        {
          title: 'Profile Information',
          description: 'Update your personal details and avatar',
          action: 'profile',
          custom: true
        },
        {
          title: 'Change Password',
          description: 'Update your account password',
          action: 'password',
          custom: true
        },
        {
          title: 'Email & Phone',
          description: 'Manage contact information',
          action: 'contact'
        },
        {
          title: 'Connected Accounts',
          description: 'Social media and third-party connections',
          action: 'connected-accounts'
        },
        {
          title: 'Data & Privacy',
          description: 'Download or delete your data',
          action: 'data-privacy'
        }
      ]
    },
    {
      title: 'Subscription',
      icon: CreditCardIcon,
      items: [
        {
          title: 'Current Plan',
          description: 'Voicify Pro - Annual',
          action: 'current-plan',
          badge: 'Active',
          custom: true
        },
        {
          title: 'Billing History',
          description: 'View past invoices and payments',
          action: 'billing-history'
        },
        {
          title: 'Payment Methods',
          description: 'Manage credit cards and payment options',
          action: 'payment-methods'
        },
        {
          title: 'Usage & Limits',
          description: 'Monitor your plan usage',
          action: 'usage-limits',
          custom: true
        }
      ]
    },
    {
      title: 'Preferences',
      icon: Cog6ToothIcon,
      items: [
        {
          title: 'Appearance',
          description: 'Theme, language, and display settings',
          action: 'appearance',
          custom: true
        },
        {
          title: 'Audio & Voice',
          description: 'Default voice, quality, and output settings',
          action: 'audio-voice',
          custom: true
        },
        {
          title: 'Project Settings',
          description: 'Auto-save, export preferences, and templates',
          action: 'project-settings',
          custom: true
        },
        {
          title: 'Keyboard Shortcuts',
          description: 'Customize keyboard shortcuts',
          action: 'shortcuts'
        }
      ]
    },
    {
      title: 'Devices & Sessions',
      icon: DevicePhoneMobileIcon,
      items: [
        {
          title: 'Active Sessions',
          description: 'Manage devices logged into your account',
          action: 'active-sessions',
          custom: true
        },
        {
          title: 'Download Apps',
          description: 'Get Voicify on other devices',
          action: 'download-apps'
        },
        {
          title: 'Device Preferences',
          description: 'Configure device-specific settings',
          action: 'device-preferences'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      items: [
        {
          title: 'Email Notifications',
          description: 'Receive updates via email',
          action: 'email-notifications',
          custom: true
        },
        {
          title: 'Push Notifications',
          description: 'Get notified on your device',
          action: 'push-notifications',
          custom: true
        },
        {
          title: 'Project Updates',
          description: 'Notifications about your projects',
          action: 'project-notifications',
          custom: true
        },
        {
          title: 'Security Alerts',
          description: 'Important security notifications',
          action: 'security-notifications',
          custom: true
        },
        {
          title: 'Marketing Updates',
          description: 'Product updates and promotions',
          action: 'marketing-notifications',
          custom: true
        }
      ]
    },
    {
      title: 'Security',
      icon: ShieldIcon,
      items: [
        {
          title: 'Two-Factor Authentication',
          description: 'Add extra security to your account',
          action: '2fa',
          custom: true
        },
        {
          title: 'Login Activity',
          description: 'Review recent login attempts',
          action: 'login-activity'
        },
        {
          title: 'API Keys',
          description: 'Manage API access tokens',
          action: 'api-keys'
        },
        {
          title: 'Privacy Settings',
          description: 'Control data sharing and analytics',
          action: 'privacy-settings'
        }
      ]
    },
    {
      title: 'Audio & Voice',
      icon: SpeakerWaveIcon,
      items: [
        {
          title: 'Voice Settings',
          description: 'Configure voice preferences',
          action: 'voice-settings'
        },
        {
          title: 'Default Voice',
          description: 'Set your default voice',
          action: 'default-voice',
          value: 'Emma'
        },
        {
          title: 'Audio Quality',
          description: 'Set default audio quality',
          action: 'audio-quality',
          custom: true
        },
        {
          title: 'Output Settings',
          description: 'Configure audio output preferences',
          action: 'output-settings'
        },
        {
          title: 'Voice Cloning',
          description: 'Manage your custom voice clones',
          action: 'voice-cloning'
        }
      ]
    },
    {
      title: 'Data & Storage',
      icon: CloudIcon,
      items: [
        {
          title: 'Storage Usage',
          description: 'Monitor your data usage and limits',
          action: 'storage-usage',
          custom: true
        },
        {
          title: 'Export Data',
          description: 'Download your data and projects',
          action: 'export-data'
        },
        {
          title: 'Data Retention',
          description: 'Configure automatic data cleanup',
          action: 'data-retention'
        },
        {
          title: 'Backup Settings',
          description: 'Manage automatic backups',
          action: 'backup-settings'
        }
      ]
    },
    {
      title: 'Help & Support',
      icon: QuestionMarkCircleIcon,
      items: [
        {
          title: 'Help Center',
          description: 'Find answers to common questions',
          action: 'help'
        },
        {
          title: 'Video Tutorials',
          description: 'Learn with step-by-step guides',
          action: 'tutorials'
        },
        {
          title: 'Contact Support',
          description: 'Get help from our team',
          action: 'contact'
        },
        {
          title: 'Community Forum',
          description: 'Connect with other users',
          action: 'community'
        },
        {
          title: 'Feedback & Ideas',
          description: 'Share your thoughts with us',
          action: 'feedback'
        },
        {
          title: 'System Status',
          description: 'Check service availability',
          action: 'status'
        }
      ]
    }
  ];

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleAudioQualityChange = (quality: string) => {
    setAudioQuality(quality);
  };

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
        className="py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Customize your Voicify experience</p>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/api/placeholder/64/64" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  aria-label="Change profile picture"
                  title="Upload new profile picture"
                >
                  <PhotoIcon className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">John Doe</h3>
                <p className="text-muted-foreground">john.doe@example.com</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Pro Plan
                  </Badge>
                  <span className="text-xs text-muted-foreground">Since Dec 2023</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveSection('profile')}>
                Edit Profile
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">247</div>
              <div className="text-xs text-muted-foreground">Minutes Used</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">89</div>
              <div className="text-xs text-muted-foreground">Voices Tried</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </Card>
          </div>
        </motion.div>

        {/* Profile Edit Modal */}
        {activeSection === 'profile' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection('overview')}
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/api/placeholder/80/80" />
                      <AvatarFallback className="text-xl">JD</AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      aria-label="Upload profile picture"
                      title="Choose a new profile picture"
                    >
                      <PhotoIcon className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    className={`w-full h-20 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                    placeholder="Tell us about yourself..."
                    defaultValue="Voice synthesis enthusiast and content creator."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1" onClick={() => setActiveSection('overview')}>
                    Save Changes
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setActiveSection('overview')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Password Change Modal */}
        {activeSection === 'password' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection('overview')}
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1" onClick={() => setActiveSection('overview')}>
                    Update Password
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setActiveSection('overview')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div key={section.title} variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }`}>
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                </div>

                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.title}>
                      {item.custom ? (
                        <div className="flex items-center justify-between py-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="ml-4">
                            {item.action === 'appearance' && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={handleThemeToggle}
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full"
                                >
                                  {theme === 'dark' ? (
                                    <SunIcon className="w-4 h-4" />
                                  ) : (
                                    <MoonIcon className="w-4 h-4" />
                                  )}
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                  {theme === 'dark' ? 'Dark' : 'Light'}
                                </span>
                              </div>
                            )}
                            {item.action === 'audio-quality' && (
                              <select
                                value={audioQuality}
                                onChange={(e) => handleAudioQualityChange(e.target.value)}
                                aria-label="Select audio quality"
                                title="Choose default audio quality"
                                className={`px-3 py-1 rounded-lg border text-sm ${
                                  theme === 'dark'
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-white border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="ultra">Ultra</option>
                              </select>
                            )}
                            {item.action === 'email-notifications' && (
                              <Switch
                                checked={notifications.email}
                                onCheckedChange={() => handleNotificationToggle('email')}
                              />
                            )}
                            {item.action === 'push-notifications' && (
                              <Switch
                                checked={notifications.push}
                                onCheckedChange={() => handleNotificationToggle('push')}
                              />
                            )}
                            {item.action === 'project-notifications' && (
                              <Switch
                                checked={notifications.projectUpdates}
                                onCheckedChange={() => handleNotificationToggle('projectUpdates')}
                              />
                            )}
                            {item.action === 'security-notifications' && (
                              <Switch
                                checked={notifications.security}
                                onCheckedChange={() => handleNotificationToggle('security')}
                              />
                            )}
                            {item.action === 'marketing-notifications' && (
                              <Switch
                                checked={notifications.system}
                                onCheckedChange={() => handleNotificationToggle('system')}
                              />
                            )}
                            {item.action === 'auto-save' && (
                              <Switch
                                checked={autoSave}
                                onCheckedChange={setAutoSave}
                              />
                            )}
                            {item.action === 'current-plan' && (
                              <div className="flex items-center space-x-2">
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                  {item.badge}
                                </Badge>
                                <span className="text-sm text-muted-foreground">Renewal: Dec 15</span>
                              </div>
                            )}
                            {item.action === 'usage-limits' && (
                              <div className="text-sm text-muted-foreground">
                                247 min / 10,000 min used
                              </div>
                            )}
                            {item.action === 'active-sessions' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-muted-foreground">3 devices</span>
                              </div>
                            )}
                            {item.action === 'storage-usage' && (
                              <div className="text-sm text-muted-foreground">
                                2.4 GB / 50 GB used
                              </div>
                            )}
                            {item.action === '2fa' && (
                              <div className="flex items-center space-x-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-muted-foreground">Not enabled</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (item.action === 'profile' || item.action === 'password') {
                              setActiveSection(item.action);
                            }
                          }}
                          className="flex items-center justify-between w-full py-3 hover:bg-accent/50 rounded-lg px-2 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1 text-left">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-foreground">{item.title}</h3>
                                {item.badge && (
                                  <Badge variant="premium" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              {item.value && (
                                <p className="text-sm text-primary mt-1">{item.value}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Usage Stats */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <h3 className="font-semibold text-foreground mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">247</div>
                <div className="text-sm text-muted-foreground">Minutes Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">12</div>
                <div className="text-sm text-muted-foreground">Projects Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">89</div>
                <div className="text-sm text-muted-foreground">Voices Tried</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">5</div>
                <div className="text-sm text-muted-foreground">Premium Voices</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Account Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Export Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Sign Out
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Version 2.1.0 • Last updated 2 days ago
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;
