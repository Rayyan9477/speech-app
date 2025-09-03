import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from './UserProfile';
import { UserSessions } from './UserSessions';
import { UserSettings } from './UserSettings';
import { Button } from '../ui/button';

interface UserDashboardProps {
  onClose?: () => void;
}

type UserView = 'profile' | 'sessions' | 'settings' | 'activity';

export const UserDashboard: React.FC<UserDashboardProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<UserView>('profile');
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const navigationItems: Array<{ key: UserView; label: string; icon: string }> = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'sessions', label: 'My Sessions', icon: '🎵' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'activity', label: 'Activity', icon: '📊' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <UserProfile />;
      case 'sessions':
        return <UserSessions />;
      case 'settings':
        return <UserSettings />;
      case 'activity':
        return <div className="p-6">Activity History (Coming Soon)</div>;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                currentView === item.key 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex justify-between">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Back to App
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};