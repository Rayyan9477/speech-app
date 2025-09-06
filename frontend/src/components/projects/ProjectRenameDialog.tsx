import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useProjectManagement } from '../../contexts/ProjectManagementContext';

const ProjectRenameDialog: React.FC = () => {
  const {
    state,
    hideRenameDialog,
    updateProject
  } = useProjectManagement();

  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.showRenameDialog && state.selectedProject) {
      setNewTitle(state.selectedProject.title);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [state.showRenameDialog, state.selectedProject]);

  if (!state.showRenameDialog || !state.selectedProject) {
    return null;
  }

  const handleSave = () => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle && trimmedTitle !== state.selectedProject!.title) {
      updateProject(state.selectedProject!.id, { title: trimmedTitle });
    }
    hideRenameDialog();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      hideRenameDialog();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={hideRenameDialog}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6 shadow-xl">
            <div className="space-y-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground">
                Rename
              </h3>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Project Title
                </label>
                <Input
                  ref={inputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter project title"
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={hideRenameDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!newTitle.trim() || newTitle.trim() === state.selectedProject?.title}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectRenameDialog;