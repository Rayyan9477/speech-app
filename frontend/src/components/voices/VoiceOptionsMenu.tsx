import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { useVoiceManagement } from '../../contexts/VoiceManagementContext';
import {
  PlayIcon,
  PencilIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const VoiceOptionsMenu: React.FC = () => {
  const {
    state,
    hideVoiceOptions,
    showDeleteConfirmation,
    playVoice,
    duplicateVoice,
    shareVoice,
    exportVoice
  } = useVoiceManagement();

  if (!state.showVoiceOptions || !state.selectedVoice) {
    return null;
  }

  const menuItems = [
    {
      icon: PlayIcon,
      label: 'Play Preview',
      action: () => {
        playVoice(state.selectedVoice!);
        hideVoiceOptions();
      }
    },
    {
      icon: ChartBarIcon,
      label: 'View Analytics',
      action: () => {
        console.log('View analytics for:', state.selectedVoice!.name);
        hideVoiceOptions();
      }
    },
    {
      icon: PencilIcon,
      label: 'Edit Voice',
      action: () => {
        console.log('Edit voice:', state.selectedVoice!.name);
        hideVoiceOptions();
      }
    },
    {
      icon: ShareIcon,
      label: 'Share Voice',
      action: () => {
        shareVoice(state.selectedVoice!);
        hideVoiceOptions();
      }
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Duplicate',
      action: () => {
        duplicateVoice(state.selectedVoice!);
        hideVoiceOptions();
      }
    },
    {
      icon: ArrowDownTrayIcon,
      label: 'Export',
      action: () => {
        exportVoice(state.selectedVoice!);
        hideVoiceOptions();
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Voice',
      action: () => {
        showDeleteConfirmation(state.selectedVoice!);
      },
      destructive: true
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={hideVoiceOptions}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute bottom-4 left-4 right-4 max-w-sm mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden shadow-xl">
            {/* Voice Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {state.selectedVoice.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{state.selectedVoice.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.selectedVoice.gender} • {state.selectedVoice.ageGroup} • {state.selectedVoice.usageCount} uses
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-accent transition-colors ${
                    item.destructive 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950' 
                      : 'text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceOptionsMenu;