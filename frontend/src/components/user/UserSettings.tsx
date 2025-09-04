import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export const UserSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(user?.settings || {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      processing_complete: true,
      new_features: false,
    },
    privacy: {
      auto_delete_files: false,
      auto_delete_days: 30,
      allow_analytics: true,
    },
    processing: {
      default_voice_model: 'default',
      auto_translate: false,
      default_target_language: 'es',
      audio_quality: 'high',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await updateUser({ settings });
      setSuccess('Settings saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (path: string[], value: any) => {
    setSettings((prev: typeof settings) => {
      const newSettings = { ...prev } as typeof settings;
      let current: any = newSettings;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-md ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
            {error || success}
          </p>
        </div>
      )}

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="flex space-x-4">
              {['light', 'dark', 'auto'].map((theme) => (
                <label key={theme} className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={(e) => updateSetting(['theme'], e.target.value)}
                    className="mr-2"
                    aria-label={`Theme: ${theme}`}
                  />
                  <span className="capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="display-language-select">
              Display Language
            </label>
            <select
              id="display-language-select"
              value={settings.language}
              onChange={(e) => updateSetting(['language'], e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateSetting(['notifications', 'email'], e.target.checked)}
                className="sr-only peer"
                aria-label="Email Notifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Processing Complete</p>
              <p className="text-sm text-gray-500">Notify when audio processing finishes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.processing_complete}
                onChange={(e) => updateSetting(['notifications', 'processing_complete'], e.target.checked)}
                className="sr-only peer"
                aria-label="Processing Complete Notifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Features</p>
              <p className="text-sm text-gray-500">Get notified about new features and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.new_features}
                onChange={(e) => updateSetting(['notifications', 'new_features'], e.target.checked)}
                className="sr-only peer"
                aria-label="New Features Notifications"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-delete Files</p>
              <p className="text-sm text-gray-500">Automatically delete uploaded files after processing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.auto_delete_files}
                onChange={(e) => updateSetting(['privacy', 'auto_delete_files'], e.target.checked)}
                className="sr-only peer"
                aria-label="Auto-delete Files"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.privacy.auto_delete_files && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="auto-delete-days-select">
                Delete files after (days)
              </label>
              <select
                id="auto-delete-days-select"
                value={settings.privacy.auto_delete_days}
                onChange={(e) => updateSetting(['privacy', 'auto_delete_days'], parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">Help improve the service by sharing anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.allow_analytics}
                onChange={(e) => updateSetting(['privacy', 'allow_analytics'], e.target.checked)}
                className="sr-only peer"
                aria-label="Analytics"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Processing Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Preferences</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="default-voice-model-select">
              Default Voice Model
            </label>
            <select
              id="default-voice-model-select"
              value={settings.processing.default_voice_model}
              onChange={(e) => updateSetting(['processing', 'default_voice_model'], e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default Voice</option>
              <option value="natural">Natural Voice</option>
              <option value="expressive">Expressive Voice</option>
              <option value="professional">Professional Voice</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-translate</p>
              <p className="text-sm text-gray-500">Automatically translate transcribed text</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.processing.auto_translate}
                onChange={(e) => updateSetting(['processing', 'auto_translate'], e.target.checked)}
                className="sr-only peer"
                aria-label="Auto-translate"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.processing.auto_translate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="default-target-language-select">
                Default Target Language
              </label>
              <select
                id="default-target-language-select"
                value={settings.processing.default_target_language}
                onChange={(e) => updateSetting(['processing', 'default_target_language'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Quality
            </label>
            <div className="flex space-x-4">
              {['standard', 'high', 'premium'].map((quality) => (
                <label key={quality} className="flex items-center">
                  <input
                    type="radio"
                    name="audio_quality"
                    value={quality}
                    checked={settings.processing.audio_quality === quality}
                    onChange={(e) => updateSetting(['processing', 'audio_quality'], e.target.value)}
                    className="mr-2"
                    aria-label={`Audio Quality: ${quality}`}
                  />
                  <span className="capitalize">{quality}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher quality settings take longer to process but produce better results
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};