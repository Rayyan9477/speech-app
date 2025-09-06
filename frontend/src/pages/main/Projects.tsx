import React from 'react';
import { ProjectManagementProvider } from '../../contexts/ProjectManagementContext';
import EnhancedProjectManagement from '../../components/projects/EnhancedProjectManagement';

const Projects = () => {
  return (
    <ProjectManagementProvider>
      <div className="min-h-screen pb-20 py-6">
        <EnhancedProjectManagement />
      </div>
    </ProjectManagementProvider>
  );
};

export default Projects;