import { Clock, Flame, Users, TrendingUp, Sparkles, CheckCircle2, Twitter, MessageCircle, Send, Rocket, DollarSign, Droplets } from 'lucide-react'
import { Project, ProjectType, ProjectStatus } from '../types/project'

interface ProjectCardProps {
  project: Project
  onSelect?: (projectId: string) => void
  onAction?: (project: Project) => void
  actionLabel?: string
}

export default function ProjectCard({ project, onSelect, onAction, actionLabel }: ProjectCardProps) {
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getProgress = () => {
    const now = new Date().getTime()
    const start = new Date(project.event.startDate).getTime()
    const end = new Date(project.event.endDate).getTime()
    const total = end - start
    const elapsed = now - start
    
    return total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0
  }

  const getStatusBadge = () => {
    const isCompleted = project.status === ProjectStatus.COMPLETED
    const isActive = project.status === ProjectStatus.ACTIVE
    const isUpcoming = project.status === ProjectStatus.UPCOMING

    if (isCompleted) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400">
          <CheckCircle2 size={10} />
          Completed
        </span>
      )
    }
    if (isActive) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0ECB81]/10 border border-[#0ECB81]/30 rounded text-xs text-[#0ECB81]">
          <Sparkles size={10} />
          Active
        </span>
      )
    }
    if (isUpcoming) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
          <Clock size={10} />
          Upcoming
        </span>
      )
    }
    return null
  }

  const renderTokenLaunchMetrics = () => {
    const progress = getProgress()
    const marketCap = parseFloat(project.metrics.totalXlmContributed || '0')
    const holders = project.metrics.totalParticipations || 0
    const totalSupply = parseFloat(project.totalSupply) || 1
    const price = marketCap > 0 ? marketCap / totalSupply : 0

    return (
      <>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Launch Progress</span>
            <span className="text-[#FCD535] font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#0B0E11] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#F7931A] to-[#FCD535] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500">Price</p>
            </div>
            <p className="text-sm font-bold text-white">${price.toFixed(6)}</p>
          </div>
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500">Market Cap</p>
            </div>
            <p className="text-sm font-bold text-white">${(marketCap / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500">Holders</p>
            </div>
            <p className="text-sm font-bold text-white">{holders}</p>
          </div>
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500">Time Left</p>
            </div>
            <p className="text-sm font-bold text-white">{getTimeRemaining(project.event.endDate)}</p>
          </div>
        </div>
      </>
    )
  }

  const renderAirdropMetrics = () => {
    const maxParticipants = Math.floor(parseFloat(project.metrics.totalXlmContributed || '0') / 100) || 1000
    const currentParticipants = project.metrics.totalParticipations || 0
    const participationPercent = (currentParticipants / maxParticipants) * 100
    const totalBurned = parseFloat(project.metrics.totalStarBurned || '0')

    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-gray-500" />
              <p className="text-xs text-gray-500">Time Left</p>
            </div>
            <p className="text-sm font-bold text-white">{getTimeRemaining(project.event.endDate)}</p>
          </div>
          <div className="bg-[#0B0E11]/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={12} className="text-orange-500" />
              <p className="text-xs text-gray-500">STAR Burned</p>
            </div>
            <p className="text-sm font-bold text-[#FCD535]">{totalBurned.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">Participants</span>
            </div>
            <span className="text-xs text-white font-medium">
              {currentParticipants} / {maxParticipants}
            </span>
          </div>
          <div className="relative h-2 bg-[#0B0E11] rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FCD535] to-[#F7931A] rounded-full transition-all"
              style={{ width: `${Math.min(participationPercent, 100)}%` }}
            />
          </div>
        </div>
      </>
    )
  }

  const renderStarBurnMetrics = () => {
    const burnAmount = parseFloat(project.metrics.totalStarBurned || '0')
    const rewards = parseFloat(project.metrics.totalStarDistributed || '0')
    const isCompleted = project.status === ProjectStatus.COMPLETED

    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame size={12} className="text-orange-500" />
            <p className="text-xs text-gray-500">Burn Amount</p>
          </div>
          <p className="text-sm font-bold text-[#FCD535]">{burnAmount.toLocaleString()}</p>
        </div>
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-yellow-500" />
            <p className="text-xs text-gray-500">Rewards</p>
          </div>
          <p className="text-sm font-bold text-white">{rewards.toLocaleString()}</p>
        </div>
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={12} className={isCompleted ? 'text-green-500' : 'text-gray-500'} />
            <p className="text-xs text-gray-500">Status</p>
          </div>
          <p className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {isCompleted ? 'Completed' : 'Active'}
          </p>
        </div>
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={12} className="text-gray-500" />
            <p className="text-xs text-gray-500">Participants</p>
          </div>
          <p className="text-sm font-bold text-white">{project.metrics.totalParticipations}</p>
        </div>
      </div>
    )
  }

  const renderLiquidityMetrics = () => {
    const tvl = parseFloat(project.metrics.totalXlmContributed || '0')
    const volume = parseFloat(project.metrics.totalStarDistributed || '0')
    const apy = 12.5

    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets size={12} className="text-blue-500" />
            <p className="text-xs text-gray-500">TVL</p>
          </div>
          <p className="text-sm font-bold text-white">${(tvl / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-[#0B0E11]/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-green-500" />
            <p className="text-xs text-gray-500">APY</p>
          </div>
          <p className="text-sm font-bold text-green-400">{apy}%</p>
        </div>
        <div className="bg-[#0B0E11]/50 rounded-lg p-3 col-span-2">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={12} className="text-gray-500" />
            <p className="text-xs text-gray-500">24h Volume</p>
          </div>
          <p className="text-sm font-bold text-white">${(volume / 1000).toFixed(1)}K</p>
        </div>
      </div>
    )
  }

  const renderMetrics = () => {
    switch (project.projectType) {
      case ProjectType.TOKEN_LAUNCH:
        return renderTokenLaunchMetrics()
      case ProjectType.AIRDROP:
        return renderAirdropMetrics()
      case ProjectType.STAR_BURN:
        return renderStarBurnMetrics()
      case ProjectType.LIQUIDITY:
        return renderLiquidityMetrics()
      default:
        return null
    }
  }

  const getActionButton = () => {
    const isCompleted = project.status === ProjectStatus.COMPLETED
    const isUpcoming = project.status === ProjectStatus.UPCOMING
    
    let buttonText = actionLabel || 'View Details'
    let icon = <Rocket size={18} />
    
    if (project.projectType === ProjectType.AIRDROP || project.projectType === ProjectType.STAR_BURN) {
      buttonText = 'Burn STAR to Participate'
      icon = <Flame size={18} />
    } else if (project.projectType === ProjectType.TOKEN_LAUNCH) {
      buttonText = 'Trade Now'
      icon = <TrendingUp size={16} />
    } else if (project.projectType === ProjectType.LIQUIDITY) {
      buttonText = 'Add Liquidity'
      icon = <Droplets size={18} />
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onAction?.(project)
        }}
        disabled={isCompleted || isUpcoming}
        className="w-full py-3 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#e6c430] hover:to-[#e68510] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-[#0B0E11] font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FCD535]/20"
      >
        {icon}
        <span>{buttonText}</span>
      </button>
    )
  }

  return (
    <div
      className="group bg-[#1E2329] hover:bg-[#252B32] border border-[#2B3139] hover:border-[#FCD535]/30 rounded-xl transition-all cursor-pointer overflow-hidden"
    >
      <div onClick={() => onSelect?.(project.id)} className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <img 
              src={project.logoUrl || '/stellforge-icon.png'} 
              alt={project.tokenName} 
              className="w-14 h-14 rounded-full border-2 border-[#2B3139] group-hover:border-[#FCD535]/50 transition-all" 
            />
            {project.status === ProjectStatus.ACTIVE && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#FCD535] rounded-full">
                <Sparkles size={10} className="text-[#0B0E11]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base text-white truncate">{project.tokenName}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-gray-500 font-medium">${project.tokenSymbol}</p>
            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{project.description}</p>
          </div>
        </div>

        {renderMetrics()}

        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#2B3139]">
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
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-[#FCD535]/10 rounded-lg transition-all"
            >
              <Send size={14} className="text-gray-500 hover:text-[#FCD535]" />
            </a>
          )}
        </div>
      </div>

      {onAction && (
        <div className="px-5 pb-5">
          {getActionButton()}
        </div>
      )}
    </div>
  )
}
