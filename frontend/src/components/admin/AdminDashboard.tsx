import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/card';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  voiceClones: number;
  recentActivity: Array<{
    id: string;
    type: string;
    user: string;
    timestamp: string;
    description: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    voiceClones: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user stats
      const usersResponse = await fetch('http://localhost:8000/api/v1/auth/admin/users?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        const activeUsers = users.filter((user: any) => user.status === 'active').length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers,
          // Simulate other stats for now
          totalSessions: Math.floor(users.length * 1.5),
          voiceClones: Math.floor(users.length * 0.3),
          recentActivity: [
            {
              id: '1',
              type: 'user_registered',
              user: 'New User',
              timestamp: new Date().toISOString(),
              description: 'New user registered',
            },
            {
              id: '2',
              type: 'voice_clone_created',
              user: 'John Doe',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              description: 'Created new voice clone',
            },
            {
              id: '3',
              type: 'session_started',
              user: 'Jane Smith',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              description: 'Started new audio session',
            },
          ],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return '👤';
      case 'voice_clone_created': return '🎤';
      case 'session_started': return '▶️';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Voice Clones</p>
              <p className="text-3xl font-bold text-purple-600">{stats.voiceClones}</p>
            </div>
            <div className="text-3xl">🎤</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-600">
                  {activity.user} • {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {stats.recentActivity.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
            <p className="font-medium text-gray-900">API Server</p>
            <p className="text-sm text-green-600">Online</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
            <p className="font-medium text-gray-900">Database</p>
            <p className="text-sm text-green-600">Connected</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
            </div>
            <p className="font-medium text-gray-900">Storage</p>
            <p className="text-sm text-yellow-600">85% Used</p>
          </div>
        </div>
      </Card>
    </div>
  );
};