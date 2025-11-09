import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { useProjects } from '../hooks/useProjects'
import { Project, ProjectType } from '../types/project'

interface TokenData {
  id: string
  name: string
  symbol: string
  image: string
  marketCap: number
  price: number
  change24h: number
  volume24h: number
  holders: number
  launchProgress: number
  creator: string
  description: string
  type: 'launched' | 'airdrop'
  createdAt: string
  status?: 'active' | 'upcoming' | 'completed'
  twitter?: string
  discord?: string
  totalStarBurned?: number
  eventEndDate?: string
  totalParticipations?: number
}

interface TokenMarketContextType {
  tokens: TokenData[]
  selectedToken: TokenData | null
  setSelectedToken: (token: TokenData | null) => void
  trendingTokens: TokenData[]
  launchedTokens: TokenData[]
  airdropProjects: TokenData[]
  isLoading: boolean
  error: Error | null
}

const TokenMarketContext = createContext<TokenMarketContextType | undefined>(undefined)

function mapProjectToTokenData(project: Project): TokenData {
  const isLaunched = project.features.tokenCreated || project.status === 'completed'
  const totalSupplyNum = parseFloat(project.totalSupply) || 1000000
  const xlmContributed = parseFloat(project.metrics.totalXlmContributed) || 0
  const estimatedPrice = xlmContributed > 0 ? xlmContributed / totalSupplyNum : 0.0001
  const estimatedMarketCap = estimatedPrice * totalSupplyNum
  
  const now = new Date().getTime()
  const endDate = new Date(project.event.endDate).getTime()
  const startDate = new Date(project.event.startDate).getTime()
  const totalDuration = endDate - startDate
  const elapsed = now - startDate
  const progress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0

  return {
    id: project.id,
    name: project.tokenName,
    symbol: project.tokenSymbol,
    image: project.logoUrl || '/stellforge-icon.png',
    marketCap: estimatedMarketCap,
    price: estimatedPrice,
    change24h: 0,
    volume24h: xlmContributed,
    holders: project.metrics.totalParticipations || 0,
    launchProgress: isLaunched ? 100 : progress,
    creator: project.creatorWalletAddress,
    description: project.description,
    type: project.projectType === ProjectType.AIRDROP ? 'airdrop' : 'launched',
    createdAt: new Date(project.createdAt).toLocaleString(),
    status: project.status,
    twitter: project.twitter,
    discord: project.discord,
    totalStarBurned: parseFloat(project.metrics.totalStarBurned) || 0,
    eventEndDate: project.event.endDate,
    totalParticipations: project.metrics.totalParticipations || 0,
  }
}

export function TokenMarketProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const { data: projects, isLoading, error } = useProjects()

  const tokens = useMemo(() => {
    if (!projects || projects.length === 0) return []
    return projects.map(mapProjectToTokenData)
  }, [projects])

  const trendingTokens = useMemo(() => {
    return tokens.filter((t: TokenData) => t.type === 'launched').slice(0, 10)
  }, [tokens])

  const launchedTokens = useMemo(() => {
    return tokens.filter((t: TokenData) => t.type === 'launched')
  }, [tokens])

  const airdropProjects = useMemo(() => {
    return tokens.filter((t: TokenData) => t.type === 'airdrop')
  }, [tokens])

  return (
    <TokenMarketContext.Provider value={{
      tokens,
      selectedToken,
      setSelectedToken,
      trendingTokens,
      launchedTokens,
      airdropProjects,
      isLoading,
      error: error as Error | null
    }}>
      {children}
    </TokenMarketContext.Provider>
  )
}

export function useTokenMarket() {
  const context = useContext(TokenMarketContext)
  if (context === undefined) {
    throw new Error('useTokenMarket must be used within TokenMarketProvider')
  }
  return context
}
