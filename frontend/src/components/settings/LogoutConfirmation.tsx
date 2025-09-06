import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useSettings } from '../../contexts/SettingsContext';
import {
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LogoutConfirmation: React.FC = () => {
  const { state, dispatch, logout } = useSettings();

  if (!state.showLogoutConfirmation) {
    return null;
  }

  const handleConfirmLogout = async () => {
    await logout();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => dispatch({ type: 'HIDE_LOGOUT_CONFIRMATION' })}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6 shadow-xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>

              {/* Title and Message */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Logout Confirmation
              </h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'HIDE_LOGOUT_CONFIRMATION' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoutConfirmation;