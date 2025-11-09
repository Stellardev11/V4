import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Project, ProjectType, ProjectStatus } from '../types/project'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
  projectType?: ProjectType
  onSelectProject?: (projectId: string) => void
  onProjectAction?: (project: Project) => void
  onCreateProject?: () => void
  title?: string
  subtitle?: string
  showCreateButton?: boolean
  actionLabel?: string
}

export default function ProjectGrid({
  projects,
  projectType,
  onSelectProject,
  onProjectAction,
  onCreateProject,
  title,
  subtitle,
  showCreateButton = false,
  actionLabel,
}: ProjectGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('active')

  const filteredProjects = projects
    .filter(project => {
      if (projectType && project.projectType !== projectType) return false
      
      if (filter === 'active') return project.status === ProjectStatus.ACTIVE
      if (filter === 'completed') return project.status === ProjectStatus.COMPLETED
      if (filter === 'upcoming') return project.status === ProjectStatus.UPCOMING
      return true
    })
    .filter(project =>
      project.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const activeCount = projects.filter(p => p.status === ProjectStatus.ACTIVE).length
  const completedCount = projects.filter(p => p.status === ProjectStatus.COMPLETED).length
  const upcomingCount = projects.filter(p => p.status === ProjectStatus.UPCOMING).length

  const getTypeLabel = () => {
    switch (projectType) {
      case ProjectType.TOKEN_LAUNCH:
        return 'Token Launches'
      case ProjectType.AIRDROP:
        return 'STAR Burn Projects'
      case ProjectType.STAR_BURN:
        return 'STAR Burn Events'
      case ProjectType.LIQUIDITY:
        return 'Liquidity Pools'
      default:
        return 'All Projects'
    }
  }

  const getTypeDescription = () => {
    switch (projectType) {
      case ProjectType.TOKEN_LAUNCH:
        return 'Trade tokens on bonding curves before DEX graduation'
      case ProjectType.AIRDROP:
        return 'Burn STAR to participate in token airdrops'
      case ProjectType.STAR_BURN:
        return 'Burn STAR to earn rewards and participate in events'
      case ProjectType.LIQUIDITY:
        return 'Provide liquidity and earn rewards'
      default:
        return 'Browse all active projects'
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{title || getTypeLabel()}</h1>
            <p className="text-sm text-gray-400 mt-1">{subtitle || getTypeDescription()}</p>
          </div>
          {showCreateButton && onCreateProject && (
            <button
              onClick={onCreateProject}
              className="px-4 py-2 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded-lg text-sm transition-all"
            >
              Create Project
            </button>
          )}
        </div>
          
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E2329] border border-[#2B3139] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FCD535] transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'active'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'completed'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'upcoming'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              onAction={onProjectAction}
              actionLabel={actionLabel}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-[#1E2329] rounded-2xl mb-6">
              <Sparkles className="text-gray-500" size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No {filter} projects found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search criteria' : `Be the first to create a ${getTypeLabel().toLowerCase()} project`}
            </p>
            {!searchQuery && showCreateButton && onCreateProject && (
              <button
                onClick={onCreateProject}
                className="px-8 py-3 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-bold rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Sparkles size={20} />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
