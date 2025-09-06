import React from 'react';
import { SettingsProvider } from '../../contexts/SettingsContext';
import ComprehensiveSettings from '../../components/settings/ComprehensiveSettings';

const Settings = () => {
  return (
    <SettingsProvider>
      <div className="min-h-screen pb-20 py-6">
        <ComprehensiveSettings />
      </div>
    </SettingsProvider>
  );
};

export default Settings;