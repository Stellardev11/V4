import { Search, Sparkles, Users, Clock, Flame, TrendingUp, CheckCircle2, Twitter, MessageCircle, Send } from 'lucide-react'
import { useTokenMarket } from '../context/TokenMarketContext'
import { useState } from 'react'
import BurnStarModal from './BurnStarModal'

interface AirdropProjectsProps {
  onViewProject: (projectId: string) => void
  onCreateProject: () => void
}

export default function AirdropProjects({ onViewProject, onCreateProject }: AirdropProjectsProps) {
  const { airdropProjects } = useTokenMarket()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [burnModalOpen, setBurnModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const getTimeRemaining = (eventEndDate?: string) => {
    if (!eventEndDate) return 'TBA'
    
    const now = new Date().getTime()
    const end = new Date(eventEndDate).getTime()
    const diff = end - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getProjectStats = (project: any) => {
    const maxParticipants = Math.floor(project.marketCap / 100) || 1000
    const currentParticipants = project.totalParticipations || 0
    const isCompleted = currentParticipants >= maxParticipants
    const participationPercent = (currentParticipants / maxParticipants) * 100

    return {
      maxParticipants,
      currentParticipants,
      isCompleted,
      participationPercent
    }
  }

  const filteredProjects = airdropProjects
    .filter(project => {
      const stats = getProjectStats(project)
      if (filter === 'active') return !stats.isCompleted
      if (filter === 'completed') return stats.isCompleted
      return true
    })
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleBurnClick = (project: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProject(project)
    setBurnModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">STAR Burn Projects</h1>
            <p className="text-sm text-gray-400 mt-1">Burn STAR to participate in token airdrops</p>
          </div>
          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded-lg text-sm transition-all"
          >
            Create Project
          </button>
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
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'active'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'completed'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project)
            const timeRemaining = getTimeRemaining(project.eventEndDate)
            const totalBurned = project.totalStarBurned || 0
            
            return (
              <div
                key={project.id}
                className="group bg-[#1E2329] hover:bg-[#252B32] border border-[#2B3139] hover:border-[#FCD535]/30 rounded-xl transition-all cursor-pointer overflow-hidden"
              >
                {/* Card Header */}
                <div onClick={() => onViewProject(project.id)} className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={project.image} 
                        alt={project.name} 
                        className="w-14 h-14 rounded-full border-2 border-[#2B3139] group-hover:border-[#FCD535]/50 transition-all" 
                      />
                      {!stats.isCompleted && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-[#FCD535] rounded-full">
                          <Sparkles size={10} className="text-[#0B0E11]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-white truncate">{project.name}</h3>
                        {stats.isCompleted ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400">
                            <CheckCircle2 size={10} />
                            Full
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0ECB81]/10 border border-[#0ECB81]/30 rounded text-xs text-[#0ECB81]">
                            <Sparkles size={10} />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">${project.symbol}</p>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{project.description}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} className="text-gray-500" />
                        <p className="text-xs text-gray-500">Time Left</p>
                      </div>
                      <p className="text-sm font-bold text-white">{timeRemaining}</p>
                    </div>
                    <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Flame size={12} className="text-orange-500" />
                        <p className="text-xs text-gray-500">STAR Burned</p>
                      </div>
                      <p className="text-sm font-bold text-[#FCD535]">{totalBurned.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Participants Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Participants</span>
                      </div>
                      <span className="text-xs text-white font-medium">
                        {stats.currentParticipants} / {stats.maxParticipants}
                      </span>
                    </div>
                    <div className="relative h-2 bg-[#0B0E11] rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FCD535] to-[#F7931A] rounded-full transition-all"
                        style={{ width: `${Math.min(stats.participationPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#2B3139]">
                    {project.twitter && (
                      <a
                        href={project.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-[#FCD535]/10 rounded-lg transition-all"
                      >
                        <Twitter size={14} className="text-gray-500 hover:text-[#FCD535]" />
                      </a>
                    )}
                    {project.discord && (
                      <a
                        href={project.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-[#FCD535]/10 rounded-lg transition-all"
                      >
                        <MessageCircle size={14} className="text-gray-500 hover:text-[#FCD535]" />
                      </a>
                    )}
                    <a
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-[#FCD535]/10 rounded-lg transition-all"
                    >
                      <Send size={14} className="text-gray-500 hover:text-[#FCD535]" />
                    </a>
                  </div>
                </div>

                {/* Burn Button */}
                <div className="px-5 pb-5">
                  <button
                    onClick={(e) => handleBurnClick(project, e)}
                    disabled={stats.isCompleted}
                    className="w-full py-3 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#e6c430] hover:to-[#e68510] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-[#0B0E11] font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FCD535]/20"
                  >
                    <Flame size={18} />
                    <span>Burn STAR to Participate</span>
                    <TrendingUp size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-[#1E2329] rounded-2xl mb-6">
              <Sparkles className="text-gray-500" size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No {filter} projects found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search criteria' : 'Be the first to create a STAR burn project'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateProject}
                className="px-8 py-3 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-bold rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Flame size={20} />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Burn Modal */}
      {selectedProject && (
        <BurnStarModal
          isOpen={burnModalOpen}
          onClose={() => {
            setBurnModalOpen(false)
            setSelectedProject(null)
          }}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          projectSymbol={selectedProject.symbol}
        />
      )}
    </div>
  )
}
