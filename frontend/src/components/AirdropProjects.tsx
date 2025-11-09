import { useState } from 'react'
import { useProjectsByType } from '../hooks/useProjects'
import { ProjectType, Project } from '../types/project'
import ProjectGrid from './ProjectGrid'
import BurnStarModal from './BurnStarModal'

interface AirdropProjectsProps {
  onViewProject: (projectId: string) => void
  onCreateProject: () => void
}

export default function AirdropProjects({ onViewProject, onCreateProject }: AirdropProjectsProps) {
  const { data: projects = [], isLoading } = useProjectsByType(ProjectType.AIRDROP)
  const [burnModalOpen, setBurnModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectAction = (project: Project) => {
    setSelectedProject(project)
    setBurnModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading projects...</div>
      </div>
    )
  }

  return (
    <>
      <ProjectGrid
        projects={projects}
        projectType={ProjectType.AIRDROP}
        onSelectProject={onViewProject}
        onProjectAction={handleProjectAction}
        onCreateProject={onCreateProject}
        showCreateButton={true}
      />

      {selectedProject && (
        <BurnStarModal
          isOpen={burnModalOpen}
          onClose={() => {
            setBurnModalOpen(false)
            setSelectedProject(null)
          }}
          projectId={selectedProject.id}
          projectName={selectedProject.tokenName}
          projectSymbol={selectedProject.tokenSymbol}
        />
      )}
    </>
  )
}
