import { useProjectsByType } from '../hooks/useProjects'
import { ProjectType } from '../types/project'
import ProjectGrid from './ProjectGrid'

interface LaunchedTokensProps {
  onViewToken: (tokenId: string) => void
}

export default function LaunchedTokens({ onViewToken }: LaunchedTokensProps) {
  const { data: projects = [], isLoading } = useProjectsByType(ProjectType.TOKEN_LAUNCH)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading token launches...</div>
      </div>
    )
  }

  return (
    <ProjectGrid
      projects={projects}
      projectType={ProjectType.TOKEN_LAUNCH}
      onSelectProject={onViewToken}
      title="Token Launch Markets"
      subtitle="Trade tokens on bonding curves before DEX graduation"
      actionLabel="Trade Now"
    />
  )
}
