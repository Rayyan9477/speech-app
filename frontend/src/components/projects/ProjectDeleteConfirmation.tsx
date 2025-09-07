import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useProjectManagement } from '../../contexts/ProjectManagementContext';
import {
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const ProjectDeleteConfirmation: React.FC = () => {
  const {
    state,
    hideDeleteConfirmation,
    deleteProject
  } = useProjectManagement();

  if (!state.showDeleteConfirmation || !state.selectedProject) {
    return null;
  }

  const handleConfirmDelete = () => {
    if (state.selectedProject) {
      deleteProject(state.selectedProject.id);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={hideDeleteConfirmation}
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
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>

              {/* Title and Message */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Project?
              </h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete &quot;{state.selectedProject.title}&quot;? 
                This action cannot be undone and will permanently remove the project and all its data.
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={hideDeleteConfirmation}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectDeleteConfirmation;