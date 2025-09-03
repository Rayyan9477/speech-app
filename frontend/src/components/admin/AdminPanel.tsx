import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { AdminDashboard } from './AdminDashboard';
import { Button } from '../ui/button';

interface AdminPanelProps {
  onClose?: () => void;
}

type AdminView = 'dashboard' | 'users' | 'settings' | 'analytics';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const { user, logout } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this panel.</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const navigationItems: Array<{ key: AdminView; label: string; icon: string }> = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'users', label: 'User Management', icon: '👥' },
    { key: 'settings', label: 'System Settings', icon: '⚙️' },
    { key: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <div className="p-6">System Settings (Coming Soon)</div>;
      case 'analytics':
        return <div className="p-6">Analytics (Coming Soon)</div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">Welcome, {user.first_name}</p>
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
              Exit Admin
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