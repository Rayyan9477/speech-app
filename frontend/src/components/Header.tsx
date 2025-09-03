import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { AdminPanel } from './admin/AdminPanel';
import { UserDashboard } from './user/UserDashboard';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800">
              🎤 AI Speech App
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                Home
              </Link>
              
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    </div>
                    <span className="hidden md:inline">{user?.first_name} {user?.last_name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          Signed in as <strong>{user?.username}</strong>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserDashboard(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Dashboard
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setShowAdminPanel(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Panel
                          </button>
                        )}
                        <hr />
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modals and Panels */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {showAdminPanel && (
        <div className="fixed inset-0 z-50 bg-white">
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        </div>
      )}

      {showUserDashboard && (
        <div className="fixed inset-0 z-50 bg-white">
          <UserDashboard onClose={() => setShowUserDashboard(false)} />
        </div>
      )}
    </>
  );
};

export default Header;

