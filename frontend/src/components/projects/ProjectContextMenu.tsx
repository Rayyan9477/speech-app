import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { useProjectManagement } from '../../contexts/ProjectManagementContext';
import {
  PlayIcon,
  PencilIcon,
  ArrowPathIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ProjectContextMenu: React.FC = () => {
  const {
    state,
    hideContextMenu,
    showDeleteConfirmation,
    showRenameDialog,
    playProject,
    editProject,
    shareProject,
    duplicateProject,
    exportProject
  } = useProjectManagement();

  if (!state.showContextMenu || !state.selectedProject) {
    return null;
  }

  const menuItems = [
    {
      icon: PlayIcon,
      label: 'Play',
      action: () => {
        playProject(state.selectedProject!);
        hideContextMenu();
      }
    },
    {
      icon: PencilIcon,
      label: 'Edit',
      action: () => {
        editProject(state.selectedProject!);
        hideContextMenu();
      }
    },
    {
      icon: ArrowPathIcon,
      label: 'Rename',
      action: () => {
        showRenameDialog(state.selectedProject!);
      }
    },
    {
      icon: ShareIcon,
      label: 'Share',
      action: () => {
        shareProject(state.selectedProject!);
        hideContextMenu();
      }
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Duplicate',
      action: () => {
        duplicateProject(state.selectedProject!);
        hideContextMenu();
      }
    },
    {
      icon: ArrowDownTrayIcon,
      label: 'Export',
      action: () => {
        exportProject(state.selectedProject!);
        hideContextMenu();
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      action: () => {
        showDeleteConfirmation(state.selectedProject!);
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
        className="fixed inset-0 z-50"
        onClick={hideContextMenu}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'absolute',
            left: Math.min(state.contextMenuPosition.x, window.innerWidth - 200),
            top: Math.min(state.contextMenuPosition.y, window.innerHeight - 300),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="py-2 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent transition-colors ${
                  item.destructive 
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950' 
                    : 'text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectContextMenu;